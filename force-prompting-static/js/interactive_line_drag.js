// --- Dynamic Configuration (will be set after DOMContentLoaded) ---
let LINE_DEMO_INITIAL_IMAGE_PATH;
let LINE_DEMO_VIDEOS_BASE_PATH;
let LINE_DEMO_VIDEO_DATA_PATH;
let LINE_DEMO_PREDEFINED_FORCES = []; // Will be populated from JSON

// --- Static Configuration (can remain as constants) ---
const LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH = 0.25;
const LINE_DEMO_DEBUG_SHOW_FILENAME = true;
const LINE_DEMO_CLICK_TOLERANCE_RADIUS = 15; // Pixels, for clicking the central bead
// --- End Configuration ---

// Ensure this script runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // IDs for this specific line drag demo instance
    const containerId = 'lineDemoContainer';
    const staticImageId = 'lineStaticImage';
    const canvasId = 'lineCanvasOverlay';
    const videoPlayerId = 'lineVideoPlayer';
    const debugDisplayId = 'lineDebugFilenameDisplay';

    const container = document.getElementById(containerId);
    const staticImage = document.getElementById(staticImageId);
    const canvas = document.getElementById(canvasId);
    const videoPlayer = document.getElementById(videoPlayerId);
    const debugFilenameDisplay = document.getElementById(debugDisplayId);

    if (!container || !staticImage || !canvas || !videoPlayer) {
        console.error(`Line Drag Demo: Core elements not found! Ensure HTML has IDs: ${containerId}, ${staticImageId}, ${canvasId}, ${videoPlayerId}.`);
        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            debugFilenameDisplay.textContent = "Error: Core HTML elements for line drag demo missing.";
            debugFilenameDisplay.style.display = 'block';
        }
        return;
    }

    const rootDir = container.dataset.rootDir;
    if (!rootDir) {
        const errorMsg = `Line Drag Demo: FATAL ERROR - 'data-root-dir' attribute not found on container '${containerId}'.`;
        console.error(errorMsg);
        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            debugFilenameDisplay.textContent = errorMsg;
            debugFilenameDisplay.style.color = 'red';
            debugFilenameDisplay.style.display = 'block';
        }
        return;
    }

    // Ensure rootDir ends with a slash
    const effectiveRootDir = rootDir.endsWith('/') ? rootDir : rootDir + '/';

    // Dynamically define paths
    LINE_DEMO_INITIAL_IMAGE_PATH = effectiveRootDir + "initial_frame.png";
    LINE_DEMO_VIDEOS_BASE_PATH = effectiveRootDir + "videos/";
    LINE_DEMO_VIDEO_DATA_PATH = effectiveRootDir + "video_specs.json";


    if (LINE_DEMO_DEBUG_SHOW_FILENAME && !debugFilenameDisplay) {
        console.warn(`Line Drag Demo: Debug display element ('${debugDisplayId}') not found, but LINE_DEMO_DEBUG_SHOW_FILENAME is true.`);
    }

    videoPlayer.poster = LINE_DEMO_INITIAL_IMAGE_PATH; // Set poster early, might be overwritten if image load fails
    const ctx = canvas.getContext('2d');

    let videoData = {};
    let singleCoordKey = null;
    let interactionPointNorm = null; // {x: normX, y: normY_from_top}
    let interactionPointPx = null;   // {x: pxX, y: pxY_from_top}
    let jsonAllowedAngles = [];      // [angle1_deg, angle2_deg]
    let lastProjectedDx = 0, lastProjectedDy = 0;

    let isDragging = false;
    let dragOriginX, dragOriginY;
    let imageWidth = 0, imageHeight = 0, maxPixelDragLength = 0;

    // --- Utility Functions ---
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
            console.error("Line Drag Demo: Error parsing coordinate string:", coordStr, e);
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

        const centerX = interactionPointPx.x;
        const centerY = interactionPointPx.y;

        // Only draw one line representing the axis (two angles 180 deg apart define one axis)
        const angleRad = jsonAllowedAngles[0] * Math.PI / 180;
        const lineDx = Math.cos(angleRad) * maxPixelDragLength;
        const lineDy = -Math.sin(angleRad) * maxPixelDragLength; // Negative because canvas Y increases downwards

        ctx.beginPath();
        ctx.moveTo(centerX - lineDx, centerY - lineDy);
        ctx.lineTo(centerX + lineDx, centerY + lineDy);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw central bead
        ctx.beginPath();
        ctx.arc(centerX, centerY, LINE_DEMO_CLICK_TOLERANCE_RADIUS * 0.7, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 50, 150, 1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawArrow(x1, y1, x2, y2) {
        if (canvas.width === 0 || canvas.height === 0) return;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();

        const headLength = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fill();
    }

    function switchToStaticImage(clearDebug = true) {
        videoPlayer.style.display = 'none';
        if (!videoPlayer.paused) videoPlayer.pause();

        if (imageWidth > 0 && imageHeight > 0) {
            staticImage.style.display = 'block';
            canvas.style.display = 'block'; // Ensure canvas is visible
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (interactionPointPx) { // Redraw bead and line if interaction point is known
                drawGuidanceSliderAndBead();
            }
        } else {
             // If image dimensions are unknown, still try to show static image placeholder if src is set
            staticImage.style.display = 'block';
            canvas.style.display = 'none'; // Hide canvas if no dimensions
        }

        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && clearDebug) {
            const currentText = debugFilenameDisplay.textContent || "";
            // Avoid clearing error messages or initial loading messages
            if (!currentText.toLowerCase().includes("error") &&
                !currentText.toLowerCase().includes("not found") &&
                !currentText.toLowerCase().includes("loading") &&
                !currentText.toLowerCase().includes("disabled")) {
                debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead.' : 'Line Drag Demo: Interaction disabled.';
                debugFilenameDisplay.style.display = 'block';
            }
        }
    }

    function setupImageAndCanvas() {
        // Try to get dimensions from offsetWidth first, then naturalWidth
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth === 0 || imageHeight === 0) { // Fallback to natural dimensions if offset is 0
            imageWidth = staticImage.naturalWidth;
            imageHeight = staticImage.naturalHeight;
        }
        
        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            videoPlayer.width = imageWidth;
            videoPlayer.height = imageHeight;
            maxPixelDragLength = imageWidth * LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH;

            if (interactionPointNorm) { // If normalized interaction point is known
                interactionPointPx = {
                    x: interactionPointNorm.x * imageWidth,
                    y: interactionPointNorm.y_from_top * imageHeight
                };
            }
            // switchToStaticImage will handle drawing guidance if interactionPointPx is set
        } else {
            console.error("Line Drag Demo: Failed to get valid dimensions for static image.", LINE_DEMO_INITIAL_IMAGE_PATH);
            canvas.style.display = 'none'; // Hide canvas if image dimensions are invalid
        }
        switchToStaticImage(false); // Update display, don't clear debug message yet
         if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && (!debugFilenameDisplay.textContent || !debugFilenameDisplay.textContent.toLowerCase().includes("error"))) {
             debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead in the allowed directions.' : 'Line Drag Demo: Interaction disabled - No valid interaction point.';
         }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;

        staticImage.onload = () => {
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas(); // This will also draw the bead via switchToStaticImage
            } else {
                // This case might indicate a valid image file that is somehow 0x0
                console.error("Line Drag Demo: Static image loaded but naturalWidth/Height is 0.", LINE_DEMO_INITIAL_IMAGE_PATH);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = "Line Drag Demo Error: Static image reports no dimensions.";
                    debugFilenameDisplay.style.display = 'block';
                    debugFilenameDisplay.style.color = 'red';
                }
                staticImage.style.display = 'block'; // Show broken image icon perhaps
                canvas.style.display = 'none';
            }
        };
        staticImage.onerror = () => {
            console.error("Line Drag Demo: Failed to load static image.", LINE_DEMO_INITIAL_IMAGE_PATH);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Line Drag Demo Error: Failed to load static image: ${LINE_DEMO_INITIAL_IMAGE_PATH}.`;
                debugFilenameDisplay.style.display = 'block';
                debugFilenameDisplay.style.color = 'red';
            }
            // Attempt to show video player's poster (which should also be LINE_DEMO_INITIAL_IMAGE_PATH)
            // or leave it to the browser's default for a broken image link.
            staticImage.style.display = 'block'; // Or 'none' if you prefer nothing for a broken initial image
            canvas.style.display = 'none';
            videoPlayer.style.display = 'none'; // Ensure video player is hidden
        };

        // Handle cases where image might be cached and 'load' event doesn't fire reliably
        if (staticImage.complete && staticImage.getAttribute('src') === LINE_DEMO_INITIAL_IMAGE_PATH) {
             setTimeout(() => { // Use timeout to ensure dimensions are available
                if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                    if (!imageWidth || imageWidth === 0) setupImageAndCanvas(); // If not already set up
                } else if (staticImage.naturalWidth === 0 && staticImage.src) { // Loaded but 0 dimensions
                    staticImage.onerror(); // Trigger error handling
                }
            }, 50); // 50ms delay, adjust if necessary
        }


        container.addEventListener('mousedown', (e) => {
            if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
                switchToStaticImage(); // If video is playing, click stops it and returns to static image
            }
            // Ensure interaction point, image dimensions, and drag length are valid
            if (!interactionPointPx || !imageWidth || imageWidth === 0 || maxPixelDragLength === 0) return;

            const rect = container.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;

            const distToCenter = Math.sqrt(Math.pow(clickX - interactionPointPx.x, 2) + Math.pow(clickY - interactionPointPx.y, 2));

            if (distToCenter <= LINE_DEMO_CLICK_TOLERANCE_RADIUS) {
                isDragging = true;
                dragOriginX = interactionPointPx.x; // Start drag from the bead's center
                dragOriginY = interactionPointPx.y;
                lastProjectedDx = 0; // Reset last projection
                lastProjectedDy = 0;
                e.preventDefault(); // Prevent default browser drag behavior
            } else {
                isDragging = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return; // Need interaction point and defined angles

            const rect = container.getBoundingClientRect();
            let currentX = e.clientX - rect.left;
            let currentY = e.clientY - rect.top;

            let rawDx = currentX - dragOriginX;
            let rawDy = currentY - dragOriginY;

            // If no actual movement, clear canvas and redraw bead (removes old arrow)
            if (rawDx === 0 && rawDy === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGuidanceSliderAndBead();
                lastProjectedDx = 0; lastProjectedDy = 0;
                return;
            }
            
            const mouseAngleRad = Math.atan2(-rawDy, rawDx); // Y is inverted in screen coords for math angle
            
            // Determine which of the two allowed angles (180 deg apart) the mouse is closest to
            const angle1Rad = jsonAllowedAngles[0] * Math.PI / 180;
            const angle2Rad = jsonAllowedAngles[1] * Math.PI / 180; // Should be angle1Rad + PI

            const diffToAngle1 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle1Rad));
            const diffToAngle2 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle2Rad));

            const chosenAxisAngleRad = (diffToAngle1 < diffToAngle2) ? angle1Rad : angle2Rad;

            // Project mouse vector onto the chosen axis
            const axisUnitDx = Math.cos(chosenAxisAngleRad);
            const axisUnitDy = -Math.sin(chosenAxisAngleRad); // Negative for canvas Y up = math Y down
            
            const projectedScalar = rawDx * axisUnitDx + rawDy * axisUnitDy; // Dot product

            let projectedDx = projectedScalar * axisUnitDx;
            let projectedDy = projectedScalar * axisUnitDy;

            let dragDistance = Math.sqrt(projectedDx * projectedDx + projectedDy * projectedDy);

            if (dragDistance > maxPixelDragLength) {
                const ratio = maxPixelDragLength / dragDistance;
                projectedDx *= ratio;
                projectedDy *= ratio;
            }
            lastProjectedDx = projectedDx;
            lastProjectedDy = projectedDy;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGuidanceSliderAndBead(); // Redraw bead and guidance line
            // Draw arrow only if there's a significant projected movement
            if (Math.sqrt(projectedDx*projectedDx + projectedDy*projectedDy) > 1) { // Threshold to avoid tiny arrows
                 drawArrow(dragOriginX, dragOriginY, dragOriginX + projectedDx, dragOriginY + projectedDy);
            }
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging || !interactionPointPx) { isDragging = false; return; }
            isDragging = false;

            if (Object.keys(videoData).length === 0 || !singleCoordKey) { switchToStaticImage(); return; }
            if (!imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) { switchToStaticImage(); return; }

            const pixelLength = Math.sqrt(lastProjectedDx * lastProjectedDx + lastProjectedDy * lastProjectedDy);

            // If drag was too short, don't play video
            if (pixelLength < 5) { // Minimum drag distance to trigger video
                switchToStaticImage();
                return;
            }

            const coordData = videoData[singleCoordKey];
            if (!coordData) { switchToStaticImage(); return; }

            // Determine chosen angle based on last projected direction
            let actualAngleDeg = Math.atan2(-lastProjectedDy, lastProjectedDx) * (180 / Math.PI);
            if (actualAngleDeg < 0) actualAngleDeg += 360; // Normalize to 0-360

            const angle1 = jsonAllowedAngles[0];
            const angle2 = jsonAllowedAngles[1];

            // Simplified angle choice based on lastProjectedDx/Dy
            let diff1 = Math.abs(actualAngleDeg - angle1); if (diff1 > 180) diff1 = 360 - diff1;
            let diff2 = Math.abs(actualAngleDeg - angle2); if (diff2 > 180) diff2 = 360 - diff2;

            const chosenAngleForVideo = (diff1 < diff2) ? angle1 : angle2;
            const closestAngleKey = chosenAngleForVideo.toFixed(2);

            // Normalize force and find closest predefined force
            const normalizedForce = pixelLength / maxPixelDragLength;
            const targetNumericForce = findClosestNumericValue(normalizedForce, LINE_DEMO_PREDEFINED_FORCES);

            if (targetNumericForce === null) { switchToStaticImage(); return; }
            const targetForceKey = targetNumericForce.toFixed(3);

            const angleData = coordData[closestAngleKey];
            if (!angleData) { switchToStaticImage(); return; }

            const videoFileArray = angleData[targetForceKey];
            if (videoFileArray && videoFileArray.length > 0) {
                const videoFilename = videoFileArray[0]; // Assuming first video in array is the one to play

                // Keep the arrow drawn during video load
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGuidanceSliderAndBead();
                drawArrow(dragOriginX, dragOriginY, dragOriginX + lastProjectedDx, dragOriginY + lastProjectedDy);

                videoPlayer.style.display = 'none'; // Hide player initially
                if (!videoPlayer.paused) videoPlayer.pause(); // Ensure paused

                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Loading: ${videoFilename}`;
                }
                videoPlayer.src = LINE_DEMO_VIDEOS_BASE_PATH + videoFilename;

                const onVideoReadyToPlay = () => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError); // Clean up error listener too
                    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Playing: ${videoFilename}`;
                    }
                    staticImage.style.display = 'none';
                    canvas.style.display = 'none'; // Hide canvas overlay during video playback
                    videoPlayer.style.display = 'block';
                    videoPlayer.play().catch(err => {
                        console.error("Line Drag Demo: Error playing video:", err);
                        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                        switchToStaticImage();
                    });
                };
                const onVideoLoadError = (e) => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError);
                    console.error(`Line Drag Demo: Error loading video data for ${videoFilename}:`, e);
                     if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error loading: ${videoFilename}`;
                    switchToStaticImage();
                };

                videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.addEventListener('error', onVideoLoadError);
                videoPlayer.load(); // Start loading the video
            } else {
                 if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Video not found for force ${targetForceKey} at angle ${closestAngleKey}.`;
                }
                switchToStaticImage();
            }
        });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => {
            // This is a generic error handler for the video element itself (e.g., network issue, unsupported format)
            const currentVideoSrc = videoPlayer.currentSrc || "unknown video";
            console.error("Line Drag Demo: Video player error event.", e, "Video source:", currentVideoSrc);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Video player error for: ${currentVideoSrc.split('/').pop()}`;
            }
            switchToStaticImage(); // Switch back to static image on error
        });
    }

    // Initial message before fetching JSON
    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
        debugFilenameDisplay.textContent = "Line Drag Demo: Loading video data...";
        debugFilenameDisplay.style.display = 'block';
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
                throw new Error(`video_specs.json must contain exactly one coordinate key. Found: ${coordKeys.length} (${coordKeys.join(', ')})`);
            }
            singleCoordKey = coordKeys[0];
            const parsedCoords = parseCoordString(singleCoordKey);
            if (!parsedCoords) {
                throw new Error(`Could not parse coordinate key: ${singleCoordKey}`);
            }
            // Convert to normalized Y from top for consistency with mouse events
            interactionPointNorm = { x: parsedCoords.x, y_from_top: 1.0 - parsedCoords.y };

            const angleDataForForceExtraction = videoData[singleCoordKey];
            const angleKeys = Object.keys(angleDataForForceExtraction);
            if (angleKeys.length !== 2) { // Expecting two angles that are 180 degrees apart
                throw new Error(`Expected 2 angles for interaction point ${singleCoordKey}, found ${angleKeys.length}: ${angleKeys.join(', ')}`);
            }
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a,b) => a-b);

            // Validate angles are approximately 180 degrees apart
            const angleDiff = Math.abs(jsonAllowedAngles[0] - jsonAllowedAngles[1]);
            if (Math.abs(angleDiff - 180) > 0.1 && Math.abs((angleDiff % 360) - 180) > 0.1 ) { // Check direct and wrapped difference
                 throw new Error(`Angles ${jsonAllowedAngles[0]}° and ${jsonAllowedAngles[1]}° are not 180° apart. Difference: ${angleDiff}°`);
            }

            // Extract forces from the first angle's data (assuming forces are consistent across angles)
            const firstAngleKey = angleKeys[0];
            const forcesData = angleDataForForceExtraction[firstAngleKey];
            if (!forcesData || Object.keys(forcesData).length === 0) {
                throw new Error(`No force data found under angle ${firstAngleKey} for coordinate ${singleCoordKey}.`);
            }
            LINE_DEMO_PREDEFINED_FORCES = Object.keys(forcesData).map(f => parseFloat(f)).sort((a, b) => a - b);
            if (LINE_DEMO_PREDEFINED_FORCES.length === 0) {
                throw new Error('No forces could be extracted from video_specs.json.');
            }

            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                 debugFilenameDisplay.textContent = "Line Drag Demo: Data loaded. Initializing image...";
            }
            initializeInteractiveDemo(); // Now initialize with all paths and forces known
        })
        .catch(error => {
            console.error("Line Drag Demo: Fatal Error processing video data or initializing:", error);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Line Drag Demo FATAL ERROR: ${error.message}`;
                debugFilenameDisplay.style.color = 'red';
            }
            interactionPointNorm = null; // Disable interaction if data is bad
            jsonAllowedAngles = [];
            // Still attempt to initialize the visual components, it might show an error or a static image.
            initializeInteractiveDemo();
        });
});