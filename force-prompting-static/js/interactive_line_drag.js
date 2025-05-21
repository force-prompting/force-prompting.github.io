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

        ctx.beginPath();
        ctx.moveTo(centerX - lineDx, centerY - lineDy);
        ctx.lineTo(centerX + lineDx, centerY + lineDy);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

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
        // Don't clearRect here, drawGuidanceSliderAndBead or drag mousemove should handle clearing
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
            canvas.style.display = 'block';
            // ctx.clearRect(0, 0, canvas.width, canvas.height); // drawGuidanceSliderAndBead will clear and draw
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
                debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead.' : `Demo (${containerElement.id}): Interaction disabled.`;
            }
        }
    }

    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth === 0 || imageHeight === 0) {
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
            canvas.style.display = 'none';
        }
        switchToStaticImage(false); 
         if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && (!debugFilenameDisplay.textContent || !debugFilenameDisplay.textContent.toLowerCase().includes("error"))) {
             debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead in the allowed directions.' : `Demo (${containerElement.id}): Interaction disabled - No valid interaction point.`;
         }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;

        staticImage.onload = () => {
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                console.error(`Line Drag Demo (${containerElement.id}): Static image loaded but naturalWidth/Height is 0.`, LINE_DEMO_INITIAL_IMAGE_PATH);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Demo (${containerElement.id}) Error: Static image reports no dimensions.`;
                    debugFilenameDisplay.style.color = 'red';
                }
                staticImage.style.display = 'block';
                canvas.style.display = 'none';
            }
        };
        staticImage.onerror = () => {
            console.error(`Line Drag Demo (${containerElement.id}): Failed to load static image.`, LINE_DEMO_INITIAL_IMAGE_PATH);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Demo (${containerElement.id}) Error: Failed to load static image: ${LINE_DEMO_INITIAL_IMAGE_PATH.split('/').pop()}.`;
                debugFilenameDisplay.style.color = 'red';
            }
            staticImage.style.display = 'block';
            canvas.style.display = 'none';
            videoPlayer.style.display = 'none';
        };

        if (staticImage.complete && staticImage.getAttribute('src') === LINE_DEMO_INITIAL_IMAGE_PATH) {
             setTimeout(() => {
                if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                    if (!imageWidth || imageWidth === 0) setupImageAndCanvas();
                } else if (staticImage.naturalWidth === 0 && staticImage.src) {
                    staticImage.onerror();
                }
            }, 50);
        }

        containerElement.addEventListener('mousedown', (e) => {
            if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
                switchToStaticImage();
                return; // Don't start new drag if video was playing
            }
            if (!interactionPointPx || !imageWidth || imageWidth === 0 || maxPixelDragLength === 0) return;

            const rect = containerElement.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;

            const distToCenter = Math.sqrt(Math.pow(clickX - interactionPointPx.x, 2) + Math.pow(clickY - interactionPointPx.y, 2));

            if (distToCenter <= LINE_DEMO_CLICK_TOLERANCE_RADIUS) {
                isDragging = true; // This instance is now dragging
                dragOriginX = interactionPointPx.x;
                dragOriginY = interactionPointPx.y;
                lastProjectedDx = 0;
                lastProjectedDy = 0;
                e.preventDefault();
            } else {
                isDragging = false;
            }
        });

        // Document-level listeners will check the 'isDragging' flag of the instance
        // that set it.
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return;

            const rect = containerElement.getBoundingClientRect(); // Use this instance's container
            let currentX = e.clientX - rect.left;
            let currentY = e.clientY - rect.top;

            let rawDx = currentX - dragOriginX;
            let rawDy = currentY - dragOriginY;
            
            if (rawDx === 0 && rawDy === 0 && lastProjectedDx === 0 && lastProjectedDy === 0) {
                // If no movement AND no previous arrow, just ensure bead is drawn
                // drawGuidanceSliderAndBead(); // Will clear and redraw bead
                return;
            }
            
            const mouseAngleRad = Math.atan2(-rawDy, rawDx);
            
            const angle1Rad = jsonAllowedAngles[0] * Math.PI / 180;
            const angle2Rad = jsonAllowedAngles[1] * Math.PI / 180;

            const diffToAngle1 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle1Rad));
            const diffToAngle2 = Math.abs(shortestAngleDistRad(mouseAngleRad, angle2Rad));
            const chosenAxisAngleRad = (diffToAngle1 < diffToAngle2) ? angle1Rad : angle2Rad;

            const axisUnitDx = Math.cos(chosenAxisAngleRad);
            const axisUnitDy = -Math.sin(chosenAxisAngleRad);
            const projectedScalar = rawDx * axisUnitDx + rawDy * axisUnitDy;

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

            // ctx.clearRect(0, 0, canvas.width, canvas.height); // drawGuidanceSliderAndBead does this
            drawGuidanceSliderAndBead(); // Redraw bead and guidance line (also clears)
            if (Math.sqrt(projectedDx*projectedDx + projectedDy*projectedDy) > 1) {
                 drawArrow(dragOriginX, dragOriginY, dragOriginX + projectedDx, dragOriginY + projectedDy);
            }
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging || !interactionPointPx) { // Only act if this instance was dragging
                isDragging = false; // Ensure it's reset if somehow missed
                return;
            }
            isDragging = false; // Stop dragging for this instance

            if (Object.keys(videoData).length === 0 || !singleCoordKey) { switchToStaticImage(); return; }
            if (!imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) { switchToStaticImage(); return; }

            const pixelLength = Math.sqrt(lastProjectedDx * lastProjectedDx + lastProjectedDy * lastProjectedDy);

            if (pixelLength < 5) {
                switchToStaticImage(); // Redraws bead without arrow
                return;
            }

            const coordData = videoData[singleCoordKey];
            if (!coordData) { switchToStaticImage(); return; }

            let actualAngleDeg = Math.atan2(-lastProjectedDy, lastProjectedDx) * (180 / Math.PI);
            if (actualAngleDeg < 0) actualAngleDeg += 360;

            const angle1 = jsonAllowedAngles[0];
            const angle2 = jsonAllowedAngles[1];
            let diff1 = Math.abs(actualAngleDeg - angle1); if (diff1 > 180) diff1 = 360 - diff1;
            let diff2 = Math.abs(actualAngleDeg - angle2); if (diff2 > 180) diff2 = 360 - diff2;
            const chosenAngleForVideo = (diff1 < diff2) ? angle1 : angle2;
            const closestAngleKey = chosenAngleForVideo.toFixed(2);

            const normalizedForce = pixelLength / maxPixelDragLength;
            const targetNumericForce = findClosestNumericValue(normalizedForce, LINE_DEMO_PREDEFINED_FORCES);

            if (targetNumericForce === null) { switchToStaticImage(); return; }
            const targetForceKey = targetNumericForce.toFixed(3);

            const angleData = coordData[closestAngleKey];
            if (!angleData) { switchToStaticImage(); return; }

            const videoFileArray = angleData[targetForceKey];
            if (videoFileArray && videoFileArray.length > 0) {
                const videoFilename = videoFileArray[0];

                // Keep the arrow drawn during video load by redrawing
                // ctx.clearRect(0, 0, canvas.width, canvas.height); // Done by drawGuidanceSliderAndBead
                drawGuidanceSliderAndBead();
                drawArrow(dragOriginX, dragOriginY, dragOriginX + lastProjectedDx, dragOriginY + lastProjectedDy);

                videoPlayer.style.display = 'none';
                if (!videoPlayer.paused) videoPlayer.pause();

                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Loading: ${videoFilename}`;
                }
                videoPlayer.src = LINE_DEMO_VIDEOS_BASE_PATH + videoFilename;

                const onVideoReadyToPlay = () => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError);
                    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Playing: ${videoFilename}`;
                    }
                    staticImage.style.display = 'none';
                    canvas.style.display = 'none';
                    videoPlayer.style.display = 'block';
                    videoPlayer.play().catch(err => {
                        console.error(`Line Drag Demo (${containerElement.id}): Error playing video:`, err);
                        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                        switchToStaticImage();
                    });
                };
                const onVideoLoadError = (e) => {
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError);
                    console.error(`Line Drag Demo (${containerElement.id}): Error loading video data for ${videoFilename}:`, e);
                     if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error loading: ${videoFilename}`;
                    switchToStaticImage();
                };

                videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.addEventListener('error', onVideoLoadError);
                videoPlayer.load();
            } else {
                 if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Video not found for force ${targetForceKey} at angle ${closestAngleKey}.`;
                }
                switchToStaticImage();
            }
        });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => {
            const currentVideoSrc = videoPlayer.currentSrc || "unknown video";
            console.error(`Line Drag Demo (${containerElement.id}): Video player error event.`, e, "Video source:", currentVideoSrc);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Video player error for: ${currentVideoSrc.split('/').pop()}`;
            }
            switchToStaticImage();
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
            interactionPointNorm = { x: parsedCoords.x, y_from_top: 1.0 - parsedCoords.y };

            const angleDataForForceExtraction = videoData[singleCoordKey];
            const angleKeys = Object.keys(angleDataForForceExtraction);
            if (angleKeys.length !== 2) {
                throw new Error(`Expected 2 angles for interaction point ${singleCoordKey} in ${effectiveRootDir}, found ${angleKeys.length}: ${angleKeys.join(', ')}`);
            }
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a,b) => a-b);

            const angleDiff = Math.abs(jsonAllowedAngles[0] - jsonAllowedAngles[1]);
            if (Math.abs(angleDiff - 180) > 0.1 && Math.abs((angleDiff % 360) - 180) > 0.1 ) {
                 throw new Error(`Angles ${jsonAllowedAngles[0]}° and ${jsonAllowedAngles[1]}° in ${effectiveRootDir} are not 180° apart. Difference: ${angleDiff}°`);
            }

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
            initializeInteractiveDemo();
        })
        .catch(error => {
            console.error(`Line Drag Demo (${containerElement.id}): Fatal Error processing video data or initializing:`, error);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Demo (${containerElement.id}) FATAL ERROR: ${error.message.substring(0, 100)}...`; // Keep message short
                debugFilenameDisplay.style.color = 'red';
            }
            interactionPointNorm = null;
            jsonAllowedAngles = [];
            initializeInteractiveDemo(); // Attempt to show static image / error state
        });
}