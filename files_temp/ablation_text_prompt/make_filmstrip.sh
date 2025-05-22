module load ffmpeg

ffmpeg -i \
    no-wind-keyword-train-yes-wind-keyword-test/step-5000__file_id__keywordwindsteamybeverage2__speed_0.67__angle_0.0__video_0.mp4 \
    -vf "select=eq(n\,0)+eq(n\,15)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=3x1" \
    -frames:v 1 \
    no-wind-keyword-train-yes-wind-keyword-test.png -y

ffmpeg -i \
    no-wind-keyword-train-no-wind-keyword-test/step-5000__file_id__nokeywordwindsteamybeverage2__speed_0.67__angle_0.0__video_0.mp4 \
    -vf "select=eq(n\,0)+eq(n\,14)+eq(n\,45),scale=320:-1,pad=326:ih+6:3:3:white,tile=3x1" \
    -frames:v 1 \
    no-wind-keyword-train-no-wind-keyword-test.png -y

ffmpeg -i \
    yes-wind-keyword-train-yes-wind-keyword-test/step-5000__file_id__keywordwindsteamybeverage2__speed_0.67__angle_0.0__video_0.mp4 \
    -vf "select=eq(n\,0)+eq(n\,30)+eq(n\,48),scale=320:-1,pad=326:ih+6:3:3:white,tile=3x1" \
    -frames:v 1 \
    yes-wind-keyword-train-yes-wind-keyword-test.png -y

ffmpeg -i \
    yes-wind-keyword-train-no-wind-keyword-test/step-5000__file_id__nokeywordwindsteamybeverage2__speed_0.67__angle_0.0__video_0.mp4 \
    -vf "select=eq(n\,0)+eq(n\,33)+eq(n\,46),scale=320:-1,pad=326:ih+6:3:3:white,tile=3x1" \
    -frames:v 1 \
    yes-wind-keyword-train-no-wind-keyword-test.png -y


