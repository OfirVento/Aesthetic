import type { FacialRegion } from "@/types";
import type { LandmarkPoint } from "./mediapipe";

// MediaPipe landmark indices for each facial region
// Points are in ORDER to form a closed polygon path (not scattered)
const REGION_LANDMARKS: Record<FacialRegion, number[]> = {
  lips: [
    // Outer lip contour - clockwise from left corner
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    409, 270, 269, 267, 0, 37, 39, 40, 185, 61
  ],
  jawline: [
    // Jawline contour - from left ear to right ear along jaw
    234, 127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356, 454,
    323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234
  ],
  chin: [
    // Chin area - lower jaw region
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162,
    21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356,
    454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152
  ],
  cheeks: [
    // Left cheek + right cheek as one region
    // Left cheek contour
    234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152,
    // Connect to right
    377, 400, 378, 379, 365, 397, 288, 361, 323, 454,
    // Back to start via upper cheek
    356, 389, 251, 284, 332, 297, 338, 10, 109, 67, 103, 54, 21, 162, 127, 234
  ],
  nasolabial: [
    // Left nasolabial fold line + right
    // This is a thin area, so we trace along the fold
    205, 50, 117, 118, 119, 120, 121, 128, 245, 193, 168,
    417, 465, 357, 350, 349, 348, 347, 346, 280, 425, 205
  ],
  upperFace: [
    // Forehead + brow area contour
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
  ],
  tearTroughs: [
    // Under-eye area - left and right tear troughs
    // Left tear trough
    226, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25,
    // Right tear trough
    255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467, 446, 226
  ],
  nose: [
    // Nose contour - bridge, tip, nostrils
    168, 6, 197, 195, 5, 4, 1, 19, 94, 2,
    98, 97, 99, 100, 129, 49, 48, 115, 131, 134, 51, 5,
    281, 363, 360, 279, 278, 294, 327, 326, 328, 2,
    326, 327, 294, 278, 279, 420, 429, 351, 417, 465, 168
  ],
};

/**
 * Generate a binary mask canvas for a given facial region
 * White = area to edit, Black = area to preserve
 */
export function generateRegionMask(
  landmarks: LandmarkPoint[],
  region: FacialRegion,
  width: number,
  height: number,
  featherRadius: number = 8
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Start with black (preserve everything)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  const indices = REGION_LANDMARKS[region];
  if (!indices || indices.length === 0) return canvas;

  // Get the points for this region in order
  const points = indices
    .filter((i) => i < landmarks.length)
    .map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }));

  if (points.length < 3) return canvas;

  // Draw filled polygon directly (no convex hull - preserve exact shape)
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  // Apply Gaussian-like feathering by blurring the mask
  if (featherRadius > 0) {
    ctx.filter = `blur(${featherRadius}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
  }

  return canvas;
}

/**
 * Generate a mask overlay for visual feedback (translucent colored region with dashed outline)
 */
export function generateRegionOverlay(
  landmarks: LandmarkPoint[],
  region: FacialRegion,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const indices = REGION_LANDMARKS[region];
  if (!indices || indices.length === 0) return canvas;

  const points = indices
    .filter((i) => i < landmarks.length)
    .map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }));

  if (points.length < 3) return canvas;

  // Draw filled polygon directly (no convex hull)
  ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]); // Dashed line like the reference

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return canvas;
}

/**
 * Convert mask canvas to base64 data URL
 */
export function maskToDataURL(maskCanvas: HTMLCanvasElement): string {
  return maskCanvas.toDataURL("image/png");
}
