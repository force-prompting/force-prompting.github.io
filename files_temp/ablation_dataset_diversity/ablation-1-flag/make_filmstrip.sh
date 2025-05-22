module load ffmpeg

ffmpeg -i bad-model/step-5000__file_id__campfire4__speed_0.67__angle_0.0__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,20),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-flag-campfire.png -y
ffmpeg -i bad-model/step-5000__file_id__dress3__speed_0.67__angle_180.0__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,33),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-flag-dress.png -y