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
    // Jawline - narrow band along the jaw edge only
    // Start at left jaw angle, go along jaw to chin, then to right jaw angle
    // Outer edge (lower)
    172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288,
    // Inner edge (upper) - creates a narrow strip
    361, 435, 401, 366, 447, 264, 34, 227, 137, 177, 215, 172
  ],
  chin: [
    // Chin - just the mentalis region below the lower lip
    // Small focused area at bottom of face
    175, 171, 152, 396, 400, 377, 152, 148, 176, 140, 171, 175,
    199, 200, 201, 202, 211, 212, 216, 207, 187, 147, 213, 192,
    214, 135, 169, 170, 171, 175
  ],
  cheeks: [
    // Cheeks - malar/zygomatic region (mid-face, below eyes, beside nose)
    // Left cheek area
    123, 187, 147, 213, 192, 214, 135, 170, 171, 140, 176, 149,
    150, 136, 172, 215, 177, 137, 227, 34, 143, 116, 123
  ],
  nasolabial: [
    // Nasolabial folds - lines from nose to mouth corners
    // Left side
    102, 48, 115, 220, 45, 4, 275, 440, 344, 278,
    // Loop through right side
    331, 294, 439, 278, 294, 455, 305, 289, 102
  ],
  upperFace: [
    // Forehead - area above eyebrows only
    // Along brow line
    70, 63, 105, 66, 107, 55, 8, 285, 336, 296, 334, 293, 300,
    // Top of forehead (approximated since MediaPipe stops at hairline)
    151, 108, 69, 104, 68, 71, 21, 54, 103, 67, 109, 10,
    338, 297, 332, 284, 251, 301, 298, 333, 299, 337, 151,
    300, 293, 334, 296, 336, 285, 8, 55, 107, 66, 105, 63, 70
  ],
  tearTroughs: [
    // Under-eye hollows - small area below eyes
    // Left tear trough
    111, 117, 118, 119, 120, 121, 128, 245, 193, 122, 111
  ],
  nose: [
    // Nose - bridge, tip, nostrils
    168, 6, 197, 195, 5, 4, 1, 19, 94, 2,
    98, 326, 327, 278, 279, 420, 399, 351, 168
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
