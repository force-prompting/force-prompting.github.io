// --- Configuration ---
const INITIAL_IMAGE_PATH = "scsc-static/rose5-grid/_rosegrid5.png"; // 🌟 REPLACE with your image path (e.g., "scsc-static/images/your-interactive-image.png")
const VIDEOS_BASE_PATH = "scsc-static/rose5-grid/videos/"; // 🌟 REPLACE with path to your videos folder (e.g., "scsc-static/videos/poke_demo_videos/")
const MAX_DRAG_PROPORTION_OF_WIDTH = 0.5; // User arrow max length is 1/2 of frame width

// 🌟 PASTE YOUR FULL JSON DATA HERE
// Ensure the keys (coordinates, angles, forces) are strings as in your example.
const videoData = {
    "(0.43, 0.50)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_225.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.43__ypos_0.50__angle_225.00__force_0.950__video_0.mp4"
            ]
        }
    },
    "(0.46, 0.62)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.46__ypos_0.62__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.58, 0.40)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.58__ypos_0.40__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.67, 0.32)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.67__ypos_0.32__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.71, 0.64)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.71__ypos_0.64__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.76, 0.32)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.76__ypos_0.32__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.79, 0.79)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.79__ypos_0.79__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    },
    "(0.83, 0.70)": {
        "0.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_0.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_0.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_0.00__force_0.950__video_0.mp4"
            ]
        },
        "45.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_45.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_45.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_45.00__force_0.950__video_0.mp4"
            ]
        },
        "90.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_90.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_90.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_90.00__force_0.950__video_0.mp4"
            ]
        },
        "135.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_135.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_135.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_135.00__force_0.950__video_0.mp4"
            ]
        },
        "180.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_180.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_180.00__force_0.500__video_0.mp4"
            ],
            "0.950": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_180.00__force_0.950__video_0.mp4"
            ]
        },
        "225.00": {
            "0.050": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_225.00__force_0.050__video_0.mp4"
            ],
            "0.500": [
                "step-5000__file_id__rosegrid5__xpos_0.83__ypos_0.70__angle_225.00__force_0.500__video_0.mp4"
            ]
        }
    }
};
const PREDEFINED_FORCES = [0.050, 0.500, 0.950];
// --- End Configuration ---

