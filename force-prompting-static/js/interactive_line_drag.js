// --- Configuration for Line Drag Demo ---
const LINE_DEMO_INITIAL_IMAGE_PATH = "force-prompting-static/apple1/gridapple1.png"; // 🌟 REPLACE with your image path for this demo
const LINE_DEMO_VIDEOS_BASE_PATH = "force-prompting-static/apple1/videos/";       // 🌟 REPLACE with path to your videos folder for this demo
const LINE_DEMO_VIDEO_DATA_PATH = "force-prompting-static/apple1/video_specs.json"; // 🌟 Path to your JSON for this specific demo
const LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH = 0.25;
const LINE_DEMO_DEBUG_SHOW_FILENAME = true;
const LINE_DEMO_PREDEFINED_FORCES = [0.050, 0.250, 0.500, 0.750, 0.950];
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

    let videoData = {};
    let singleCoordKey = null;
    let interactionPointNorm = null; // {x: normX, y: normY_from_top}
    let interactionPointPx = null;   // {x: pxX, y: pxY_from_top}
    let jsonAllowedAngles = [];      // [angle1_deg, angle2_deg]
    let lastProjectedDx = 0, lastProjectedDy = 0;

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
    if (LINE_DEMO_DEBUG_SHOW_FILENAME && !debugFilenameDisplay) {
        console.warn(`Line Drag Demo: Debug display element ('${debugDisplayId}') not found, but LINE_DEMO_DEBUG_SHOW_FILENAME is true.`);
    }

    videoPlayer.poster = LINE_DEMO_INITIAL_IMAGE_PATH;
    const ctx = canvas.getContext('2d');

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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (interactionPointPx) {
                drawGuidanceSliderAndBead();
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
                debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead.' : 'Line Drag Demo: Interaction disabled.';
                debugFilenameDisplay.style.display = 'block';
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
            console.error("Line Drag Demo: Failed to get valid dimensions for static image.", LINE_DEMO_INITIAL_IMAGE_PATH);
            canvas.style.display = 'none';
        }
        switchToStaticImage(false);
         if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay && (!debugFilenameDisplay.textContent || !debugFilenameDisplay.textContent.toLowerCase().includes("error"))) {
             debugFilenameDisplay.textContent = interactionPointPx ? 'Drag the blue bead in the allowed directions.' : 'Line Drag Demo: Interaction disabled - No valid interaction point.';
         }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;

        staticImage.onload = () => {
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                console.error("Line Drag Demo: Static image loaded but naturalWidth/Height is 0.", LINE_DEMO_INITIAL_IMAGE_PATH);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = "Line Drag Demo Error: Static image reports no dimensions.";
                    debugFilenameDisplay.style.display = 'block';
                    debugFilenameDisplay.style.color = 'red';
                }
                staticImage.style.display = 'block';
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
            staticImage.style.display = 'block';
            canvas.style.display = 'none';
            videoPlayer.style.display = 'none';
        };
        if (staticImage.complete && staticImage.getAttribute('src') === LINE_DEMO_INITIAL_IMAGE_PATH) {
            setTimeout(() => {
                if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                    if (!imageWidth || imageWidth === 0) setupImageAndCanvas();
                } else if (staticImage.naturalWidth === 0) {
                    staticImage.onerror();
                }
            }, 50);
        }

        container.addEventListener('mousedown', (e) => {
            if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
                switchToStaticImage();
            }
            if (!interactionPointPx || !imageWidth || imageWidth === 0 || maxPixelDragLength === 0) return;

            const rect = container.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;
            const distToCenter = Math.sqrt(Math.pow(clickX - interactionPointPx.x, 2) + Math.pow(clickY - interactionPointPx.y, 2));

            if (distToCenter <= LINE_DEMO_CLICK_TOLERANCE_RADIUS) {
                isDragging = true;
                dragOriginX = interactionPointPx.x;
                dragOriginY = interactionPointPx.y;
                lastProjectedDx = 0;
                lastProjectedDy = 0;
                e.preventDefault();
            } else {
                isDragging = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return;

            const rect = container.getBoundingClientRect();
            let currentX = e.clientX - rect.left;
            let currentY = e.clientY - rect.top;
            let rawDx = currentX - dragOriginX;
            let rawDy = currentY - dragOriginY;

            if (rawDx === 0 && rawDy === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGuidanceSliderAndBead();
                lastProjectedDx = 0; lastProjectedDy = 0;
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

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGuidanceSliderAndBead();
            if (Math.sqrt(projectedDx * projectedDx + projectedDy * projectedDy) > 1) {
                drawArrow(dragOriginX, dragOriginY, dragOriginX + projectedDx, dragOriginY + projectedDy);
            }
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging || !interactionPointPx) { isDragging = false; return; }
            isDragging = false;

            if (Object.keys(videoData).length === 0 || !singleCoordKey) { switchToStaticImage(); return; }
            if (!imageWidth || imageWidth === 0 || !maxPixelDragLength) { switchToStaticImage(); return; }

            const pixelLength = Math.sqrt(lastProjectedDx * lastProjectedDx + lastProjectedDy * lastProjectedDy);
            if (pixelLength < 5) { switchToStaticImage(); return; }

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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGuidanceSliderAndBead();
                drawArrow(dragOriginX, dragOriginY, dragOriginX + lastProjectedDx, dragOriginY + lastProjectedDy);

                videoPlayer.style.display = 'none';
                if (!videoPlayer.paused) videoPlayer.pause();
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Loading: ${videoFilename}`;
                }
                videoPlayer.src = LINE_DEMO_VIDEOS_BASE_PATH + videoFilename;

                const onVideoReadyToPlay = () => { /* ... */
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError);
                    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Playing: ${videoFilename}`;
                    }
                    staticImage.style.display = 'none';
                    canvas.style.display = 'none';
                    videoPlayer.style.display = 'block';
                    videoPlayer.play().catch(err => {
                        console.error("Line Drag Demo: Error playing video:", err);
                        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                        switchToStaticImage();
                    });
                };
                const onVideoLoadError = (e) => { /* ... */
                    videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                    videoPlayer.removeEventListener('error', onVideoLoadError);
                    console.error(`Line Drag Demo: Error loading video data for ${videoFilename}:`, e);
                    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) debugFilenameDisplay.textContent = `Error loading: ${videoFilename}`;
                    switchToStaticImage();
                };
                videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.addEventListener('error', onVideoLoadError);
                videoPlayer.load();
            } else {
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Video not found for specified parameters.`;
                }
                switchToStaticImage();
            }
        });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => {
            const currentVideoSrc = videoPlayer.currentSrc || "unknown video";
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Video player error for: ${currentVideoSrc.split('/').pop()}`;
            }
            switchToStaticImage();
        });
    }

    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
        debugFilenameDisplay.textContent = "Line Drag Demo: Loading video data...";
        debugFilenameDisplay.style.display = 'block';
    }

    fetch(LINE_DEMO_VIDEO_DATA_PATH)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} fetching ${LINE_DEMO_VIDEO_DATA_PATH}`);
            return response.json();
        })
        .then(data => {
            videoData = data;
            const coordKeys = Object.keys(videoData);
            if (coordKeys.length !== 1) throw new Error(`video_specs.json must contain exactly one coordinate key. Found: ${coordKeys.length}`);
            singleCoordKey = coordKeys[0];
            const parsedCoords = parseCoordString(singleCoordKey);
            if (!parsedCoords) throw new Error(`Could not parse coordinate key: ${singleCoordKey}`);
            interactionPointNorm = { x: parsedCoords.x, y_from_top: 1.0 - parsedCoords.y };

            const angleData = videoData[singleCoordKey];
            const angleKeys = Object.keys(angleData);
            if (angleKeys.length !== 2) throw new Error(`Expected 2 angles for ${singleCoordKey}, found ${angleKeys.length}`);
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a,b) => a-b);

            const angleDiff = Math.abs(jsonAllowedAngles[0] - jsonAllowedAngles[1]);
            if (Math.abs(angleDiff - 180) > 0.1 && Math.abs(angleDiff % 360 - 180) > 0.1 ) {
                 throw new Error(`Angles ${jsonAllowedAngles[0]}° and ${jsonAllowedAngles[1]}° are not 180° apart. Diff: ${angleDiff}°`);
            }
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                 debugFilenameDisplay.textContent = "Line Drag Demo: Data loaded. Initializing image...";
            }
            initializeInteractiveDemo();
        })
        .catch(error => {
            console.error("Line Drag Demo: Fatal Error processing video data:", error);
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Line Drag Demo FATAL ERROR: ${error.message}`;
                debugFilenameDisplay.style.color = 'red';
            }
            interactionPointNorm = null;
            jsonAllowedAngles = [];
            initializeInteractiveDemo(); // Still try to load image
        });
});