import type { SubRegion } from "@/types";
import type { LandmarkPoint } from "./mediapipe";

// MediaPipe landmark indices for each sub-region
// Points are in ORDER to form a closed polygon path (not scattered)
// Reference: MediaPipe Face Mesh has 468 landmarks
const SUBREGION_LANDMARKS: Record<SubRegion, number[]> = {
  // ============================================================================
  // LIPS (5 sub-regions)
  // ============================================================================

  lips_upperLip: [
    // Upper lip - from corner to corner, outer then inner edge
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
    // Inner edge (lip line)
    308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78, 61
  ],

  lips_lowerLip: [
    // Lower lip - outer contour then inner
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    // Inner edge
    308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 61
  ],

  lips_vermilionBorder: [
    // Thin strip around entire lip border (outer edge only)
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
    375, 321, 405, 314, 17, 84, 181, 91, 146, 61
  ],

  lips_cupidsBow: [
    // Small area at upper lip center peaks
    37, 0, 267, 269, 270,
    // Inner points
    312, 311, 310, 312, 13, 82, 81, 80,
    39, 37
  ],

  lips_mouthCorners: [
    // Left corner area
    61, 146, 91, 95, 78, 191, 185, 61,
    // Right corner included via bilateral coverage
    291, 375, 321, 324, 308, 415, 409, 291
  ],

  // ============================================================================
  // NOSE (3 sub-regions) - GATED
  // ============================================================================

  nose_bridge: [
    // Nasal dorsum/bridge - top of nose
    168, 6, 197, 195, 5,
    // Sides of bridge
    4, 45, 220, 115, 48, 64, 98,
    // Right side
    327, 294, 331, 279, 278, 439, 344, 275,
    4, 5, 195, 197, 6, 168
  ],

  nose_tip: [
    // Tip of nose - small area at the end
    1, 2, 98, 240, 64, 48, 115,
    4, 344, 275, 294, 460, 327, 2, 1
  ],

  nose_base: [
    // Nostrils and alar base
    2, 98, 240, 75, 60, 20, 242, 141, 94,
    // Right side
    370, 462, 250, 290, 305, 460, 327, 2
  ],

  // ============================================================================
  // UPPER FACE (5 sub-regions)
  // ============================================================================

  upperFace_forehead: [
    // Forehead - central area above eyebrows
    10, 109, 67, 103, 54, 21, 71, 68, 104, 69, 108, 151,
    // Top edge (hairline approximation)
    337, 299, 333, 298, 301, 251, 284, 332, 297, 338, 10
  ],

  upperFace_glabella: [
    // Glabella (11 lines) - between eyebrows
    9, 107, 66, 105, 63, 70, 156,
    // Center bridge
    168, 6, 197,
    // Right side
    383, 300, 293, 334, 296, 336, 9
  ],

  upperFace_brow: [
    // Left eyebrow region
    70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
    // Right eyebrow
    276, 283, 282, 295, 285, 336, 296, 334, 293, 300,
    // Connect back
    70
  ],

  upperFace_crowsFeet: [
    // Left crow's feet (lateral orbital)
    130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25, 130,
    // Right crow's feet
    359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255, 359
  ],

  upperFace_temples: [
    // Left temple
    127, 162, 21, 54, 103, 67, 109, 10, 338, 297,
    // Right temple area
    389, 251, 284, 332, 297, 338, 10, 109, 127
  ],

  // ============================================================================
  // UNDER-EYE (2 sub-regions)
  // ============================================================================

  underEye_tearTrough: [
    // Left under-eye hollow/tear trough
    111, 117, 118, 119, 120, 121, 128, 245, 193, 122, 111,
    // Right tear trough
    340, 346, 347, 348, 349, 350, 357, 465, 417, 351, 340
  ],

  underEye_lowerEyelid: [
    // Left lower eyelid
    33, 246, 161, 160, 159, 158, 157, 173, 155, 154, 153, 145, 144, 163, 7, 33,
    // Right lower eyelid
    263, 466, 388, 387, 386, 385, 384, 398, 382, 381, 380, 374, 373, 390, 249, 263
  ],

  // ============================================================================
  // CHEEKS & MIDFACE (3 sub-regions)
  // ============================================================================

  cheeksMidface_cheek: [
    // Left cheek malar area (below eye, beside nose)
    116, 123, 147, 187, 207, 216, 212, 202, 201, 200, 199, 175,
    // Loop around left cheek
    171, 140, 176, 149, 150, 136, 172, 215, 177, 137, 116,
    // Right cheek
    345, 352, 376, 411, 427, 436, 432, 422, 421, 420, 419, 399,
    400, 369, 395, 378, 379, 365, 397, 435, 401, 366, 345
  ],

  cheeksMidface_midfaceVolume: [
    // Central midface - from under eyes to mouth level
    116, 111, 117, 118, 119, 100, 142, 126, 209, 49, 48, 102,
    // Right side
    331, 294, 278, 429, 355, 371, 266, 329, 348, 347, 346, 345, 116
  ],

  cheeksMidface_nasolabialFold: [
    // Left nasolabial fold (nose to mouth line)
    102, 48, 115, 220, 45, 4, 1, 61, 146, 91, 181, 84, 17,
    // Right nasolabial fold
    314, 405, 321, 375, 291, 409, 270, 269, 4, 275, 440, 344, 278, 331, 102
  ],

  // ============================================================================
  // LOWER FACE (4 sub-regions)
  // ============================================================================

  lowerFace_chin: [
    // Chin/mentalis region below lower lip
    17, 84, 181, 91, 146, 61, 43, 106, 182, 83, 18, 313, 406, 335, 273, 291, 375, 321, 405, 314, 17,
    // Inner chin area
    175, 171, 152, 396, 400, 175
  ],

  lowerFace_jawline: [
    // Jawline - narrow band along mandibular edge (left to right)
    // Outer edge (lower jaw line)
    172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288,
    // Inner edge (creates narrow strip)
    361, 435, 401, 366, 447, 264, 34, 227, 137, 177, 215, 172
  ],

  lowerFace_marionetteLines: [
    // Left marionette (mouth corner to chin)
    61, 43, 106, 182, 83, 18, 17, 84, 181, 91, 146, 61,
    // Right marionette
    291, 273, 335, 406, 313, 18, 17, 314, 405, 321, 375, 291
  ],

  lowerFace_preJowl: [
    // Left pre-jowl sulcus (lateral to chin, along jaw)
    58, 172, 215, 177, 137, 227, 34, 143, 111, 117,
    // Right pre-jowl
    288, 397, 435, 401, 366, 447, 264, 372, 340, 346, 288
  ],
};

/**
 * Generate a binary mask canvas for a given facial sub-region
 * White = area to edit, Black = area to preserve
 */
export function generateRegionMask(
  landmarks: LandmarkPoint[],
  region: SubRegion,
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

  const indices = SUBREGION_LANDMARKS[region];
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
  region: SubRegion,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const indices = SUBREGION_LANDMARKS[region];
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
