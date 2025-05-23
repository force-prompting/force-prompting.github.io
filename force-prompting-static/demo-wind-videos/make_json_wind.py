import os
import sys
import json
import re

def generate_video_spec(directory_path):
    """
    Generates a video_spec.json file from MP4 files in a 'videos' subdirectory.

    Args:
        directory_path (str): The path to the main directory containing the
                              'videos' subdirectory.
    """
    # Construct the path to the 'videos' subdirectory
    videos_dir = os.path.join(directory_path, "videos")
    output_json_path = os.path.join(directory_path, "video_specs.json")

    # Check if the 'videos' directory exists
    if not os.path.isdir(videos_dir):
        print(f"Error: The 'videos' directory was not found at '{videos_dir}'")
        sys.exit(1)

    video_data = {}
    # Regex to extract the angle from the filename
    # It looks for '__angle_' followed by one or more digits, optionally a decimal point and more digits
    angle_pattern = re.compile(r"__angle_(\d+\.?\d*)__")

    print(f"Scanning for .mp4 files in: {videos_dir}")

    # Iterate through files in the 'videos' directory
    for filename in os.listdir(videos_dir):
        if filename.endswith(".mp4"):
            match = angle_pattern.search(filename)
            if match:
                try:
                    # Extract the angle as a float for numerical sorting
                    angle_str = match.group(1)
                    angle_float = float(angle_str)
                    video_data[angle_float] = filename
                    print(f"Found: {filename}, Angle: {angle_float}")
                except ValueError:
                    print(f"Warning: Could not parse angle from filename: {filename}")
            else:
                print(f"Warning: No angle found in filename: {filename}")

    if not video_data:
        print("No .mp4 files with angles found in the 'videos' directory. 'video_spec.json' will be empty.")

    # Sort the video_data by angle (key) numerically
    # The keys of the final JSON must be strings, but we sort by float values
    sorted_video_spec = {str(angle): video_data[angle] for angle in sorted(video_data.keys())}

    # Write the sorted data to video_spec.json
    try:
        with open(output_json_path, 'w') as f:
            json.dump(sorted_video_spec, f, indent=4)
        print(f"\nSuccessfully created '{output_json_path}'")
    except IOError as e:
        print(f"Error: Could not write to '{output_json_path}': {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Check if a directory path argument is provided
    if len(sys.argv) != 2:
        print("Usage: python script_name.py <path_to_directory>")
        print("Example: python script_name.py /path/to/your/project")
        sys.exit(1)

    input_directory = sys.argv[1]

    # Check if the provided path is a valid directory
    if not os.path.isdir(input_directory):
        print(f"Error: The provided path '{input_directory}' is not a valid directory.")
        sys.exit(1)

    generate_video_spec(input_directory)
