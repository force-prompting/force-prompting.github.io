import os
import shutil

def copy_raw_version_of_image(source_directory, destination_directory, image_name, force_type):
    """
    Find and copy an image from source directory to destination directory.
    
    Args:
        source_directory (str): Path to the source directory
        destination_directory (str): Path to the destination directory
        image_name (str): Name of the image file to copy
    """

    # image_name_raw_version = image_name.replace("_with_pretty_force_prompt.mp4", ".mp4").replace("___video", "__video")
    image_name_raw_version = image_name

    # Find the image in the source directory
    source_path = os.path.join(source_directory, image_name_raw_version)
    
    # Copy the image to the destination directory
    destination_path = os.path.join(destination_directory, image_name_raw_version)    
    shutil.copy2(source_path, destination_path)
    print(f"Successfully copied '{image_name_raw_version}' to '{destination_directory}'.")

if __name__ == "__main__":

    for img_name in [
        "step-5000__file_id__steamybeverage2__speed_0.67__angle_0.0__video_0",
        "step-5000__file_id__whitecloth1__speed_0.67__angle_180.0__video_0"
    ]:

        src_dir = "output/2025-04-13-wind-force-updated-dataloader/2025-04-18_19-48-49-ablation-1-background/step-5000-videos"
        dst_dir = "scripts/2025-05-13-figures/ablation_dataset_diversity/ablation-1-background/bad-model"
        copy_raw_version_of_image(src_dir, dst_dir, img_name + ".mp4", "wind")


# output/2025-04-07-point-force-unified-model/2025-04-18_08-57-25-ablation-1-ball/step-5000-videos
# output/2025-04-13-wind-force-updated-dataloader/2025-04-17_10-07-13-ablation-1-flag/step-5000-videos
# 