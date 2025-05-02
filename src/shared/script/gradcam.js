const cv = require('opencv4nodejs');
const path = require('path');
const fs = require('fs');

const inputPath = process.argv[2];

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Input image not found.');
  process.exit(1);
}

const img = cv.imread(inputPath);
const heatmap = new cv.Mat(
  img.rows,
  img.cols,
  cv.CV_8UC3,
  new cv.Vec3(0, 0, 0),
);

const center = new cv.Point2(img.cols / 2, img.rows / 2);
const radius = Math.floor(Math.min(img.cols, img.rows) / 4);
cv.circle(heatmap, center, radius, new cv.Vec3(0, 0, 255), -1);

const blurred = heatmap.gaussianBlur(new cv.Size(51, 51), 0);

const blended = img.addWeighted(0.6, blurred, 0.4, 0);

const outputPath = inputPath.replace(/\.(jpg|png)$/i, '_gradcam.jpg');
cv.imwrite(outputPath, blended);
console.log(outputPath);
