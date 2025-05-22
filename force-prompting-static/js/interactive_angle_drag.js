// interactive_angle_drag.js

const ANGLE_SELECTOR_DEBUG_SHOW_FILENAME = false; // Set to true for debugging
const ANGLE_SELECTOR_CIRCLE_LINE_WIDTH_PX = 3; // Width of the circle outline
const ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION = 0.35; // Proportion of image width for the circle radius
const ANGLE_SELECTOR_CIRCLE_CENTER_X_PROPORTION = 0.5; // Center X of circle (0.5 = image center)
const ANGLE_SELECTOR_CIRCLE_CENTER_Y_PROPORTION = 0.5; // Center Y of circle (0.5 = image center)
const ANGLE_SELECTOR_DRAG_START_TOLERANCE_PX = 30; // How close to circle edge to start drag

// Icon properties
const ICON_PATH = "force-prompting-static/demo-wind-videos/wind_pretty_print_180.0.png";
let iconImage = null;
let iconLoaded = false;
// NEW: Scale proportion for the icon relative to the main image width
const ICON_SCALE_PROPORTION_OF_IMAGE_WIDTH = 0.1; // e.g., 10% of image width
let actualIconDisplayWidthPx = 40; // Default, will be calculated

document.addEventListener('DOMContentLoaded', () => {
    const demoContainerElements = document.querySelectorAll('.js-angle-drag-demo');
    demoContainerElements.forEach(containerElement => {
        initAngleSelectorInstance(containerElement);
    });
});

