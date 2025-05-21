// force-prompting-static/js/interactive_line_drag.js

const LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH = 0.25;
const LINE_DEMO_DEBUG_SHOW_FILENAME = false;
const LINE_DEMO_CLICK_TOLERANCE_RADIUS = 200;
const BEAD_RADIUS = 11;

document.addEventListener('DOMContentLoaded', () => {
    const demoContainerElements = document.querySelectorAll('.js-line-drag-demo');
    demoContainerElements.forEach(containerElement => {
        initLineDragInstance(containerElement);
    });
});

function initLineDragInstance(containerElement) {
    let LINE_DEMO_INITIAL_IMAGE_PATH;
    let LINE_DEMO_VIDEOS_BASE_PATH;
    let LINE_DEMO_VIDEO_DATA_PATH;
    let LINE_DEMO_PREDEFINED_FORCES = [];

    const staticImage = containerElement.querySelector('.line-static-image');
    const canvas = containerElement.querySelector('.line-canvas-overlay');
    const videoPlayer = containerElement.querySelector('.line-video-player');
    const debugFilenameDisplay = containerElement.closest('.line-drag-gallery-item, section[id^="lineDragDemoSection"]').querySelector('.line-debug-filename-display');

    if (!staticImage || !canvas || !videoPlayer) {
        console.error(`Line Drag Demo (${containerElement.id || 'Unknown ID'}): Core child elements missing.`);
        if (debugFilenameDisplay && LINE_DEMO_DEBUG_SHOW_FILENAME) {
             debugFilenameDisplay.textContent = "Error: Core HTML elements missing.";
        }
        return;
    }

    const rootDir = containerElement.dataset.rootDir;
    if (!rootDir) {
        return;
    }

    const effectiveRootDir = rootDir.endsWith('/') ? rootDir : rootDir + '/';
    LINE_DEMO_INITIAL_IMAGE_PATH = effectiveRootDir + "initial_frame.png";
    LINE_DEMO_VIDEOS_BASE_PATH = effectiveRootDir + "videos/";
    LINE_DEMO_VIDEO_DATA_PATH = effectiveRootDir + "video_specs.json";

    let videoData = {};
    let singleCoordKey = null;
    let interactionPointNorm = null;
    let interactionPointPx = null;
    let jsonAllowedAngles = [];
    let lastProjectedDx = 0, lastProjectedDy = 0;
    let isDragging = false;
    let dragOriginX, dragOriginY;
    let imageWidth = 0, imageHeight = 0, maxPixelDragLength = 0;
    const ctx = canvas.getContext('2d');

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
        const angleRad = jsonAllowedAngles[0] * Math.PI / 180; // Assuming first angle defines one direction of the line
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
            canvas.width = imageWidth;
            canvas.height = imageHeight;
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
            // ... (debug display logic) ...
        }
    }

    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            maxPixelDragLength = imageWidth * LINE_DEMO_MAX_DRAG_PROPORTION_OF_WIDTH;
            if (interactionPointNorm) {
                interactionPointPx = {
                    x: interactionPointNorm.x * imageWidth,
                    y: interactionPointNorm.y_from_top * imageHeight
                };
            }
            console.log(`Line Drag Demo (${containerElement.id}): Setup Canvas. Dimensions: ${imageWidth}x${imageHeight}. Max Drag: ${maxPixelDragLength}`);
        } else {
            console.error(`Line Drag Demo (${containerElement.id}): Failed to get valid dimensions for static image in setupImageAndCanvas. Path: ${LINE_DEMO_INITIAL_IMAGE_PATH}. OffsetW: ${staticImage.offsetWidth}`);
            canvas.style.display = 'none';
        }
        switchToStaticImage(false); // Will draw bead if setup was successful
        if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay /* ... */) {
            // ...
        }
    }
    
    // Event Handlers
    function handleDragStart(e) {
        // Check if essential variables are initialized
        if (!interactionPointPx || !imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) {
            console.warn(`Line Drag Demo (${containerElement.id}): Drag start ignored, setup incomplete. Point: ${interactionPointPx}, Width: ${imageWidth}, MaxDrag: ${maxPixelDragLength}`);
            // Try to re-initialize dimensions if they are missing
            if (typeof containerElement.forceRefreshDimensions === 'function') {
                 console.warn(`Line Drag Demo (${containerElement.id}): Attempting emergency refresh.`);
                 containerElement.forceRefreshDimensions(); // Try one more time
                 // Check again after refresh
                 if (!interactionPointPx || !imageWidth || imageWidth === 0 || !maxPixelDragLength || maxPixelDragLength === 0) {
                    return; // Still not ready
                 }
            } else {
                return; // Cannot refresh
            }
        }

        if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            switchToStaticImage();
        }
        
        isDragging = true;
        dragOriginX = interactionPointPx.x;
        dragOriginY = interactionPointPx.y;
        lastProjectedDx = 0;
        lastProjectedDy = 0;

        // Add document-level listeners for the current drag operation
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
        document.addEventListener('touchcancel', handleDragEnd);
        
        e.preventDefault();
    }

    function handleDragMove(e) {
        if (!isDragging || !interactionPointPx || jsonAllowedAngles.length < 2) return;
        const rect = containerElement.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let currentX = clientX - rect.left;
        let currentY = clientY - rect.top;
        let rawDx = currentX - dragOriginX;
        let rawDy = currentY - dragOriginY;

        if (rawDx === 0 && rawDy === 0 && lastProjectedDx === 0 && lastProjectedDy === 0) return;

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

    function handleDragEnd() {
        if (!isDragging) return; // Only process if this instance was dragging
        isDragging = false;

        // Remove document-level listeners
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('touchcancel', handleDragEnd);

        if (!interactionPointPx) { switchToStaticImage(); return; } // Safety check
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
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) { /* ... */ }
            videoPlayer.src = LINE_DEMO_VIDEOS_BASE_PATH + videoFilename;
            const onVideoReadyToPlay = () => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) { /* ... */ }
                if (imageWidth > 0 && imageHeight > 0) {
                    videoPlayer.style.width = imageWidth + 'px';
                    videoPlayer.style.height = imageHeight + 'px';
                } else {
                    videoPlayer.style.width = '100%'; videoPlayer.style.height = 'auto';
                }
                staticImage.style.display = 'none';
                canvas.style.display = 'none';
                videoPlayer.style.display = 'block';
                videoPlayer.play().catch(err => { /* ... */ switchToStaticImage(); });
            };
            const onVideoLoadError = (e) => { /* ... */ switchToStaticImage(); };
            videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
            videoPlayer.addEventListener('error', onVideoLoadError);
            videoPlayer.load();
        } else {
            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) { /* ... */ }
            switchToStaticImage();
        }
    }

    function initializeInteractiveDemo() {
        staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH;
        const newOnload = () => {
            staticImage.onload = null; 
            console.log(`Line Drag Demo (${containerElement.id}): Image loaded (${staticImage.naturalWidth}x${staticImage.naturalHeight}).`);
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else { /* ... error handling ... */ }
        };
        staticImage.onload = newOnload;
        staticImage.onerror = () => { /* ... error handling ... */ };

        if (staticImage.complete && staticImage.getAttribute('src') === LINE_DEMO_INITIAL_IMAGE_PATH && staticImage.naturalWidth > 0) {
            console.log(`Line Drag Demo (${containerElement.id}): Image already complete on init. Calling setup via timeout.`);
            setTimeout(setupImageAndCanvas, 0);
        }

        // Attach mousedown/touchstart listeners to the containerElement
        // These will, in turn, add/remove document listeners for move/end
        containerElement.removeEventListener('mousedown', handleDragStart); // Clear if any old ones
        containerElement.addEventListener('mousedown', handleDragStart);
        containerElement.removeEventListener('touchstart', handleDragStart); // Clear if any old ones
        containerElement.addEventListener('touchstart', handleDragStart, { passive: false });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => { /* ... */ switchToStaticImage(); });
    }

    containerElement.forceRefreshDimensions = function() {
        console.log(`Line Drag Demo (${containerElement.id}): forceRefreshDimensions called. Image src: ${staticImage.getAttribute('src')}`);
        if (!staticImage.getAttribute('src') || staticImage.getAttribute('src') !== LINE_DEMO_INITIAL_IMAGE_PATH) {
            staticImage.src = LINE_DEMO_INITIAL_IMAGE_PATH; // This will trigger onload in initializeInteractiveDemo
        } else if (staticImage.complete && staticImage.naturalWidth > 0) {
            console.log(`Line Drag Demo (${containerElement.id}): Image complete on refresh, running setupImageAndCanvas.`);
            setupImageAndCanvas();
        } else if (staticImage.getAttribute('src')) {
             console.log(`Line Drag Demo (${containerElement.id}): Image src set but not complete. Onload will handle.`);
        }
    };

    // Initial data fetch
    if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) { /* ... */ }
    fetch(LINE_DEMO_VIDEO_DATA_PATH)
        .then(response => { /* ... */ return response.json(); })
        .then(data => {
            videoData = data;
            // ... (parse all your data: singleCoordKey, interactionPointNorm, jsonAllowedAngles, LINE_DEMO_PREDEFINED_FORCES) ...
            // Ensure all these are correctly parsed and set before initializeInteractiveDemo
            // For brevity, assuming this parsing logic from your original script is correct and complete here.
            const coordKeys = Object.keys(videoData);
            if (coordKeys.length !== 1) throw new Error(`video_specs.json must contain exactly one coordinate key. Found: ${coordKeys.length}`);
            singleCoordKey = coordKeys[0];
            const parsedCoords = parseCoordString(singleCoordKey);
            if (!parsedCoords) throw new Error(`Could not parse coordinate key: ${singleCoordKey}`);
            interactionPointNorm = { x: parsedCoords.x, y_from_top: 1.0 - parsedCoords.y };

            const angleDataForForceExtraction = videoData[singleCoordKey];
            const angleKeys = Object.keys(angleDataForForceExtraction);
            if (angleKeys.length !== 2) throw new Error(`Expected 2 angles, found ${angleKeys.length}`);
            jsonAllowedAngles = angleKeys.map(parseFloat).sort((a, b) => a - b);
            
            const firstAngleKey = angleKeys[0]; 
            const forcesData = angleDataForForceExtraction[firstAngleKey];
            if (!forcesData || Object.keys(forcesData).length === 0) throw new Error(`No force data found.`);
            LINE_DEMO_PREDEFINED_FORCES = Object.keys(forcesData).map(f => parseFloat(f)).sort((a, b) => a - b);
            if (LINE_DEMO_PREDEFINED_FORCES.length === 0) throw new Error(`No forces extracted.`);


            if (LINE_DEMO_DEBUG_SHOW_FILENAME && debugFilenameDisplay) { /* ... */ }
            initializeInteractiveDemo();
        })
        .catch(error => {
            console.error(`Line Drag Demo (${containerElement.id}): Fatal Error processing video data or initializing:`, error);
            // ... (error display) ...
            initializeInteractiveDemo(); // Attempt to init basic structure anyway
        });
}