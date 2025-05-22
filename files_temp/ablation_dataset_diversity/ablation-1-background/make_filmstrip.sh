module load ffmpeg

ffmpeg -i bad-model/step-5000__file_id__steamybeverage2__speed_0.67__angle_0.0__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-background-steam.png -y
ffmpeg -i bad-model/step-5000__file_id__whitecloth1__speed_0.67__angle_180.0__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-background-cloth.png -y