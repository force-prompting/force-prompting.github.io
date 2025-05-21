// --- Static Configuration (can remain as constants if they apply to ALL demos) ---
const LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH = 0.25;
const LINE_DEMO_DEBUG_SHOW_FILENAME = false; // Applies to all instances if true
const LINE_DEMO_CLICK_TOLERANCE_RADIUS = 200; // Pixels, for clicking the central bead
const BEAD_RADIUS = 11;
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
    const staticImage = containerElement.querySelector('.line-static-image');
    const canvas = containerElement.querySelector('.line-canvas-overlay');
    const videoPlayer = containerElement.querySelector('.line-video-player');
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

    let videoData = {};
    let singleCoordKey = null;
    let interactionPointNorm = null;
    let interactionPointPx = null;
    let jsonAllowedAngles = [];
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = interactionPointPx.x;
        const centerY = interactionPointPx.y;
        const angleRad = jsonAllowedAngles[0] * Math.PI / 180;
        const lineDx = Math.cos(angleRad) * maxPixelDragLength;
        const lineDy = -Math.sin(angleRad) * maxPixelDragLength;
        ctx.beginPath();
        ctx.moveTo(centerX - lineDx, centerY - lineDy);
        ctx.lineTo(centerX + lineDx, centerY + lineDy);
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, BEAD_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawArrow(x1, y1, x2, y2) {
        if (canvas.width === 0 || canvas.height === 0) return;
        const headLength = 25;
        const arrowLineWidth = 8;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const wingAngle = Math.PI / 6;
        const arrowheadDepth = headLength * Math.cos(wingAngle);
        const totalLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        if (totalLength > arrowheadDepth) {
            const shaftEndX = x2 - arrowheadDepth * Math.cos(angle);
            const shaftEndY = y2 - arrowheadDepth * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(shaftEndX, shaftEndY);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
            ctx.lineWidth = arrowLineWidth;
            ctx.lineCap = 'butt';
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        const baseCorner1X = x2 - headLength * Math.cos(angle - wingAngle);
        const baseCorner1Y = y2 - headLength * Math.sin(angle - wingAngle);
        const baseCorner2X = x2 - headLength * Math.cos(angle + wingAngle);
        const baseCorner2Y = y2 - headLength * Math.sin(angle + wingAngle);
        ctx.lineTo(baseCorner1X, baseCorner1Y);
        ctx.lineTo(baseCorner2X, baseCorner2Y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            imageWidth = staticImage.naturalWidth;
            imageHeight = staticImage.naturalHeight;
        }
        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            videoPlayer.width = imageWidth;
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
            debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the white bead in the allowed directions.' : `Demo (${containerElement.id}): Interaction disabled - No valid interaction point.`;
        }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;
        staticImage.onload = () => {
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                console.error(`Line Drag Demo (${containerElement.id}): Static image loaded but naturalWidth/Height is 0. Path: ${LINE_DEMO_INITIAL_IMAGE_PATH}`);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Demo (${containerElement.id}) Error: Static image reports no dimensions.`;
                    debugFilenameDisplay.style.color = 'red';
                }
                staticImage.style.display = 'block';
                canvas.style.display = 'none';
            }
        };
        staticImage.onerror = () => {
            console.error(`Line Drag Demo (${containerElement.id}): Failed to load static image. Path: ${LINE_DEMO_INITIAL_IMAGE_PATH}`);
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

        // --- Event Handler for Drag Start (Mouse and Touch) ---
        function handleDragStart(e) {
            if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
                switchToStaticImage();
            }
            if (!interactionPointPx || !imageWidth || imageWidth === 0 || maxPixelDragLength === 0) return;

            isDragging = true;
            dragOriginX = interactionPointPx.x;
            dragOriginY = interactionPointPx.y;
            lastProjectedDx = 0;
            lastProjectedDy = 0;
            
            // Prevent default behaviors:
            // - Text selection for mouse
            // - Scroll/zoom for touch starting on the element
            e.preventDefault(); 
        }

        // --- Event Handler for Drag Move (Mouse and Touch) ---
        function handleDragMove(e) {
            if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return;

            const rect = containerElement.getBoundingClientRect();
            let clientX, clientY;

            if (e.touches && e.touches.length > 0) { // Touch event
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
                // Prevent scrolling while dragging with finger inside the container
                e.preventDefault(); 
            } else { // Mouse event
                clientX = e.clientX;
                clientY = e.clientY;
            }

            let currentX = clientX - rect.left;
            let currentY = clientY - rect.top;
            let rawDx = currentX - dragOriginX;
            let rawDy = currentY - dragOriginY;

            if (rawDx === 0 && rawDy === 0 && lastProjectedDx === 0 && lastProjectedDy === 0) {
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

            drawGuidanceSliderAndBead();
            if (Math.sqrt(projectedDx * projectedDx + projectedDy * projectedDy) > 1) {
                drawArrow(dragOriginX, dragOriginY, dragOriginX + projectedDx, dragOriginY + projectedDy);
            }
        }

        // --- Event Handler for Drag End (Mouse and Touch) ---
        function handleDragEnd() {
            if (!isDragging || !interactionPointPx) {
                isDragging = false;
                return;
            }
            isDragging = false;

            if (Object.keys(videoData).length === 0 || !singleCoordKey) { switchToStaticImage(); return; }
            if (!imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) { switchToStaticImage(); return; }

            const pixelLength = Math.sqrt(lastProjectedDx * lastProjectedDx + lastProjectedDy * lastProjectedDy);
            if (pixelLength < 5) {
                switchToStaticImage();
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

                    // --- Suggested Fix ---
                    // Ensure the video player's dimensions are explicitly set via inline CSS
                    // right before making it visible. This uses the imageWidth and imageHeight
                    // captured in setupImageAndCanvas.
                    if (imageWidth > 0 && imageHeight > 0) {
                        videoPlayer.style.width = imageWidth + 'px';
                        videoPlayer.style.height = imageHeight + 'px';
                    }
                    // --- End Suggested Fix ---

                    staticImage.style.display = 'none';
                    canvas.style.display = 'none';
                    videoPlayer.style.display = 'block'; // Now display the video player

                    videoPlayer.play().catch(err => {
                        console.error(`Line Drag Demo (${containerElement.id}): Error playing video:`, err);
                        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                        switchToStaticImage(); // Revert to static image on play error
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
        }

        // --- Add Event Listeners ---
        // Mouse events
        containerElement.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);

        // Touch events
        containerElement.addEventListener('touchstart', handleDragStart, { passive: false }); // passive: false to allow preventDefault
        document.addEventListener('touchmove', handleDragMove, { passive: false });    // passive: false to allow preventDefault
        document.addEventListener('touchend', handleDragEnd);
        document.addEventListener('touchcancel', handleDragEnd); // Handle cases like finger sliding off screen

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

    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
        debugFilenameDisplay.textContent = `Demo (${containerElement.id}): Loading video data...`;
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
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a, b) => a - b);
            const angleDiff = Math.abs(jsonAllowedAngles[0] - jsonAllowedAngles[1]);
            if (Math.abs(angleDiff - 180) > 0.1 && Math.abs((angleDiff % 360) - 180) > 0.1) {
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
                debugFilenameDisplay.textContent = `Demo (${containerElement.id}) FATAL ERROR: ${error.message.substring(0, 100)}...`;
                debugFilenameDisplay.style.color = 'red';
            }
            interactionPointNorm = null;
            jsonAllowedAngles = [];
            initializeInteractiveDemo();
        });
}