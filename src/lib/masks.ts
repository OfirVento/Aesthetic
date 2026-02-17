import type { SubRegion } from "@/types";
import type { LandmarkPoint } from "./mediapipe";

// MediaPipe landmark indices for each sub-region
// Points are in ORDER to form a closed polygon path (not scattered)
// Reference: MediaPipe Face Mesh has 468 base landmarks (478 with iris refinement)
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

// ============================================================================
// Catmull-Rom to Cubic Bezier conversion for smooth curves
// ============================================================================

interface Point2D {
  x: number;
  y: number;
}

/**
 * Apply Chaikin's corner-cutting algorithm to smooth a polygon.
 * Each iteration replaces each edge with two new points at 25% and 75%,
 * producing organically smooth curves from jagged polygon outlines.
 */
function chaikinSmooth(points: Point2D[], iterations: number = 2): Point2D[] {
  let current = points;
  for (let iter = 0; iter < iterations; iter++) {
    const next: Point2D[] = [];
    for (let i = 0; i < current.length; i++) {
      const p0 = current[i];
      const p1 = current[(i + 1) % current.length];
      // Q = 3/4 * P_i + 1/4 * P_{i+1}
      next.push({
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      });
      // R = 1/4 * P_i + 3/4 * P_{i+1}
      next.push({
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      });
    }
    current = next;
  }
  return current;
}

/**
 * Draw a smooth closed Catmull-Rom spline through a set of points.
 * Converts each Catmull-Rom segment to a cubic Bezier for Canvas2D.
 * Tension controls curve tightness (0 = sharp, 1 = very loose). Default 0.5.
 */
