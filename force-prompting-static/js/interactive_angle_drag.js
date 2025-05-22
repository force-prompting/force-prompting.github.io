// interactive_angle_drag.js

const ANGLE_SELECTOR_DEBUG_SHOW_FILENAME = false; // Set to true for debugging
const ANGLE_SELECTOR_BEAD_RADIUS_PX = 15; // Radius of the draggable bead
const ANGLE_SELECTOR_CIRCLE_LINE_WIDTH_PX = 3; // Width of the circle outline
const ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION = 0.35; // Proportion of image width for the circle radius
const ANGLE_SELECTOR_CIRCLE_CENTER_X_PROPORTION = 0.5; // Center X of circle (0.5 = image center)
const ANGLE_SELECTOR_CIRCLE_CENTER_Y_PROPORTION = 0.5; // Center Y of circle (0.5 = image center)
const ANGLE_SELECTOR_DRAG_START_TOLERANCE_PX = 30; // How close to circle edge to start drag

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
    // Attempt to find a debug display, similar to the line-drag example
    const debugFilenameDisplay = búsquedaAscendente(containerElement, '.debug-filename-display');


    if (!staticImage || !canvas || !videoPlayer) {
        console.error(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Core child elements (.angle-static-image, .angle-canvas-overlay, .angle-video-player) missing.`);
        if (debugFilenameDisplay && ANGLE_SELECTOR_DEBUG_SHOW_FILENAME) {
            debugFilenameDisplay.textContent = "Error: Core HTML elements missing for angle selector.";
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

    let videoAngleData = {}; // Stores the JSON: {"angle_str": "filename.mp4"}
    let availableUserAngles = []; // Stores numeric user angles [0, 45, 90,...]

    let imageWidth = 0, imageHeight = 0;
    let circleCenterX = 0, circleCenterY = 0, circleRadiusPx = 0;
    let currentBeadMathAngleRad = 0; // Standard math angle (0 is East/Right, positive is CCW)
    let lastSelectedUserAngleDeg = 0.0; // User convention angle (0 is Left)

    let isDragging = false;
    const ctx = canvas.getContext('2d');

    // Helper to find parent, similar to jQuery .closest()
    function búsquedaAscendente(el, selector) {
        let ancestro = el.parentElement;
        while (ancestro) {
            if (ancestro.matches(selector)) return ancestro.querySelector('.debug-filename-display'); // More specific if needed
            if (ancestro.querySelector && ancestro.querySelector(selector)) return ancestro.querySelector(selector);
            ancestro = ancestro.parentElement;
        }
        // Fallback to a sibling or child if not found in parent structure (less common for debug displays)
        const siblingOrChild = containerElement.parentElement?.querySelector(selector) || containerElement.querySelector(selector);
        if (siblingOrChild && siblingOrChild.classList.contains('debug-filename-display')) return siblingOrChild;

        return null;
    }


    function convertMathAngleToUserAngle(mathAngleRad) {
        let mathAngleDeg = mathAngleRad * (180 / Math.PI);
        if (mathAngleDeg < 0) mathAngleDeg += 360; // Normalize to 0-360
        // User: L=0, B=90, R=180, T=270
        // Math: L=180, B=270, R=0, T=90
        return (mathAngleDeg - 180 + 360) % 360;
    }

    function convertUserAngleToMathAngleRad(userAngleDeg) {
        // User: L=0, B=90, R=180, T=270
        // Math: L=180, B=270, R=0, T=90
        let mathAngleDeg = (userAngleDeg + 180) % 360;
        return mathAngleDeg * (Math.PI / 180);
    }

    function findClosestUserAngle(targetUserAngleDeg, userAngleList) {
        if (!userAngleList || userAngleList.length === 0) return null;
        return userAngleList.reduce((prev, curr) => {
            const distPrev = Math.min(Math.abs(targetUserAngleDeg - prev), 360 - Math.abs(targetUserAngleDeg - prev));
            const distCurr = Math.min(Math.abs(targetUserAngleDeg - curr), 360 - Math.abs(targetUserAngleDeg - curr));
            return distCurr < distPrev ? curr : prev;
        });
    }

    function drawCircleAndBead(beadMathAngleRadToShow) {
        if (!imageWidth || !imageHeight || !circleRadiusPx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the circle
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, circleRadiusPx, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = ANGLE_SELECTOR_CIRCLE_LINE_WIDTH_PX;
        ctx.stroke();

        // Calculate bead position based on the provided math angle
        const beadX = circleCenterX + circleRadiusPx * Math.cos(beadMathAngleRadToShow);
        const beadY = circleCenterY + circleRadiusPx * Math.sin(beadMathAngleRadToShow); // Sin for Y in math angle

        // Draw the bead
        ctx.beginPath();
        ctx.arc(beadX, beadY, ANGLE_SELECTOR_BEAD_RADIUS_PX, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 50, 50, 0.95)'; // Red bead
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            const userAngle = convertMathAngleToUserAngle(beadMathAngleRadToShow);
            debugFilenameDisplay.textContent = `Angle: ${userAngle.toFixed(1)}° (user) / ${((beadMathAngleRadToShow * 180/Math.PI)+360)%360 .toFixed(1)}° (math)`;
        }
    }

    function switchToStaticImage(clearDebug = true) {
        videoPlayer.style.display = 'none';
        if (!videoPlayer.paused) videoPlayer.pause();

        staticImage.style.display = 'block';
        if (imageWidth > 0 && imageHeight > 0) {
            canvas.style.display = 'block';
            canvas.width = imageWidth; // Ensure canvas is sized correctly
            canvas.height = imageHeight;
            // Redraw bead at its last selected position
            const mathAngleForRedraw = convertUserAngleToMathAngleRad(lastSelectedUserAngleDeg);
            drawCircleAndBead(mathAngleForRedraw);
        } else {
            canvas.style.display = 'none';
        }

        if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay && clearDebug) {
            // Keep last angle or clear if needed
            // debugFilenameDisplay.textContent = "Select an angle.";
        }
    }

    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;

        if (imageWidth > 0 && imageHeight > 0) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;

            circleRadiusPx = Math.min(imageWidth * ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION, imageHeight * ANGLE_SELECTOR_CIRCLE_RADIUS_PROPORTION); // Base radius on smaller dimension or width
            circleCenterX = imageWidth * ANGLE_SELECTOR_CIRCLE_CENTER_X_PROPORTION;
            circleCenterY = imageHeight * ANGLE_SELECTOR_CIRCLE_CENTER_Y_PROPORTION;

            // Set initial bead position (User Angle 0 = Left)
            lastSelectedUserAngleDeg = 0.0;
            currentBeadMathAngleRad = convertUserAngleToMathAngleRad(lastSelectedUserAngleDeg);

            console.log(`Angle Drag Demo (${containerElement.id || 'Unknown ID'}): Setup Canvas. Img: ${imageWidth}x${imageHeight}. Circle R: ${circleRadiusPx.toFixed(1)}px at (${circleCenterX.toFixed(1)}, ${circleCenterY.toFixed(1)})`);
        } else {
            console.error(`Angle Drag Demo (${containerElement.id}): Failed to get valid dimensions for static image. Path: ${INITIAL_IMAGE_PATH}. OffsetW: ${staticImage.offsetWidth}`);
            canvas.style.display = 'none';
        }
        switchToStaticImage(false); // Draw initial state
    }

    function handleDragStart(e) {
        if (!imageWidth || !circleRadiusPx) { // Essential geometric setup check
             console.warn(`Angle Drag Demo (${containerElement.id}): Drag start ignored, setup incomplete.`);
            if (typeof containerElement.forceRefreshDimensions === 'function') {
                containerElement.forceRefreshDimensions();
                if (!imageWidth || !circleRadiusPx) return; // Still not ready
            } else {
                return;
            }
        }

        if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            switchToStaticImage();
            // Potentially delay drag start a tiny bit if needed after UI switch
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
            // Snap bead to current click angle immediately
            currentBeadMathAngleRad = Math.atan2(canvasY - circleCenterY, canvasX - circleCenterX); // Standard atan2 for graphics
            drawCircleAndBead(currentBeadMathAngleRad);

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
            e.preventDefault(); // Prevent scrolling while dragging bead
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        currentBeadMathAngleRad = Math.atan2(canvasY - circleCenterY, canvasX - circleCenterX);
        drawCircleAndBead(currentBeadMathAngleRad);
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
            console.warn(`Angle Drag Demo (${containerElement.id}): No video data loaded.`);
            switchToStaticImage();
            return;
        }

        const finalUserAngleDeg = convertMathAngleToUserAngle(currentBeadMathAngleRad);
        const closestUserAngle = findClosestUserAngle(finalUserAngleDeg, availableUserAngles);

        if (closestUserAngle === null) {
            console.warn(`Angle Drag Demo (${containerElement.id}): Could not find a closest angle for ${finalUserAngleDeg.toFixed(1)}°`);
            switchToStaticImage();
            return;
        }

        lastSelectedUserAngleDeg = closestUserAngle; // Store for redraw
        const videoFilename = videoAngleData[closestUserAngle.toFixed(1)]; // JSON keys are like "0.0", "45.0"

        if (videoFilename) {
            if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Selected: ${closestUserAngle.toFixed(1)}° User. File: ${videoFilename}`;
            }
            videoPlayer.src = VIDEOS_BASE_PATH + videoFilename;

            const onVideoReadyToPlay = () => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                if (imageWidth > 0 && imageHeight > 0) {
                    videoPlayer.style.width = imageWidth + 'px';
                    videoPlayer.style.height = imageHeight + 'px';
                } else { // Fallback if image dimensions weren't captured
                    videoPlayer.style.width = '100%'; videoPlayer.style.height = 'auto';
                }
                staticImage.style.display = 'none';
                canvas.style.display = 'none';
                videoPlayer.style.display = 'block';
                videoPlayer.play().catch(err => {
                    console.error(`Angle Drag Demo (${containerElement.id}): Error playing video ${videoFilename}:`, err);
                    switchToStaticImage();
                     if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Error playing ${videoFilename}. ${err.message}`;
                    }
                });
            };
            const onVideoLoadError = (ev) => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                console.error(`Angle Drag Demo (${containerElement.id}): Error loading video ${videoFilename}:`, ev);
                if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Error loading ${videoFilename}. Check console.`;
                }
                switchToStaticImage();
            };
            videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
            videoPlayer.addEventListener('error', onVideoLoadError);
            videoPlayer.load();
        } else {
            console.warn(`Angle Drag Demo (${containerElement.id}): No video file found for angle ${closestUserAngle.toFixed(1)}`);
             if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `No video for angle ${closestUserAngle.toFixed(1)}`;
            }
            switchToStaticImage();
        }
    }

    function initializeInteractiveDemo() {
        staticImage.src = INITIAL_IMAGE_PATH;

        const newOnload = () => {
            staticImage.onload = null; // Prevent multiple calls if reloaded
            console.log(`Angle Drag Demo (${containerElement.id}): Image loaded (${staticImage.naturalWidth}x${staticImage.naturalHeight}). Path: ${INITIAL_IMAGE_PATH}`);
            if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) {
                setupImageAndCanvas();
            } else {
                console.error(`Angle Drag Demo (${containerElement.id}): Image loaded but has zero dimensions. Path: ${INITIAL_IMAGE_PATH}`);
                 if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Error: Image has 0 dimensions. Path: ${INITIAL_IMAGE_PATH}`;
                }
            }
        };
        staticImage.onload = newOnload;
        staticImage.onerror = () => {
            console.error(`Angle Drag Demo (${containerElement.id}): Error loading initial image. Path: ${INITIAL_IMAGE_PATH}`);
            staticImage.style.display = 'block'; // Keep it visible or show placeholder
            canvas.style.display = 'none';
            if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Error loading image: ${INITIAL_IMAGE_PATH}`;
            }
        };

        // If image is already cached and loaded by the browser
        if (staticImage.complete && staticImage.naturalWidth > 0 && staticImage.getAttribute('src') === INITIAL_IMAGE_PATH) {
            console.log(`Angle Drag Demo (${containerElement.id}): Image already complete on init. Calling setup via timeout.`);
            setTimeout(setupImageAndCanvas, 0); // Use timeout to ensure layout is stable
        } else if (staticImage.getAttribute('src') === INITIAL_IMAGE_PATH && staticImage.naturalWidth === 0){
             console.log(`Angle Drag Demo (${containerElement.id}): Image src set but not fully loaded/decoded (0 naturalWidth). Onload will handle.`);
        }


        // Attach mousedown/touchstart listeners to the canvas for precision, or container for broader interaction area
        // Using canvas is often better to ensure coordinates are relative to it.
        // However, if canvas is pointer-events: none, use container. Here, canvas is active.
        canvas.removeEventListener('mousedown', handleDragStart); // Clear if any old ones
        canvas.addEventListener('mousedown', handleDragStart);
        canvas.removeEventListener('touchstart', handleDragStart);
        canvas.addEventListener('touchstart', handleDragStart, { passive: false });

        videoPlayer.addEventListener('ended', () => switchToStaticImage());
        videoPlayer.addEventListener('error', (e) => {
            console.error(`Angle Drag Demo (${containerElement.id}): Video playback error.`, e);
            switchToStaticImage();
        });
        // UX: Tap video to go back to selection
        videoPlayer.addEventListener('click', () => {
            if (!videoPlayer.paused) {
                switchToStaticImage();
            }
        });
    }

    // Expose a method to refresh dimensions, similar to the example
    containerElement.forceRefreshDimensions = function() {
        console.log(`Angle Drag Demo (${containerElement.id}): forceRefreshDimensions called. Current image src: ${staticImage.getAttribute('src')}`);
        if (!staticImage.getAttribute('src') || staticImage.getAttribute('src') !== INITIAL_IMAGE_PATH) {
            console.log(`Angle Drag Demo (${containerElement.id}): Image source is different or not set. Re-initializing image source.`);
            staticImage.src = INITIAL_IMAGE_PATH; // This will trigger onload in initializeInteractiveDemo if not already loaded
        } else if (staticImage.complete && staticImage.naturalWidth > 0) {
            console.log(`Angle Drag Demo (${containerElement.id}): Image complete on refresh, running setupImageAndCanvas.`);
            setupImageAndCanvas();
        } else if (staticImage.getAttribute('src')) {
             console.log(`Angle Drag Demo (${containerElement.id}): Image src is set, but not complete or naturalWidth is 0. Onload should handle it.`);
             // If onload is not firing, might need to re-trigger it.
             if (!staticImage.onload) { // if onload was nulled
                staticImage.onload = () => { /* as in initializeInteractiveDemo */
                    staticImage.onload = null;
                    if (staticImage.naturalWidth > 0 && staticImage.naturalHeight > 0) setupImageAndCanvas();
                 };
             }
        } else {
            console.log(`Angle Drag Demo (${containerElement.id}): Image src not set. Setting it now.`);
            staticImage.src = INITIAL_IMAGE_PATH;
        }
    };

    // Initial data fetch for video angles
    if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
        debugFilenameDisplay.textContent = "Loading angle data...";
    }

    fetch(VIDEO_DATA_PATH)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${VIDEO_DATA_PATH}`);
            }
            return response.json();
        })
        .then(data => {
            videoAngleData = data;
            availableUserAngles = Object.keys(videoAngleData).map(parseFloat).sort((a, b) => a - b);
            if (availableUserAngles.length === 0) {
                 console.error(`Angle Drag Demo (${containerElement.id}): No angles found in ${VIDEO_DATA_PATH}.`);
                 if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Error: No angles in ${VIDEO_DATA_PATH}.`;
                }
                // Proceed with initialization to show the image at least
            } else {
                 console.log(`Angle Drag Demo (${containerElement.id}): Loaded ${availableUserAngles.length} angles:`, availableUserAngles);
                 if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = "Angle data loaded. Initializing demo.";
                }
            }
            initializeInteractiveDemo();
        })
        .catch(error => {
            console.error(`Angle Drag Demo (${containerElement.id}): Fatal Error fetching or processing video data from ${VIDEO_DATA_PATH}:`, error);
            if (ANGLE_SELECTOR_DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Error: Failed to load ${VIDEO_DATA_PATH}. Check console.`;
            }
            initializeInteractiveDemo(); // Attempt to init basic structure (image display) anyway
        });
}