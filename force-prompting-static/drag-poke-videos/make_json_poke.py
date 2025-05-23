import os
import json
import re

def organize_videos_by_specs(directory_path):
    """
    Scans the 'videos' subdirectory for MP4 files and organizes them into a JSON
    structure based on their position, angle, and force parameters extracted
    from the filenames.

    Args:
        directory_path (str): The path to the main directory containing the
                              'videos' subdirectory.
    """
    videos_dir = os.path.join(directory_path, "videos")
    if not os.path.isdir(videos_dir):
        print(f"Error: The 'videos' directory was not found at {videos_dir}")
        return

    video_data = {}
    
    # Regex to extract xpos, ypos, angle, and force
    # We use non-greedy matching for the values and ensure they are floats
    pattern = re.compile(r"__xpos_(\d+\.\d+)__ypos_(\d+\.\d+)__angle_(\d+\.\d+)__force_(\d+\.\d+)")

    for filename in os.listdir(videos_dir):
        if filename.endswith(".mp4"):
            match = pattern.search(filename)
            if match:
                xpos = float(match.group(1))
                ypos = float(match.group(2))
                angle = float(match.group(3))
                force = float(match.group(4))

                # Create keys as strings to match the desired JSON output
                position_key = f"({xpos}, {ypos})"
                angle_key = f"{angle:.2f}" # Format to two decimal places
                force_key = f"{force:.3f}" # Format to three decimal places

                if position_key not in video_data:
                    video_data[position_key] = {}
                if angle_key not in video_data[position_key]:
                    video_data[position_key][angle_key] = {}
                if force_key not in video_data[position_key][angle_key]:
                    video_data[position_key][angle_key][force_key] = []
                
                video_data[position_key][angle_key][force_key].append(filename)
            else:
                print(f"Warning: Could not parse filename: {filename}")

    output_path = os.path.join(directory_path, "video_specs.json")
    with open(output_path, "w") as f:
        json.dump(video_data, f, indent=4)
    print(f"Successfully created video_specs.json at {output_path}")

if __name__ == "__main__":
    # Example usage:
    # Replace 'path/to/your/main/directory' with the actual path
    # For testing, you might want to create a dummy directory structure and files
    
    # Example for creating dummy files for testing purposes:
    # import os
    # dummy_dir = "test_data"
    # dummy_videos_dir = os.path.join(dummy_dir, "videos")
    # os.makedirs(dummy_videos_dir, exist_ok=True)
    # dummy_files = [
    #     "step-5000__file_id__gridornament1__xpos_0.69__ypos_0.47__angle_0.00__force_0.050__video_0.mp4",
    #     "step-5000__file_id__gridornament1__xpos_0.69__ypos_0.47__angle_0.00__force_0.250__video_0.mp4",
    #     "step-5000__file_id__gridornament1__xpos_0.69__ypos_0.47__angle_180.00__force_0.050__video_0.mp4",
    #     "step-5000__file_id__gridornament1__xpos_0.69__ypos_0.47__angle_180.00__force_0.250__video_0.mp4",
    #     "step-5000__file_id__gridornament2__xpos_0.10__ypos_0.20__angle_90.00__force_0.500__video_0.mp4"
    # ]
    # for f_name in dummy_files:
    #     with open(os.path.join(dummy_videos_dir, f_name), 'w') as f:
    #         f.write("dummy content")

    # Check if a directory path argument is provided
    import sys

    if len(sys.argv) != 2:
        print("Usage: python script_name.py <path_to_directory>")
        print("Example: python script_name.py /path/to/your/project")
        sys.exit(1)

    input_directory = sys.argv[1]

    # Check if the provided path is a valid directory
    if not os.path.isdir(input_directory):
        print(f"Error: The provided path '{input_directory}' is not a valid directory.")
        sys.exit(1)

    organize_videos_by_specs(input_directory)