function drawSmoothSpline(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  tension: number = 0.5
): void {
  const n = points.length;
  if (n < 3) {
    // Fallback to straight lines for very small point sets
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(points[i].x, points[i].y);
    return;
  }

  const alpha = tension;

  // For a closed curve, wrap around
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Catmull-Rom → Cubic Bezier control points
    const cp1x = p1.x + (p2.x - p0.x) * alpha / 3;
    const cp1y = p1.y + (p2.y - p0.y) * alpha / 3;
    const cp2x = p2.x - (p3.x - p1.x) * alpha / 3;
    const cp2y = p2.y - (p3.y - p1.y) * alpha / 3;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

// ============================================================================
// SDF-based feathering for pixel-perfect smooth masks
// ============================================================================

/**
 * Compute minimum signed distance from a point to a polygon boundary.
 * Positive = outside, negative = inside.
 * Uses proper point-to-segment distance for each polygon edge.
 */
function signedDistanceToPolygon(
  px: number,
  py: number,
  polygon: Point2D[]
): number {
  const n = polygon.length;
  let minDist = Infinity;
  let winding = 0;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    // Point-to-segment squared distance
    const dx = xj - xi;
    const dy = yj - yi;
    const lenSq = dx * dx + dy * dy;

    let t: number;
    if (lenSq < 1e-10) {
      t = 0;
    } else {
      t = ((px - xi) * dx + (py - yi) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }

    const closestX = xi + t * dx;
    const closestY = yi + t * dy;
    const distSq = (px - closestX) * (px - closestX) + (py - closestY) * (py - closestY);
    const dist = Math.sqrt(distSq);

    if (dist < minDist) minDist = dist;

    // Winding number for inside/outside test
    if (yi <= py) {
      if (yj > py) {
        const cross = (xj - xi) * (py - yi) - (px - xi) * (yj - yi);
        if (cross > 0) winding++;
      }
    } else {
      if (yj <= py) {
        const cross = (xj - xi) * (py - yi) - (px - xi) * (yj - yi);
        if (cross < 0) winding--;
      }
    }
  }

  return winding !== 0 ? -minDist : minDist;
}

/**
 * Quintic smootherstep: zero 1st and 2nd derivatives at boundaries.
 * Produces smoother falloff than standard smoothstep.
 */
function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Generate an SDF-based feathered mask using true Euclidean distance.
 * Much more accurate than CSS blur — feathering respects region shape
 * and doesn't leak outside intended boundaries.
 */
function renderSDFMask(
  ctx: CanvasRenderingContext2D,
  polygon: Point2D[],
  width: number,
  height: number,
  featherRadius: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // For performance, compute bounding box + padding to avoid full-image iteration
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = featherRadius + 2;
  const startX = Math.max(0, Math.floor(minX - pad));
  const startY = Math.max(0, Math.floor(minY - pad));
  const endX = Math.min(width, Math.ceil(maxX + pad));
  const endY = Math.min(height, Math.ceil(maxY + pad));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const sd = signedDistanceToPolygon(x + 0.5, y + 0.5, polygon);

      // SDF-based alpha:
      //   inside (sd < -featherRadius) → fully white (255)
      //   boundary (-featherRadius < sd < 0) → smooth falloff
      //   outside (sd > 0) → black (0)
      let alpha: number;
      if (sd <= -featherRadius) {
        alpha = 255;
      } else if (sd >= 0) {
        alpha = 0;
      } else {
        // smootherstep from edge (sd=0) to interior (sd=-featherRadius)
        alpha = smootherstep(0, -featherRadius, sd) * 255;
      }

      const idx = (y * width + x) * 4;
      data[idx] = alpha;     // R
      data[idx + 1] = alpha; // G
      data[idx + 2] = alpha; // B
      data[idx + 3] = 255;   // A (fully opaque — it's a mask)
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get the resolved pixel coordinates for a sub-region's landmark polygon.
 */
function getRegionPoints(
  landmarks: LandmarkPoint[],
  region: SubRegion,
  width: number,
  height: number
): Point2D[] | null {
  const indices = SUBREGION_LANDMARKS[region];
  if (!indices || indices.length === 0) return null;

  const points = indices
    .filter((i) => i < landmarks.length)
    .map((i) => ({
      x: landmarks[i].x * width,
      y: landmarks[i].y * height,
    }));

  return points.length >= 3 ? points : null;
}

/**
 * Generate a binary mask canvas for a given facial sub-region.
 * White = area to edit, Black = area to preserve.
 *
 * Uses SDF-based feathering for pixel-perfect Euclidean distance falloff
 * instead of CSS blur (which leaks uniformly and can bleed outside regions).
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

  const points = getRegionPoints(landmarks, region, width, height);
  if (!points) return canvas;

  if (featherRadius > 0) {
    // SDF-based feathering: true Euclidean distance for smooth, shape-aware falloff
    renderSDFMask(ctx, points, width, height, featherRadius);
  } else {
    // Hard mask with smooth Bezier boundaries
    const smoothed = chaikinSmooth(points, 2);
    ctx.fillStyle = "white";
    ctx.beginPath();
    drawSmoothSpline(ctx, smoothed, 0.4);
    ctx.closePath();
    ctx.fill();
  }

  return canvas;
}

/**
 * Generate a mask overlay for visual feedback (translucent colored region with smooth outline).
 *
 * Uses Catmull-Rom → Bezier spline interpolation for organically smooth
 * boundaries that follow facial contours without jagged polygon edges.
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

  const points = getRegionPoints(landmarks, region, width, height);
  if (!points) return canvas;

  // Smooth the polygon via Chaikin subdivision + Catmull-Rom splines
  const smoothed = chaikinSmooth(points, 2);

  // Fill with translucent blue
  ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
  ctx.beginPath();
  drawSmoothSpline(ctx, smoothed, 0.4);
  ctx.closePath();
  ctx.fill();

  // Dashed smooth outline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  drawSmoothSpline(ctx, smoothed, 0.4);
  ctx.closePath();
  ctx.stroke();

  return canvas;
}

/**
 * Generate composited mask from multiple overlapping regions.
 * Each region is rendered to a separate layer with SDF feathering,
 * then alpha-composited to avoid edge artifacts at region boundaries.
 */
export function generateCompositedMask(
  landmarks: LandmarkPoint[],
  regions: SubRegion[],
  width: number,
  height: number,
  featherRadius: number = 8
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Start with black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  // Composite each region as a separate layer using "lighter" blend
  ctx.globalCompositeOperation = "lighter";

  for (const region of regions) {
    const regionMask = generateRegionMask(
      landmarks,
      region,
      width,
      height,
      featherRadius
    );
    ctx.drawImage(regionMask, 0, 0);
  }

  // Reset composite operation
  ctx.globalCompositeOperation = "source-over";

  // Clamp to white (lighter can exceed 255)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.min(255, data[i]);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

/**
 * Generate composited overlay from multiple overlapping regions.
 * Each region rendered as a separate translucent layer, then composited.
 */
export function generateCompositedOverlay(
  landmarks: LandmarkPoint[],
  regions: SubRegion[],
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  for (const region of regions) {
    const regionOverlay = generateRegionOverlay(
      landmarks,
      region,
      width,
      height
    );
    ctx.drawImage(regionOverlay, 0, 0);
  }

  return canvas;
}

/**
 * Convert mask canvas to base64 data URL
 */
export function maskToDataURL(maskCanvas: HTMLCanvasElement): string {
  return maskCanvas.toDataURL("image/png");
}
