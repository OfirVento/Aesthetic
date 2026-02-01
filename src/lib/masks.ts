import type { FacialRegion } from "@/types";
import type { LandmarkPoint } from "./mediapipe";

// MediaPipe landmark indices for each facial region
// These are approximate groupings — verified against MediaPipe face mesh topology
const REGION_LANDMARKS: Record<FacialRegion, number[]> = {
  lips: [
    // Outer lips
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    // Inner lips
    78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
    // Additional lip area
    185, 40, 39, 37, 0, 267, 269, 270, 409,
  ],
  jawline: [
    // Left jawline
    132, 136, 150, 149, 176, 148, 152,
    // Right jawline
    361, 365, 379, 378, 400, 377, 152,
    // Chin area connects
    175, 199, 200, 201, 202, 204, 421, 418, 424,
  ],
  chin: [
    152, 148, 176, 149, 150, 136, 172, 58, 132,
    377, 400, 378, 379, 365, 397, 288, 361,
    175, 199, 200,
  ],
  cheeks: [
    // Left cheek
    116, 117, 118, 119, 120, 121, 122, 123, 187, 192, 213, 147, 205, 206,
    // Right cheek
    345, 346, 347, 348, 349, 350, 351, 352, 411, 416, 433, 376, 425, 426,
  ],
  nasolabial: [
    // Left nasolabial
    92, 93, 94, 95, 96, 97, 98, 165, 167, 164,
    // Right nasolabial
    322, 323, 324, 325, 326, 327, 328, 391, 393, 390,
  ],
  upperFace: [
    // Forehead + brow area
    66, 67, 68, 69, 70, 63, 105, 104, 103, 54, 21, 162, 127,
    296, 297, 298, 299, 300, 293, 334, 333, 332, 284, 251, 389, 356,
    10, 338, 297, 67, 109,
  ],
  tearTroughs: [
    // Left tear trough
    111, 112, 113, 114, 117, 118, 119, 120, 121,
    // Right tear trough
    340, 341, 342, 343, 346, 347, 348, 349, 350,
  ],
  nose: [
    // Nose bridge + tip + nostrils
    1, 2, 3, 4, 5, 6, 168, 197, 195, 196,
    419, 420, 456, 248, 281, 275, 274, 273,
    45, 51, 3, 196, 174, 188, 122, 6,
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
  featherRadius: number = 12
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

  // Get the points for this region
  const points = indices
    .filter((i) => i < landmarks.length)
    .map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }));

  if (points.length < 3) return canvas;

  // Compute convex hull for a clean mask shape
  const hull = convexHull(points);

  // Draw filled region in white
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(hull[0].x, hull[0].y);
  for (let i = 1; i < hull.length; i++) {
    ctx.lineTo(hull[i].x, hull[i].y);
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
 * Generate a mask overlay for visual feedback (translucent colored region)
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

  const hull = convexHull(points);

  // Semi-transparent blue overlay
  ctx.fillStyle = "rgba(59, 130, 246, 0.25)";
  ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(hull[0].x, hull[0].y);
  for (let i = 1; i < hull.length; i++) {
    ctx.lineTo(hull[i].x, hull[i].y);
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

// Simple convex hull (Graham scan)
function convexHull(
  points: { x: number; y: number }[]
): { x: number; y: number }[] {
  if (points.length <= 3) return points;

  // Find the bottommost point (and leftmost if tied)
  let pivot = points[0];
  for (const p of points) {
    if (p.y > pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
      pivot = p;
    }
  }

  // Sort by polar angle with respect to pivot
  const sorted = points
    .filter((p) => p !== pivot)
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
      const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
      return angleA - angleB;
    });

  const hull = [pivot];
  for (const p of sorted) {
    while (hull.length > 1) {
      const a = hull[hull.length - 2];
      const b = hull[hull.length - 1];
      const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
      if (cross <= 0) hull.pop();
      else break;
    }
    hull.push(p);
  }

  return hull;
}