function initAngleSelectorInstance(containerElement) {
    let INITIAL_IMAGE_PATH;
    let VIDEOS_BASE_PATH;
    let VIDEO_DATA_PATH;

    const staticImage = containerElement.querySelector('.angle-static-image');
    const canvas = containerElement.querySelector('.angle-canvas-overlay');
    const videoPlayer = containerElement.querySelector('.angle-video-player');
    const debugFilenameDisplay = búsquedaAscendente(containerElement, '.debug-filename-display');

    if (!staticImage || !canvas || !videoPlayer) {
        console.error(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Core child elements missing.`);
        if (debugFilenameDisplay && ANGLE_SELECTOR_DEBUG_SHOW_FILENAME) {
            debugFilenameDisplay.textContent = "Error: Core HTML elements missing.";
        }
        return;
    }

    const rootDir = containerElement.dataset.rootDir;
    if (!rootDir) {
        console.error(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): data-root-dir attribute missing.`);
        if (debugFilenameDisplay && ANGLE_SELECTOR_DEBUG_SHOW_FILENAME) {
            debugFilenameDisplay.textContent = "Error: data-root-dir missing.";
        }
        return;
    }

    const effectiveRootDir = rootDir.endsWith('/') ? rootDir : rootDir + '/';
    INITIAL_IMAGE_PATH = effectiveRootDir + (containerElement.dataset.initialImageFile || "initial_frame.png");
    VIDEOS_BASE_PATH = effectiveRootDir + (containerElement.dataset.videosDir || "videos/");
    VIDEO_DATA_PATH = effectiveRootDir + (containerElement.dataset.specsFile || "video_specs.json");

    let videoAngleData = {};
    let availableUserAngles = [];
    let imageWidth = 0, imageHeight = 0;
    let circleCenterX = 0, circleCenterY = 0, circleRadiusPx = 0;
    let currentBeadMathAngleRad = 0;
    let lastSelectedUserAngleDeg = 0.0;

    let isDragging = false;
    const ctx = canvas.getContext('2d');

    iconImage = new Image();
    iconImage.onload = () => {
        iconLoaded = true;
        console.log(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Icon image loaded from ${ICON_PATH}`);
        if (canvas.style.display === 'block' && imageWidth > 0) {
            const mathAngleForRedraw = convertUserAngleToMathAngleRad(lastSelectedUserAngleDeg);
            // For consistent rotation logic, this should also be the standard math angle
            // If positive ctx.rotate is CW, then for CCW rotation by S, we need -S
            drawCircleAndIcon(mathAngleForRedraw, -((lastSelectedUserAngleDeg - 180 + 360) % 360));
        }
    };
    iconImage.onerror = () => {
        console.error(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Failed to load icon image from ${ICON_PATH}`);
        iconImage = null;
    };
    iconImage.src = ICON_PATH;

    function búsquedaAscendente(el, selector) {
        let ancestro = el.parentElement;
        while (ancestro) {
            if (ancestro.matches(selector)) return ancestro.querySelector('.debug-filename-display');
            if (ancestro.querySelector && ancestro.querySelector(selector)) return ancestro.querySelector(selector);
            ancestro = ancestro.parentElement;
        }
        const siblingOrChild = containerElement.parentElement?.querySelector(selector) || containerElement.querySelector(selector);
        if (siblingOrChild && siblingOrChild.classList.contains('debug-filename-display')) return siblingOrChild;
        return null;
    }

    function convertMathAngleToUserAngle(angleRadFromAtan2_CanvasY_Down) {
        let canvasAngleDeg = angleRadFromAtan2_CanvasY_Down * (180 / Math.PI);
        if (canvasAngleDeg < 0) {
            canvasAngleDeg += 360;
        }
        let standardMathAngleDeg;
        if (canvasAngleDeg === 0) {
            standardMathAngleDeg = 0;
        } else {
            standardMathAngleDeg = (360 - canvasAngleDeg) % 360;
        }
        return (standardMathAngleDeg + 180) % 360;
    }

    function convertUserAngleToMathAngleRad(userAngleDegFromJsonOrLastSelected) {
        let standardMathAngleDeg = (userAngleDegFromJsonOrLastSelected - 180 + 360) % 360;
        let canvasAngleDeg;
        if (standardMathAngleDeg === 0) {
            canvasAngleDeg = 0;
        } else {
            canvasAngleDeg = (360 - standardMathAngleDeg) % 360;
        }
        return canvasAngleDeg * (Math.PI / 180);
    }

    function findClosestUserAngle(targetUserAngleDeg, userAngleList) {
        if (!userAngleList || userAngleList.length === 0) return null;
        return userAngleList.reduce((prev, curr) => {
            const distPrev = Math.min(Math.abs(targetUserAngleDeg - prev), 360 - Math.abs(targetUserAngleDeg - prev));
            const distCurr = Math.min(Math.abs(targetUserAngleDeg - curr), 360 - Math.abs(targetUserAngleDeg - curr));
            return distCurr < distPrev ? curr : prev;
        });
    }

    // MODIFIED: Added rotationDegreesToUse parameter
    function drawCircleAndIcon(positionalCanvasAngleRad, rotationDegreesToUse) {
        if (!imageWidth || !imageHeight || !circleRadiusPx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadiusPx, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = ANGLE_SELECTOR_CIRCLE_LINE_WIDTH_PX;
        ctx.stroke();

        const iconX = circleCenterX + circleRadiusPx * Math.cos(positionalCanvasAngleRad);
        const iconY = circleCenterY + circleRadiusPx * Math.sin(positionalCanvasAngleRad);

        if (iconLoaded && iconImage) {
            ctx.save();
            ctx.translate(iconX, iconY);

            const rotationRadians = rotationDegreesToUse * (Math.PI / 180);
            ctx.rotate(rotationRadians);

            // Use actualIconDisplayWidthPx calculated in setupImageAndCanvas
            const iconDrawWidth = actualIconDisplayWidthPx;
            const iconAspectRatio = iconImage.naturalHeight / iconImage.naturalWidth;
            const iconDrawHeight = iconDrawWidth * iconAspectRatio;

            ctx.drawImage(iconImage, -iconDrawWidth / 2, -iconDrawHeight / 2, iconDrawWidth, iconDrawHeight);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(iconX, iconY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fill();
        }

        if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            // For debug, show the user angle for position and the direct rotation value
            const userAngleForJsonMatch = convertMathAngleToUserAngle(positionalCanvasAngleRad);
            debugFilenameDisplay.textContent = `Icon Pos (JSON Angle): ${userAngleForJsonMatch.toFixed(1)}°, Icon Rot (Direct): ${rotationDegreesToUse.toFixed(1)}°`;
        }
    }

    function switchToStaticImage(clearDebug = true) {
        videoPlayer.style.display = 'none';
        if (!videoPlayer.paused) videoPlayer.pause();

        staticImage.style.display = 'block';
        if (imageWidth > 0 && imageHeight > 0) {
            canvas.style.display = 'block';
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            const mathAngleForRedraw = convertUserAngleToMathAngleRad(lastSelectedUserAngleDeg);
            // For consistent rotation logic, this should also be the standard math angle
            // If positive ctx.rotate is CW, then for CCW rotation by S, we need -S
            drawCircleAndIcon(mathAngleForRedraw, -((lastSelectedUserAngleDeg - 180 + 360) % 360));
        } else {
            canvas.style.display = 'none';
        }

        if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay && clearDebug) {
            // debugFilenameDisplay.textContent = "Select an angle.";
        }
    }

    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;

            // Calculate actual icon display width based on new scale parameter
            actualIconDisplayWidthPx = imageWidth * ICON_SCALE_PROPORTION_OF_IMAGE_WIDTH;

            circleRadiusPx = Math.min(imageWidth * ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION, imageHeight * ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION);
            circleCenterX = imageWidth * ANGLE_SELECTOR_CIRCLE_CENTER_X_PROPORTION;
            circleCenterY = imageHeight * ANGLE_SELECTOR_CIRCLE_CENTER_Y_PROPORTION;

            lastSelectedUserAngleDeg = 0.0; // This is the JSON-key equivalent angle
            currentBeadMathAngleRad = convertUserAngleToMathAngleRad(lastSelectedUserAngleDeg);

            console.log(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Setup Canvas. Img: ${imageWidth}x${imageHeight}. Icon Width: ${actualIconDisplayWidthPx.toFixed(1)}px`);
        } else {
            console.error(`Angle Drag Demo (${containerElement.id}): Failed to get valid image dimensions. Path: ${INITIAL_IMAGE_PATH}`);
            canvas.style.display = 'none';
        }
        // Pass the negated standard math angle for initial CCW rotation
        switchToStaticImage(false);
    }

    function handleDragStart(e) {
        if (!imageWidth || !circleRadiusPx) {
            console.warn(`Angle Drag Demo (${containerElement.id}): Drag start ignored, setup incomplete.`);
            if (typeof containerElement.forceRefreshDimensions === 'function') {
                containerElement.forceRefreshDimensions();
                if (!imageWidth || !circleRadiusPx) return;
            } else {
                return;
            }
        }

        if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            switchToStaticImage();
        }

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        const distToCenter = Math.sqrt(Math.pow(canvasX - circleCenterX, 2) + Math.pow(canvasY - circleCenterY, 2));

        if (Math.abs(distToCenter - circleRadiusPx) < ANGLE_SELECTOR_DRAG_START_TOLERANCE_PX) {
            isDragging = true;
            currentBeadMathAngleRad = Math.atan2(canvasY - circleCenterY, canvasX - circleCenterX);
            
            // Calculate standard math angle for rotation and negate it for CCW
            const userAngleForJson = convertMathAngleToUserAngle(currentBeadMathAngleRad);
            const standardMathAngleForRotation = (userAngleForJson - 180 + 360) % 360;
            drawCircleAndIcon(currentBeadMathAngleRad, -standardMathAngleForRotation);

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
            document.addEventListener('touchcancel', handleDragEnd);
            e.preventDefault();
        }
    }

    function handleDragMove(e) {
        if (!isDragging) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        currentBeadMathAngleRad = Math.atan2(canvasY - circleCenterY, canvasX - circleCenterX);
        // Rotate live during drag based on current position's standard math angle (negated for CCW)
        const userAngleForJson = convertMathAngleToUserAngle(currentBeadMathAngleRad); // This is (StandardMathAngle + 180) % 360
        // To get StandardMathAngle for rotation: (userAngleForJson - 180 + 360) % 360
        // Negate it for CCW rotation because positive ctx.rotate is Clockwise
        drawCircleAndIcon(currentBeadMathAngleRad, -((userAngleForJson - 180 + 360) % 360));
    }

    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('touchcancel', handleDragEnd);


        if (Object.keys(videoAngleData).length === 0) {
            // Rotate to standard math angle of last selected JSON key (negated for CCW)
            switchToStaticImage(); 
            return;
        }

        const finalUserAngleDegForJson = convertMathAngleToUserAngle(currentBeadMathAngleRad);
        const closestUserAngleFromJson = findClosestUserAngle(finalUserAngleDegForJson, availableUserAngles);

        if (closestUserAngleFromJson === null) {
            switchToStaticImage();
            return;
        }

        lastSelectedUserAngleDeg = closestUserAngleFromJson; // This is the angle from JSON (StandardMathAngle + 180)
        
        // Redraw one last time with the final position.
        // Rotation should be the negated standard math angle corresponding to the selected JSON key for CCW.
        const finalRotationStandardMathAngle = (lastSelectedUserAngleDeg - 180 + 360) % 360;
        drawCircleAndIcon(currentBeadMathAngleRad, -finalRotationStandardMathAngle);

        const videoFilename = videoAngleData[closestUserAngleFromJson.toFixed(1)];
        console.log("Serving MP4:", videoFilename, "for angle", closestUserAngleFromJson.toFixed(1));

        if (videoFilename) {
            videoPlayer.src = VIDEOS_BASE_PATH + videoFilename;
            const onVideoReadyToPlay = () => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                if (imageWidth > 0 && imageHeight > 0) {
                    videoPlayer.style.width = imageWidth + 'px';
                    videoPlayer.style.height = imageHeight + 'px';
                } else {
                    videoPlayer.style.width = '100%'; videoPlayer.style.height = 'auto';
                }
                staticImage.style.display = 'none';
                canvas.style.display = 'none';
                videoPlayer.style.display = 'block';
                videoPlayer.play().catch(err => {
                    console.error(`Angle Drag Demo (${containerElement.id}): Error playing video ${videoFilename}:`, err);
                    switchToStaticImage();
                });
            };
            const onVideoLoadError = (ev) => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                console.error(`Angle Drag Demo (${containerElement.id}): Error loading video ${videoFilename}:`, ev);
                switchToStaticImage();
            };
            videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
            videoPlayer.addEventListener('error', onVideoLoadError);
            videoPlayer.load();
        } else {
            switchToStaticImage();
        }
    }

    function initializeInteractiveDemo() {
        staticImage.src = INITIAL_IMAGE_PATH;
        staticImage.onload = () => {
            staticImage.onload = null;
            console.log(`Angle Drag Demo (${containerElement.id}): Image loaded (${staticImage.naturalWidth}x${staticImage.naturalHeight}).`);
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                console.error(`Angle Drag Demo (${containerElement.id}): Image has zero dimensions.`);
            }
        };
        staticImage.onerror = () => {
            console.error(`Angle Drag Demo (${containerElement.id}): Error loading initial image.`);
        };

        if (staticImage.complete && staticImage.naturalWidth > 0 && staticImage.getAttribute('src') === INITIAL_IMAGE_PATH) {
            setTimeout(setupImageAndCanvas, 0);
        }

        canvas.removeEventListener('mousedown', handleDragStart);
        canvas.addEventListener('mousedown', handleDragStart);
        canvas.removeEventListener('touchstart', handleDragStart);
        canvas.addEventListener('touchstart', handleDragStart, { passive: false });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => switchToStaticImage());
        videoPlayer.addEventListener('click', () => {
            if (!videoPlayer.paused) switchToStaticImage();
        });
    }

    containerElement.forceRefreshDimensions = function() {
        console.log(`Angle Drag Demo (${containerElement.id}): forceRefreshDimensions called.`);
        if (!staticImage.getAttribute('src') || staticImage.getAttribute('src') !== INITIAL_IMAGE_PATH) {
            staticImage.src = INITIAL_IMAGE_PATH;
        } else if (staticImage.complete && staticImage.naturalWidth > 0) {
            setupImageAndCanvas();
        } else if (staticImage.getAttribute('src')) {
            if (!staticImage.onload) {
                staticImage.onload = () => {
                    staticImage.onload = null;
                    if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) setupImageAndCanvas();
                };
            }
        } else {
            staticImage.src = INITIAL_IMAGE_PATH;
        }
    };

    fetch(VIDEO_DATA_PATH)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} while fetching ${VIDEO_DATA_PATH}`);
            return response.json();
        })
        .then(data => {
            videoAngleData = data;
            availableUserAngles = Object.keys(videoAngleData).map(parseFloat).sort((a, b) => a - b);
            if (availableUserAngles.length === 0) {
                console.error(`Angle Drag Demo (${containerElement.id}): No angles in ${VIDEO_DATA_PATH}.`);
            }
            initializeInteractiveDemo();
        })
        .catch(error => {
            console.error(`Angle Drag Demo (${containerElement.id}): Error fetching video data ${VIDEO_DATA_PATH}:`, error);
            initializeInteractiveDemo();
        });
}
