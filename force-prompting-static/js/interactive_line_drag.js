// --- Static Configuration (can remain as constants if they apply to ALL demos) ---
const LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH = 0.25;
const LINE_DEMO_DEBUG_SHOW_FILENAME = true; // Applies to all instances if true
const LINE_DEMO_CLICK_TOLERANCE_RADIUS = 15; // Pixels, for clicking the central bead
// --- End Static Configuration ---

document.addEventListener('DOMContentLoaded', () => {
    // Find all elements intended to be line drag demos
    const demoContainerElements = document.querySelectorAll('.js-line-drag-demo');

    demoContainerElements.forEach(containerElement => {
        // Initialize each demo instance
        initLineDragInstance(containerElement);
    });
});

function initLineDragInstance(containerElement) {
    // --- Instance-specific Configuration (will be set based on containerElement) ---
    let LINE_DEMO_INITIAL_IMAGE_PATH;
    let LINE_DEMO_VIDEOS_BASE_PATH;
    let LINE_DEMO_VIDEO_DATA_PATH;
    let LINE_DEMO_PREDEFINED_FORCES = []; // Will be populated from JSON for this instance

    // --- Get unique elements for this instance ---
    // Child elements are selected by CLASS NAME relative to the current containerElement
    const staticImage = containerElement.querySelector('.line-static-image');
    const canvas = containerElement.querySelector('.line-canvas-overlay');
    const videoPlayer = containerElement.querySelector('.line-video-player');

    // The debug display is a sibling to the containerElement, within the same parent.
    // This selection assumes the HTML structure where debug display is next to or near the container, under the same direct parent.
    const debugFilenameDisplay = containerElement.parentElement.querySelector('.line-debug-filename-display');

    if (!staticImage || !canvas || !videoPlayer) {
        let errorMsg = `Line Drag Demo (${containerElement.id}): Core child elements (img.line-static-image, canvas.line-canvas-overlay, video.line-video-player) not found.`;
        console.error(errorMsg);
        if (debugFilenameDisplay && LINE_DEMO_DEBUG_SHOW_FILENAME) {
            debugFilenameDisplay.textContent = "Error: Core HTML elements for this demo missing.";
            debugFilenameDisplay.style.display = 'block';
            debugFilenameDisplay.style.color = 'red';
        }
        return; // Skip this instance
    }

    const rootDir = containerElement.dataset.rootDir;
    if (!rootDir) {
        const errorMsg = `Line Drag Demo (${containerElement.id}): FATAL ERROR - 'data-root-dir' attribute not found.`;
        console.error(errorMsg);
        if (debugFilenameDisplay && LINE_DEMO_DEBUG_SHOW_FILENAME) {
            debugFilenameDisplay.textContent = errorMsg;
            debugFilenameDisplay.style.color = 'red';
            debugFilenameDisplay.style.display = 'block';
        }
        return; // Skip this instance
    }

    const effectiveRootDir = rootDir.endsWith('/') ? rootDir : rootDir + '/';

    LINE_DEMO_INITIAL_IMAGE_PATH = effectiveRootDir + "initial_frame.png";
    LINE_DEMO_VIDEOS_BASE_PATH = effectiveRootDir + "videos/";
    LINE_DEMO_VIDEO_DATA_PATH = effectiveRootDir + "video_specs.json";

    if (LINE_DEMO_DEBUG_SHOW_FILENAME && !debugFilenameDisplay) {
        console.warn(`Line Drag Demo (${containerElement.id}): Debug display element ('.line-debug-filename-display') not found, but LINE_DEMO_DEBUG_SHOW_FILENAME is true.`);
    }

    videoPlayer.poster = LINE_DEMO_INITIAL_IMAGE_PATH;
    const ctx = canvas.getContext('2d');

    // --- Instance-specific State Variables ---
    let videoData = {};
    let singleCoordKey = null;
    let interactionPointNorm = null;
    let interactionPointPx = null;
    let jsonAllowedAngles = [];
    let lastProjectedDx = 0, lastProjectedDy = 0;

    let isDragging = false;
    let dragOriginX, dragOriginY;
    let imageWidth = 0, imageHeight = 0, maxPixelDragLength = 0;

    // --- Utility Functions (scoped to this instance or can be global if pure) ---
    function findClosestNumericValue(target, values) {
        if (!values || values.length === 0) return null;
        return values.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    }

    function parseCoordString(coordStr) {
        try {
            const parts = coordStr.slice(1, -1).split(',');
            return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
        } catch (e) {
            console.error(`Line Drag Demo (${containerElement.id}): Error parsing coordinate string:`, coordStr, e);
            return null;
        }
    }

    function shortestAngleDistRad(a0, a1) {
        const max = Math.PI * 2;
        const da = (a1 - a0) % max;
        return (2 * da % max) - da;
    }

    function drawGuidanceSliderAndBead() {
        if (!interactionPointPx || jsonAllowedAngles.length === 0 || canvas.width === 0 || canvas.height === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear first

        const centerX = interactionPointPx.x;
        const centerY = interactionPointPx.y;

        const angleRad = jsonAllowedAngles[0] * Math.PI / 180;
        const lineDx = Math.cos(angleRad) * maxPixelDragLength;
        const lineDy = -Math.sin(angleRad) * maxPixelDragLength;

        // Draw dashed guidance lines
        ctx.beginPath();
        ctx.moveTo(centerX - lineDx, centerY - lineDy);
        ctx.lineTo(centerX + lineDx, centerY + lineDy);
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)'; // White dashed lines
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw central bead (circle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, LINE_DEMO_CLICK_TOLERANCE_RADIUS * 0.7, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White circle
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 200, 200, 1)'; // Light grey border for the white circle for better visibility
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawArrow(x1, y1, x2, y2) {
        if (canvas.width === 0 || canvas.height === 0) return;
        // Don't clearRect here, drawGuidanceSliderAndBead or drag mousemove should handle clearing
        
        // Arrow line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 0, 1.0)'; // Yellow arrow line
        ctx.lineWidth = 5; // Increased thickness
        ctx.stroke();

        // Arrow head
        const headLength = 15; // Increased head length for a larger tip
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 0, 1.0)'; // Yellow arrow head
        ctx.fill();
    }

    function switchToStaticImage(clearDebug = true) {
        videoPlayer.style.display = 'none';
        if (!videoPlayer.paused) videoPlayer.pause();

        if (imageWidth > 0 && imageHeight > 0) {
            staticImage.style.display = 'block';
            canvas.style.display = 'block';
            if (interactionPointPx) {
                drawGuidanceSliderAndBead();
            } else {
                 ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear if no point
            }
        } else {
            staticImage.style.display = 'block';
            canvas.style.display = 'none';
        }

        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && clearDebug) {
            const currentText = debugFilenameDisplay.textContent || "";
            if (!currentText.toLowerCase().includes("error") &&
                !currentText.toLowerCase().includes("not found") &&
                !currentText.toLowerCase().includes("loading") &&
                !currentText.toLowerCase().includes("disabled")) {
                debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the white bead.' : `Demo (${containerElement.id}): Interaction disabled.`;
            }
        }
    }

    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth === 0 || imageHeight === 0) {
            // Fallback to natural dimensions if offsetWidth/Height are 0 (e.g. display:none)
            imageWidth = staticImage.naturalWidth;
            imageHeight = staticImage.naturalHeight;
        }
        
        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            videoPlayer.width = imageWidth; // Set video dimensions
            videoPlayer.height = imageHeight;
            maxPixelDragLength = imageWidth * LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH;

            if (interactionPointNorm) {
                interactionPointPx = {
                    x: interactionPointNorm.x * imageWidth,
                    y: interactionPointNorm.y_from_top * imageHeight
                };
            }
        } else {
            console.error(`Line Drag Demo (${containerElement.id}): Failed to get valid dimensions for static image.`, LINE_DEMO_INITIAL_IMAGE_PATH);
            canvas.style.display = 'none'; // Hide canvas if image dimensions are invalid
        }
        switchToStaticImage(false); // Initial draw, don't clear debug if it's showing an error
         if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && (!debugFilenameDisplay.textContent || !debugFilenameDisplay.textContent.toLowerCase().includes("error"))) {
             debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the white bead in the allowed directions.' : `Demo (${containerElement.id}): Interaction disabled - No valid interaction point.`;
         }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;

        staticImage.onload = () => {
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                // This case can happen if the image file is valid but has 0x0 dimensions, or is corrupted in a way that gives 0 dimensions
                console.error(`Line Drag Demo (${containerElement.id}): Static image loaded but naturalWidth/Height is 0. Path: ${LINE_DEMO_INITIAL_IMAGE_PATH}`);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Demo (${containerElement.id}) Error: Static image reports no dimensions.`;
                    debugFilenameDisplay.style.color = 'red';
                }
                staticImage.style.display = 'block'; // Show the (potentially broken) image icon
                canvas.style.display = 'none'; // Hide canvas as it can't be sized
            }
        };
        staticImage.onerror = () => {
            console.error(`Line Drag Demo (${containerElement.id}): Failed to load static image. Path: ${LINE_DEMO_INITIAL_IMAGE_PATH}`);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Demo (${containerElement.id}) Error: Failed to load static image: ${LINE_DEMO_INITIAL_IMAGE_PATH.split('/').pop()}.`;
                debugFilenameDisplay.style.color = 'red';
            }
            // Attempt to show something even if image fails
            staticImage.style.display = 'block'; // Shows broken image icon
            canvas.style.display = 'none';
            videoPlayer.style.display = 'none';
        };

        // Check if image is already loaded (e.g., from cache)
        // Important: also check if the src is already set to the one we want, to avoid re-triggering load for the same image.
        if (staticImage.complete && staticImage.getAttribute('src') === LINE_DEMO_INITIAL_IMAGE_PATH) {
             // Use a small timeout to ensure layout has settled if image was loaded very quickly
             setTimeout(() => {
                if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                    // If imageWidth wasn't set (e.g. display:none initially), set it up.
                    if (!imageWidth || imageWidth === 0) setupImageAndCanvas();
                } else if (staticImage.naturalWidth === 0 && staticImage.src) { 
                    // If it's complete but has no dimensions, and src is set, it's likely an error state
                    staticImage.onerror(); // Manually trigger onerror logic
                }
            }, 50); // 50ms delay, adjust if needed
        }


        // Event Listeners
        containerElement.addEventListener('mousedown', (e) => {
            // If video is playing, clicking should stop it and show static image.
            if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
                switchToStaticImage();
                return; // Don't start new drag if video was playing
            }
            // Ensure all necessary components are ready for interaction
            if (!interactionPointPx || !imageWidth || imageWidth === 0 || maxPixelDragLength === 0) return;

            const rect = containerElement.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;

            // Calculate distance from click to the center of the bead
            const distToCenter = Math.sqrt(Math.pow(clickX - interactionPointPx.x, 2) + Math.pow(clickY - interactionPointPx.y, 2));

            if (distToCenter <= LINE_DEMO_CLICK_TOLERANCE_RADIUS) {
                isDragging = true; // This instance is now dragging
                dragOriginX = interactionPointPx.x;
                dragOriginY = interactionPointPx.y;
                lastProjectedDx = 0; // Reset last projection
                lastProjectedDy = 0;
                e.preventDefault(); // Prevent text selection or other default behaviors
            } else {
                isDragging = false; // Click was outside the bead
            }
        });

        // Mouse move listener on the document to handle dragging outside the element
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return; // Only if this instance is dragging

            const rect = containerElement.getBoundingClientRect(); // Use this instance's container
            let currentX = e.clientX - rect.left;
            let currentY = e.clientY - rect.top;

            // Raw displacement from drag origin
            let rawDx = currentX - dragOriginX;
            let rawDy = currentY - dragOriginY;
            
            // Optimization: if no mouse movement and no previous arrow, don't redraw
            if (rawDx === 0 && rawDy === 0 && lastProjectedDx === 0 && lastProjectedDy === 0) {
                return;
            }
            
            // Angle of the mouse movement
            const mouseAngleRad = Math.atan2(-rawDy, rawDx); // Negative dy because canvas y is inverted
            
            // Allowed angles (converted to radians)
            const angle1Rad = jsonAllowedAngles[0] * Math.PI / 180;
            const angle2Rad = jsonAllowedAngles[1] * Math.PI / 180;

            // Determine which of the two allowed axes is closer to the mouse angle
            const diffToAngle1 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle1Rad));
            const diffToAngle2 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle2Rad));
            const chosenAxisAngleRad = (diffToAngle1 < diffToAngle2) ? angle1Rad : angle2Rad;

            // Project the raw displacement onto the chosen axis
            const axisUnitDx = Math.cos(chosenAxisAngleRad);
            const axisUnitDy = -Math.sin(chosenAxisAngleRad); // Negative sin for canvas y-coordinates
            const projectedScalar = rawDx * axisUnitDx + rawDy * axisUnitDy; // Dot product

            // Calculate the projected displacement vector
            let projectedDx = projectedScalar * axisUnitDx;
            let projectedDy = projectedScalar * axisUnitDy;
            let dragDistance = Math.sqrt(projectedDx * projectedDx + projectedDy * projectedDy);

            // Clamp the drag distance to the maximum allowed
            if (dragDistance > maxPixelDragLength) {
                const ratio = maxPixelDragLength / dragDistance;
                projectedDx *= ratio;
                projectedDy *= ratio;
            }
            lastProjectedDx = projectedDx; // Store for mouseup
            lastProjectedDy = projectedDy;

            drawGuidanceSliderAndBead(); // Redraw bead and guidance line (also clears)
            // Only draw arrow if there's significant projected movement
            if (Math.sqrt(projectedDx*projectedDx + projectedDy*projectedDy) > 1) { // Threshold to avoid tiny arrows
                 drawArrow(dragOriginX, dragOriginY, dragOriginX + projectedDx, dragOriginY + projectedDy);
            }
        });

        // Mouse up listener on the document to end drag universally
        document.addEventListener('mouseup', () => {
            if (!isDragging || !interactionPointPx) { // Only act if this instance was dragging
                isDragging = false; // Ensure it's reset if somehow missed
                return;
            }
            isDragging = false; // Stop dragging for this instance

            // Check for necessary data before proceeding
            if (Object.keys(videoData).length === 0 || !singleCoordKey) { switchToStaticImage(); return; }
            if (!imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) { switchToStaticImage(); return; }

            const pixelLength = Math.sqrt(lastProjectedDx * lastProjectedDx + lastProjectedDy * lastProjectedDy);

            // If drag was too short, just revert to static image with bead
            if (pixelLength < 5) { // Minimum drag threshold to trigger video
                switchToStaticImage(); // Redraws bead without arrow
                return;
            }

            const coordData = videoData[singleCoordKey];
            if (!coordData) { switchToStaticImage(); return; }

            // Determine the chosen angle based on the drag direction
            let actualAngleDeg = Math.atan2(-lastProjectedDy, lastProjectedDx) * (180 / Math.PI);
            if (actualAngleDeg < 0) actualAngleDeg += 360; // Normalize to 0-360

            const angle1 = jsonAllowedAngles[0];
            const angle2 = jsonAllowedAngles[1];
            // Calculate difference to each allowed angle, handling wrap-around
            let diff1 = Math.abs(actualAngleDeg - angle1); if (diff1 > 180) diff1 = 360 - diff1;
            let diff2 = Math.abs(actualAngleDeg - angle2); if (diff2 > 180) diff2 = 360 - diff2;
            const chosenAngleForVideo = (diff1 < diff2) ? angle1 : angle2;
            const closestAngleKey = chosenAngleForVideo.toFixed(2); // Match JSON key format

            // Determine the force magnitude
            const normalizedForce = pixelLength / maxPixelDragLength;
            const targetNumericForce = findClosestNumericValue(normalizedForce, LINE_DEMO_PREDEFINED_FORCES);

            if (targetNumericForce === null) { switchToStaticImage(); return; }
            const targetForceKey = targetNumericForce.toFixed(3); // Match JSON key format

            const angleData = coordData[closestAngleKey];
            if (!angleData) { switchToStaticImage(); return; }

            const videoFileArray = angleData[targetForceKey];
            if (videoFileArray && videoFileArray.length > 0) {
                const videoFilename = videoFileArray[0]; // Assuming the first video in array is the one to play

                // Keep the arrow drawn during video load by redrawing
                drawGuidanceSliderAndBead();
                drawArrow(dragOriginX, dragOriginY, dragOriginX + lastProjectedDx, dragOriginY + lastProjectedDy);

                videoPlayer.style.display = 'none'; // Hide video player initially
                if (!videoPlayer.paused) videoPlayer.pause(); // Pause if it was somehow playing

                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Loading: ${videoFilename}`;
                }
                videoPlayer.src = LINE_DEMO_VIDEOS_BASE_PATH + videoFilename;

                const onVideoReadyToPlay = () => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay); // Clean up listener
                    videoPlayer.removeEventListener('error', onVideoLoadError); // Clean up error listener
                    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Playing: ${videoFilename}`;
                    }
                    staticImage.style.display = 'none'; // Hide static image
                    canvas.style.display = 'none'; // Hide canvas overlay
                    videoPlayer.style.display = 'block'; // Show video player
                    videoPlayer.play().catch(err => {
                        console.error(`Line Drag Demo (${containerElement.id}): Error playing video:`, err);
                        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                        switchToStaticImage(); // Fallback to static image on play error
                    });
                };
                const onVideoLoadError = (e) => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay); // Clean up listener
                    videoPlayer.removeEventListener('error', onVideoLoadError); // Clean up error listener
                    console.error(`Line Drag Demo (${containerElement.id}): Error loading video data for ${videoFilename}:`, e);
                     if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error loading: ${videoFilename}`;
                    switchToStaticImage(); // Fallback to static image on load error
                };

                videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.addEventListener('error', onVideoLoadError);
                videoPlayer.load(); // Start loading the video
            } else {
                 if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Video not found for force ${targetForceKey} at angle ${closestAngleKey}.`;
                }
                switchToStaticImage(); // Fallback if no video file found
            }
        });

        // Video player event listeners
        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => {
            // This is a general error handler for the video element itself
            const currentVideoSrc = videoPlayer.currentSrc || "unknown video";
            console.error(`Line Drag Demo (${containerElement.id}): Video player error event.`, e, "Video source:", currentVideoSrc);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Video player error for: ${currentVideoSrc.split('/').pop()}`;
            }
            switchToStaticImage(); // Always revert to static image on video error
        });
    }

    // --- Initialize This Instance ---
    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
        debugFilenameDisplay.textContent = `Demo (${containerElement.id}): Loading video data...`;
        debugFilenameDisplay.style.display = 'block'; // Ensure visible
    }

    fetch(LINE_DEMO_VIDEO_DATA_PATH)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} fetching ${LINE_DEMO_VIDEO_DATA_PATH}`);
            }
            return response.json();
        })
        .then(data => {
            videoData = data;
            const coordKeys = Object.keys(videoData);
            if (coordKeys.length !== 1) {
                throw new Error(`video_specs.json for ${effectiveRootDir} must contain exactly one coordinate key. Found: ${coordKeys.length} (${coordKeys.join(', ')})`);
            }
            singleCoordKey = coordKeys[0];
            const parsedCoords = parseCoordString(singleCoordKey);
            if (!parsedCoords) {
                throw new Error(`Could not parse coordinate key: ${singleCoordKey} for ${effectiveRootDir}`);
            }
            // Convert y from bottom (standard in JSON) to y from top (standard for canvas)
            interactionPointNorm = { x: parsedCoords.x, y_from_top: 1.0 - parsedCoords.y };

            // Extract allowed angles and forces from the loaded data
            const angleDataForForceExtraction = videoData[singleCoordKey];
            const angleKeys = Object.keys(angleDataForForceExtraction);
            if (angleKeys.length !== 2) {
                // This demo specifically expects two angles (forming a line)
                throw new Error(`Expected 2 angles for interaction point ${singleCoordKey} in ${effectiveRootDir}, found ${angleKeys.length}: ${angleKeys.join(', ')}`);
            }
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a,b) => a-b); // Store as numbers, sorted

            // Validate that angles are 180 degrees apart
            const angleDiff = Math.abs(jsonAllowedAngles[0] - jsonAllowedAngles[1]);
            if (Math.abs(angleDiff - 180) > 0.1 && Math.abs((angleDiff % 360) - 180) > 0.1 ) { // Check direct and wrapped difference
                 throw new Error(`Angles ${jsonAllowedAngles[0]}° and ${jsonAllowedAngles[1]}° in ${effectiveRootDir} are not 180° apart. Difference: ${angleDiff}°`);
            }

            // Extract predefined forces (strengths) from one of the angles (assuming they are consistent)
            const firstAngleKey = angleKeys[0];
            const forcesData = angleDataForForceExtraction[firstAngleKey];
            if (!forcesData || Object.keys(forcesData).length === 0) {
                throw new Error(`No force data found under angle ${firstAngleKey} for coordinate ${singleCoordKey} in ${effectiveRootDir}.`);
            }
            LINE_DEMO_PREDEFINED_FORCES = Object.keys(forcesData).map(f => parseFloat(f)).sort((a, b) => a - b);
            if (LINE_DEMO_PREDEFINED_FORCES.length === 0) {
                throw new Error(`No forces could be extracted from video_specs.json for ${effectiveRootDir}.`);
            }

            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                 debugFilenameDisplay.textContent = `Demo (${containerElement.id}): Data loaded. Initializing image...`;
            }
            initializeInteractiveDemo(); // Proceed to initialize with image and canvas
        })
        .catch(error => {
            console.error(`Line Drag Demo (${containerElement.id}): Fatal Error processing video data or initializing:`, error);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Demo (${containerElement.id}) FATAL ERROR: ${error.message.substring(0, 100)}...`; // Keep message short
                debugFilenameDisplay.style.color = 'red';
            }
            // Ensure these are reset so the demo doesn't try to use invalid data
            interactionPointNorm = null;
            jsonAllowedAngles = [];
            // Attempt to initialize in a degraded state (e.g., just show static image or error)
            initializeInteractiveDemo(); 
        });
}
