module load ffmpeg

ffmpeg -i bad-model/step-5000__file_id__balloon3__xpos_0.16__ypos_0.47__angle_0.00__force_0.50__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-ball-balloon.png -y
ffmpeg -i bad-model/step-5000__file_id__toytrainontrack7__xpos_0.38__ypos_0.47__angle_0.00__force_0.50__video_0.mp4 -vf "select=eq(n\,0)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=2x1" -frames:v 1 filmstrip-ablation-1-ball-toytrain.png -y