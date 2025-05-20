// --- Configuration ---
const INITIAL_IMAGE_PATH = "scsc-static/rose5-grid/_rosegrid5.png"; // 🌟 REPLACE with your image path (e.g., "scsc-static/images/your-interactive-image.png")
const VIDEOS_BASE_PATH = "scsc-static/rose5-grid/videos/"; // 🌟 REPLACE with path to your videos folder (e.g., "scsc-static/videos/poke_demo_videos/")
const MAX_DRAG_PROPORTION_OF_WIDTH = 0.5; // User arrow max length is 1/2 of frame width
const DEBUG_SHOW_FILENAME = true; // 🌟 NEW FLAG: Set to true to show filename, false to hide

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

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('demoContainer');
    const staticImage = document.getElementById('staticImage');
    const canvas = document.getElementById('canvasOverlay');
    const videoPlayer = document.getElementById('videoPlayer');
    const debugFilenameDisplay = document.getElementById('debugFilenameDisplay');

    if (!container || !staticImage || !canvas || !videoPlayer) {
        console.error("Interactive demo elements not found! Make sure the HTML structure is correct.");
        if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            debugFilenameDisplay.textContent = "Error: Core demo HTML elements missing.";
            debugFilenameDisplay.style.display = 'block';
        }
        return;
    }
    if (DEBUG_SHOW_FILENAME && !debugFilenameDisplay) {
        console.warn("Debug filename display element ('debugFilenameDisplay') not found in HTML, but DEBUG_SHOW_FILENAME is true.");
    }

    // Set poster for video player to initial image for better visual fallback
    videoPlayer.poster = INITIAL_IMAGE_PATH;

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

    function switchToStaticImage(clearDebug = true) {
        videoPlayer.style.display = 'none';
        if (!videoPlayer.paused) {
            videoPlayer.pause();
        }
        // No longer removing src or calling load() here to prevent conflicts

        staticImage.style.display = 'block';
        canvas.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (DEBUG_SHOW_FILENAME && debugFilenameDisplay && clearDebug) {
            // Clear filename only if it's not an error message or "not found"
             if (debugFilenameDisplay.textContent &&
                !debugFilenameDisplay.textContent.toLowerCase().includes("error") &&
                !debugFilenameDisplay.textContent.toLowerCase().includes("not found") &&
                !debugFilenameDisplay.textContent.toLowerCase().includes("loading")) {
                debugFilenameDisplay.textContent = '';
                debugFilenameDisplay.style.display = 'none';
            }
        }
    }
    
    function setupImageAndCanvas() {
        imageWidth = staticImage.offsetWidth;
        imageHeight = staticImage.offsetHeight;
        if (imageWidth === 0 || imageHeight === 0) {
            console.warn("Image dimensions are zero. Ensure image is visible and loaded.");
            return;
        }
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        videoPlayer.width = imageWidth; // Match video player dimensions
        videoPlayer.height = imageHeight;
        maxPixelDragLength = imageWidth * MAX_DRAG_PROPORTION_OF_WIDTH;
        console.log(`Interactive demo image: ${imageWidth}x${imageHeight}, Max drag: ${maxPixelDragLength}px`);
        switchToStaticImage();
    }

    staticImage.onload = () => {
        setupImageAndCanvas();
    };
    
    // Ensure image src is set if not already, then setup
    if (staticImage.getAttribute('src') !== INITIAL_IMAGE_PATH || !staticImage.complete) {
        staticImage.src = INITIAL_IMAGE_PATH; // This will trigger onload if src changes or image wasn't loaded
    } else if (staticImage.complete && staticImage.naturalWidth > 0) { // Image already loaded
        setupImageAndCanvas();
    }


    container.addEventListener('mousedown', (e) => {
        // If video is playing, click switches to static image AND allows immediate drawing
        if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            switchToStaticImage();
            // DO NOT return; proceed to set up dragging for the current click.
        }

        if (!imageWidth || imageWidth === 0) {
            console.warn("Image not fully loaded or dimensions not set. Attempting setup.");
            setupImageAndCanvas(); 
            if (!imageWidth || imageWidth === 0) {
                 console.error("Failed to setup image dimensions on mousedown. Aborting drag.");
                 return; // Abort if setup fails
            }
        }

        isDragging = true;
        const rect = container.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        e.preventDefault(); // Prevent default drag (e.g., image ghost) and text selection
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
        let endX = e.clientX - rect.left; 
        let endY = e.clientY - rect.top;

        let dx = endX - startX;
        let dy = endY - startY;
        let pixelLength = Math.sqrt(dx * dx + dy * dy);

        if (pixelLength < 1) { 
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
                const jsonY_equivalent_from_top = 1.0 - jsonCoord.y;
                const dist = Math.sqrt(Math.pow(normStartX - jsonCoord.x, 2) + Math.pow(normStartY - jsonY_equivalent_from_top, 2));
                if (dist < minCoordDist) {
                    minCoordDist = dist;
                    closestCoordKey = keyStr;
                }
            }
        });

        if (!closestCoordKey) {
            console.error("Could not find a closest coordinate point in JSON.");
            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = "Debug: Closest coordinate point not found.";
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage();
            return;
        }

        let angleDeg = Math.atan2(-dy, dx) * (180 / Math.PI);
        if (angleDeg < 0) angleDeg += 360;

        const coordData = videoData[closestCoordKey];
        if (!coordData) {
            console.error("No data for coordinate:", closestCoordKey);
            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Debug: No data for coordinate ${closestCoordKey}.`;
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage();
            return;
        }

        const availableAngleStrings = Object.keys(coordData);
        const availableAnglesNumeric = availableAngleStrings.map(s => parseFloat(s));
        const closestNumericAngle = findClosestNumericValue(angleDeg, availableAnglesNumeric);

        if (closestNumericAngle === null) {
            console.error("Could not find a closest angle for:", closestCoordKey, angleDeg);
            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Debug: No closest angle for ${closestCoordKey}, ${angleDeg.toFixed(1)}°.`;
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage();
            return;
        }
        const closestAngleKey = availableAngleStrings.find(key => parseFloat(key) === closestNumericAngle);

        const normalizedForce = pixelLength / maxPixelDragLength;
        const targetNumericForce = findClosestNumericValue(normalizedForce, PREDEFINED_FORCES);

        if (targetNumericForce === null) {
            console.error("Could not determine target force category for normalized force:", normalizedForce);
            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Debug: Could not determine target force category.`;
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage();
            return;
        }
        const targetForceKey = targetNumericForce.toFixed(3);

        const angleData = coordData[closestAngleKey];
        if (!angleData) {
            console.error("No angle data for:", closestCoordKey, closestAngleKey);
             if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Debug: No data for ${closestCoordKey} -> ${closestAngleKey}.`;
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage();
            return;
        }

        const videoFileArray = angleData[targetForceKey];

        if (videoFileArray && videoFileArray.length > 0) {
            const videoFilename = videoFileArray[0];
            console.log(`Preparing: Coord ${closestCoordKey}, Angle ${closestAngleKey} (${angleDeg.toFixed(1)}°), Force ${targetForceKey} (norm: ${normalizedForce.toFixed(2)}), File: ${videoFilename}`);

            // Ensure static image is visible, video is hidden (this is our "loading" state)
            staticImage.style.display = 'block';
            canvas.style.display = 'block'; // Keep canvas with arrow visible during load prep
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear arrow for clean slate if needed, or keep drawn one
            drawArrow(startX, startY, startX + dx, startY + dy); // Redraw the final arrow on canvas before video load

            videoPlayer.style.display = 'none';
            if(!videoPlayer.paused) videoPlayer.pause();


            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Loading: ${videoFilename}`;
                debugFilenameDisplay.style.display = 'block';
            }
            
            videoPlayer.src = VIDEOS_BASE_PATH + videoFilename;

            const onVideoReadyToPlay = () => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);

                if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Playing: ${videoFilename}`;
                }
                
                staticImage.style.display = 'none';
                canvas.style.display = 'none'; // Hide canvas when video plays
                videoPlayer.style.display = 'block';
                videoPlayer.play().catch(err => {
                    console.error("Error playing video:", err);
                    if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                        debugFilenameDisplay.textContent = `Error playing: ${videoFilename}`;
                    }
                    switchToStaticImage();
                });
            };

            const onVideoLoadError = (e) => {
                videoPlayer.removeEventListener('loadeddata', onVideoReadyToPlay);
                videoPlayer.removeEventListener('error', onVideoLoadError);
                console.error(`Error loading video data for ${videoFilename}:`, e);
                if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                    debugFilenameDisplay.textContent = `Error loading: ${videoFilename}`;
                }
                switchToStaticImage();
            };
            
            videoPlayer.addEventListener('loadeddata', onVideoReadyToPlay);
            videoPlayer.addEventListener('error', onVideoLoadError);
            videoPlayer.load(); // Explicitly call load

        } else {
            console.warn(`Video not found for: Coord ${closestCoordKey}, Angle ${closestAngleKey}, Force ${targetForceKey}`);
            if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
                debugFilenameDisplay.textContent = `Video not found for: ${closestCoordKey} / ${closestAngleKey}° / ${targetForceKey} force`;
                debugFilenameDisplay.style.display = 'block';
            }
            switchToStaticImage(); // Show static image, clear arrow from canvas
        }
    });

    videoPlayer.addEventListener('ended', () => {
        switchToStaticImage();
    });

    videoPlayer.addEventListener('error', (e) => {
        // This is a general error handler for the video element, e.g., during playback
        // Specific load errors are handled by onVideoLoadError
        console.error("Video player error:", e);
        const currentVideoSrc = videoPlayer.currentSrc || "unknown video";
        if (DEBUG_SHOW_FILENAME && debugFilenameDisplay) {
            debugFilenameDisplay.textContent = `Video player error for: ${currentVideoSrc.split('/').pop()}`;
            debugFilenameDisplay.style.display = 'block';
        }
        switchToStaticImage();
    });

    // Initial state: show the static image
    // The staticImage.onload handler or its alternative path should call setupImageAndCanvas, which calls switchToStaticImage.
    // If the image path is invalid or image fails to load, console errors will indicate this.
    // A final switchToStaticImage() call can be a fallback if setupImageAndCanvas wasn't triggered.
    if (!imageWidth && staticImage.complete && staticImage.naturalWidth === 0) {
        // Image might have failed to load if src was initially bad and onload didn't fire correctly
        console.warn("Initial image may not have loaded correctly. Forcing static view.");
        switchToStaticImage();
    }
});