// Ensure DOM elements are available before trying to get them.
// We'll add event listeners after the DOM is loaded.
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('demoContainer');
    const staticImage = document.getElementById('staticImage');
    const canvas = document.getElementById('canvasOverlay');
    const videoPlayer = document.getElementById('videoPlayer');

    // Check if elements exist before proceeding
    if (!container || !staticImage || !canvas || !videoPlayer) {
        console.error("Interactive demo elements not found! Make sure the HTML structure is correct.");
        return;
    }
    const ctx = canvas.getContext('2d');

    let isDragging = false;
    let startX, startY;
    let imageWidth, imageHeight, maxPixelDragLength;

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
        console.error("Error parsing coordinate string:", coordStr, e);
        return null;
        }
    }

    function drawArrow(x1, y1, x2, y2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    function switchToStaticImage() {
        videoPlayer.style.display = 'none';
        videoPlayer.pause();
        if (videoPlayer.src !== '' && videoPlayer.src !== null) { // Check if src is set and not empty
             try { videoPlayer.removeAttribute('src'); } catch(e) {/* ignore */} // More robust way to clear
             try { videoPlayer.load(); } catch(e) {/* ignore */} // Force re-evaluation or stop loading
        }
        staticImage.style.display = 'block';
        canvas.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Function to set up image dimensions and canvas
    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;
        if (imageWidth === 0 || imageHeight === 0) {
            // Image might not be fully rendered yet or hidden
            console.warn("Image dimensions are zero. Retrying setup shortly or ensure image is visible.");
            // setTimeout(setupImageAndCanvas, 100); // Optional: retry if needed, but onload should handle
            return;
        }
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        maxPixelDragLength = imageWidth * MAX_DRAG_PROPORTION_OF_WIDTH;
        console.log(`Interactive demo image: ${imageWidth}x${imageHeight}, Max drag: ${maxPixelDragLength}px`);
        switchToStaticImage(); // Ensure initial state
    }

    staticImage.onload = () => {
        setupImageAndCanvas();
    };
    
    // If image is already cached and loaded, onload might not fire
    if (staticImage.complete && staticImage.naturalWidth > 0) {
        staticImage.onload(); // Manually call if already loaded
    } else if (staticImage.naturalWidth === 0 && staticImage.src !== INITIAL_IMAGE_PATH) {
        // If src is not yet set by config, set it now
        staticImage.src = INITIAL_IMAGE_PATH;
    } else if (staticImage.naturalWidth === 0 && staticImage.src === INITIAL_IMAGE_PATH) {
        // Src is set, but image not loaded, wait for onload
    }


    container.addEventListener('mousedown', (e) => {
        if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            switchToStaticImage();
            return;
        }
        // Ensure image dimensions are known before starting interaction
        if (!imageWidth || imageWidth === 0) {
            console.warn("Image not fully loaded or dimensions not set. Please wait.");
            setupImageAndCanvas(); // Try to set up again
            if (!imageWidth || imageWidth === 0) return; // Still not ready
        }

        isDragging = true;
        const rect = container.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = container.getBoundingClientRect();
        let currentX = e.clientX - rect.left;
        let currentY = e.clientY - rect.top;

        let dx = currentX - startX;
        let dy = currentY - startY;
        let dragDistance = Math.sqrt(dx * dx + dy * dy);

        if (dragDistance > maxPixelDragLength) {
        const ratio = maxPixelDragLength / dragDistance;
        dx *= ratio;
        dy *= ratio;
        currentX = startX + dx;
        currentY = startY + dy;
        }
        drawArrow(startX, startY, currentX, currentY);
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const rect = container.getBoundingClientRect();
        let endX = e.clientX - rect.left; // Use clientX/Y for consistency with mousedown
        let endY = e.clientY - rect.top;

        let dx = endX - startX;
        let dy = endY - startY;
        let pixelLength = Math.sqrt(dx * dx + dy * dy);

        if (pixelLength < 1) { // Minimum drag to trigger, avoid zero division
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        if (pixelLength > maxPixelDragLength) {
            const ratio = maxPixelDragLength / pixelLength;
            dx *= ratio;
            dy *= ratio;
            pixelLength = maxPixelDragLength;
        }

        const normStartX = startX / imageWidth;
        const normStartY = startY / imageHeight;

        const availableJsonCoordKeys = Object.keys(videoData);
        let closestCoordKey = null;
        let minCoordDist = Infinity;

        availableJsonCoordKeys.forEach(keyStr => {
        const jsonCoord = parseCoordString(keyStr);
        if (jsonCoord) {
            const dist = Math.sqrt(Math.pow(normStartX - jsonCoord.x, 2) + Math.pow(normStartY - jsonCoord.y, 2));
            if (dist < minCoordDist) {
            minCoordDist = dist;
            closestCoordKey = keyStr;
            }
        }
        });

        if (!closestCoordKey) {
        console.error("Could not find a closest coordinate point in JSON.");
        switchToStaticImage();
        return;
        }

        let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angleDeg < 0) angleDeg += 360;

        const coordData = videoData[closestCoordKey];
        if (!coordData) {
            console.error("No data for coordinate:", closestCoordKey);
            switchToStaticImage();
            return;
        }

        const availableAngleStrings = Object.keys(coordData);
        const availableAnglesNumeric = availableAngleStrings.map(s => parseFloat(s));
        const closestNumericAngle = findClosestNumericValue(angleDeg, availableAnglesNumeric);

        if (closestNumericAngle === null) {
            console.error("Could not find a closest angle for:", closestCoordKey, angleDeg);
            switchToStaticImage();
            return;
        }
        const closestAngleKey = availableAngleStrings.find(key => parseFloat(key) === closestNumericAngle);

        const normalizedForce = pixelLength / maxPixelDragLength;
        const targetNumericForce = findClosestNumericValue(normalizedForce, PREDEFINED_FORCES);

        if (targetNumericForce === null) {
            console.error("Could not determine target force category for normalized force:", normalizedForce);
            switchToStaticImage();
            return;
        }
        const targetForceKey = targetNumericForce.toFixed(3);

        const angleData = coordData[closestAngleKey];
        if (!angleData) {
            console.error("No angle data for:", closestCoordKey, closestAngleKey);
            switchToStaticImage();
            return;
        }

        const videoFileArray = angleData[targetForceKey];

        if (videoFileArray && videoFileArray.length > 0) {
        const videoFilename = videoFileArray[0];
        console.log(`Playing: Coord ${closestCoordKey}, Angle ${closestAngleKey} (${angleDeg.toFixed(1)}°), Force ${targetForceKey} (norm: ${normalizedForce.toFixed(2)}), File: ${videoFilename}`);

        staticImage.style.display = 'none';
        canvas.style.display = 'none';
        videoPlayer.style.display = 'block';
        videoPlayer.src = VIDEOS_BASE_PATH + videoFilename;
        videoPlayer.play().catch(err => {
            console.error("Error playing video:", err);
            switchToStaticImage();
        });
        } else {
        console.warn(`Video not found for: Coord ${closestCoordKey}, Angle ${closestAngleKey}, Force ${targetForceKey}`);
        switchToStaticImage();
        }
    });

    videoPlayer.addEventListener('ended', () => {
        switchToStaticImage();
    });

    videoPlayer.addEventListener('error', (e) => {
        console.error("Video player error:", e);
        // alert("Error: Could not play the video. Check console for details."); // Optional user alert
        switchToStaticImage();
    });

    // Ensure the image src is set from config if not already set by HTML
    if (!staticImage.getAttribute('src') || staticImage.getAttribute('src') === "YOUR_IMAGE_PATH.PNG") {
        staticImage.src = INITIAL_IMAGE_PATH;
    }
     // Initial call to set up things if image is somehow already loaded but onload didn't run for setup
    if (staticImage.complete && staticImage.naturalWidth > 0 && (!imageWidth || imageWidth === 0)) {
        setupImageAndCanvas();
    } else {
        switchToStaticImage(); // Ensure clean initial state
    }
});