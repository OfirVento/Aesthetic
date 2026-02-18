import type { MorphTarget, BotoxZone } from "./types";

/**
 * Morph targets for filler simulation
 * Each target defines which vertices move and how much
 */
export const FILLER_MORPH_TARGETS: MorphTarget[] = [
  // ============================================================================
  // LIPS - Volume injection simulation
  // ============================================================================
  {
    name: "lips_upper_volume",
    region: "lips_upperLip",
    category: "lips",
    affectedVertices: [
      // Upper lip vertices from MediaPipe
      61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
      308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78,
    ],
    deformationType: "normal",
    maxDisplacement: 0.04,
  },
  {
    name: "lips_lower_volume",
    region: "lips_lowerLip",
    category: "lips",
    affectedVertices: [
      // Lower lip vertices
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
      308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78,
    ],
    deformationType: "normal",
    maxDisplacement: 0.05,
  },
  {
    name: "lips_vermilion_definition",
    region: "lips_vermilionBorder",
    category: "lips",
    affectedVertices: [
      // Border vertices only
      61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
      375, 321, 405, 314, 17, 84, 181, 91, 146,
    ],
    deformationType: "normal",
    maxDisplacement: 0.02,
  },
  {
    name: "lips_cupids_bow",
    region: "lips_cupidsBow",
    category: "lips",
    affectedVertices: [
      // Cupid's bow peaks
      37, 0, 267, 312, 311, 310, 13, 82, 81, 80, 39,
    ],
    deformationType: "custom",
    customDirection: { x: 0, y: -0.7, z: 0.7 }, // Up and out
    maxDisplacement: 0.03,
  },
  {
    name: "lips_corners_lift",
    region: "lips_mouthCorners",
    category: "lips",
    affectedVertices: [
      // Mouth corners
      61, 146, 91, 95, 78, 191, 185,
      291, 375, 321, 324, 308, 415, 409,
    ],
    deformationType: "custom",
    customDirection: { x: 0, y: -0.8, z: 0.3 }, // Upward lift
    maxDisplacement: 0.04,
  },

  // ============================================================================
  // CHEEKS & MIDFACE - Volume restoration
  // ============================================================================
  {
    name: "cheeks_volume",
    region: "cheeksMidface_cheek",
    category: "cheeksMidface",
    affectedVertices: [
      // Left cheek
      116, 123, 147, 187, 207, 216, 212, 202, 201, 200, 199, 175,
      171, 140, 176, 149, 150, 136, 172, 215, 177, 137,
      // Right cheek
      345, 352, 376, 411, 427, 436, 432, 422, 421, 420, 419, 399,
      400, 369, 395, 378, 379, 365, 397, 435, 401, 366,
    ],
    deformationType: "normal",
    maxDisplacement: 0.06,
  },
  {
    name: "midface_volume",
    region: "cheeksMidface_midfaceVolume",
    category: "cheeksMidface",
    affectedVertices: [
      116, 111, 117, 118, 119, 100, 142, 126, 209, 49, 48, 102,
      331, 294, 278, 429, 355, 371, 266, 329, 348, 347, 346, 345,
    ],
    deformationType: "normal",
    maxDisplacement: 0.05,
  },
  {
    name: "nasolabial_fill",
    region: "cheeksMidface_nasolabialFold",
    category: "cheeksMidface",
    affectedVertices: [
      // Along the smile lines
      102, 48, 115, 220, 45, 4, 1, 61, 146, 91, 181, 84, 17,
      314, 405, 321, 375, 291, 409, 270, 269, 4, 275, 440, 344, 278, 331,
    ],
    deformationType: "normal",
    maxDisplacement: 0.04,
  },

  // ============================================================================
  // UNDER-EYE - Tear trough and hollow filling
  // ============================================================================
  {
    name: "tear_trough_fill",
    region: "underEye_tearTrough",
    category: "underEye",
    affectedVertices: [
      // Left tear trough
      111, 117, 118, 119, 120, 121, 128, 245, 193, 122,
      // Right tear trough
      340, 346, 347, 348, 349, 350, 357, 465, 417, 351,
    ],
    deformationType: "normal",
    maxDisplacement: 0.03,
  },

  // ============================================================================
  // LOWER FACE - Chin and jawline contouring
  // ============================================================================
  {
    name: "chin_projection",
    region: "lowerFace_chin",
    category: "lowerFace",
    affectedVertices: [
      17, 84, 181, 91, 146, 61, 43, 106, 182, 83, 18,
      313, 406, 335, 273, 291, 375, 321, 405, 314,
      175, 171, 152, 396, 400,
    ],
    deformationType: "custom",
    customDirection: { x: 0, y: 1, z: 0 }, // Downward projection (visible in 2D)
    maxDisplacement: 0.06,
  },
  {
    name: "jawline_definition",
    region: "lowerFace_jawline",
    category: "lowerFace",
    affectedVertices: [
      172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288,
      361, 435, 401, 366, 447, 264, 34, 227, 137, 177, 215,
    ],
    deformationType: "normal",
    maxDisplacement: 0.04,
  },
  {
    name: "marionette_fill",
    region: "lowerFace_marionetteLines",
    category: "lowerFace",
    affectedVertices: [
      61, 43, 106, 182, 83, 18, 17, 84, 181, 91, 146,
      291, 273, 335, 406, 313, 18, 17, 314, 405, 321, 375,
    ],
    deformationType: "normal",
    maxDisplacement: 0.03,
  },
  {
    name: "prejowl_fill",
    region: "lowerFace_preJowl",
    category: "lowerFace",
    affectedVertices: [
      58, 172, 215, 177, 137, 227, 34, 143, 111, 117,
      288, 397, 435, 401, 366, 447, 264, 372, 340, 346,
    ],
    deformationType: "normal",
    maxDisplacement: 0.04,
  },

  // ============================================================================
  // NOSE - Non-surgical rhinoplasty (filler)
  // ============================================================================
  {
    name: "nose_bridge_height",
    region: "nose_bridge",
    category: "nose",
    affectedVertices: [
      168, 6, 197, 195, 5, 4, 45, 220, 115, 48, 64, 98,
      327, 294, 331, 279, 278, 439, 344, 275,
    ],
    deformationType: "custom",
    customDirection: { x: 0, y: -1, z: 0 }, // Widen outward (visible in 2D)
    maxDisplacement: 0.03,
  },
  {
    name: "nose_tip_projection",
    region: "nose_tip",
    category: "nose",
    affectedVertices: [
      1, 2, 98, 240, 64, 48, 115, 4, 344, 275, 294, 460, 327,
    ],
    deformationType: "custom",
    customDirection: { x: 0, y: 1, z: 0 }, // Downward projection (visible in 2D)
    maxDisplacement: 0.02,
  },
];

/**
 * Botox zones for wrinkle relaxation
 * These affect the normal/depth rendering, not mesh deformation
 */
export const BOTOX_ZONES: BotoxZone[] = [
  {
    name: "forehead_lines",
    region: "upperFace_forehead",
    category: "upperFace",
    landmarkIndices: [
      10, 109, 67, 103, 54, 21, 71, 68, 104, 69, 108, 151,
      337, 299, 333, 298, 301, 251, 284, 332, 297, 338,
    ],
    uvBounds: { minU: 0.2, maxU: 0.8, minV: 0.0, maxV: 0.25 },
    maxBlurStrength: 0.8,
  },
  {
    name: "glabella_11s",
    region: "upperFace_glabella",
    category: "upperFace",
    landmarkIndices: [
      9, 107, 66, 105, 63, 70, 156, 168, 6, 197,
      383, 300, 293, 334, 296, 336,
    ],
    uvBounds: { minU: 0.35, maxU: 0.65, minV: 0.15, maxV: 0.35 },
    maxBlurStrength: 0.9,
  },
  {
    name: "crows_feet_left",
    region: "upperFace_crowsFeet",
    category: "upperFace",
    landmarkIndices: [
      130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25,
    ],
    uvBounds: { minU: 0.0, maxU: 0.2, minV: 0.25, maxV: 0.45 },
    maxBlurStrength: 0.7,
  },
  {
    name: "crows_feet_right",
    region: "upperFace_crowsFeet",
    category: "upperFace",
    landmarkIndices: [
      359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255,
    ],
    uvBounds: { minU: 0.8, maxU: 1.0, minV: 0.25, maxV: 0.45 },
    maxBlurStrength: 0.7,
  },
  {
    name: "bunny_lines",
    region: "nose_bridge",
    category: "nose",
    landmarkIndices: [
      168, 6, 197, 195, 5, 4,
    ],
    uvBounds: { minU: 0.4, maxU: 0.6, minV: 0.35, maxV: 0.45 },
    maxBlurStrength: 0.5,
  },
];

/**
 * Get morph target by name
 */
export function getMorphTarget(name: string): MorphTarget | undefined {
  return FILLER_MORPH_TARGETS.find((t) => t.name === name);
}

/**
 * Get all morph targets for a specific region
 */
export function getMorphTargetsForRegion(region: string): MorphTarget[] {
  return FILLER_MORPH_TARGETS.filter((t) => t.region === region);
}

/**
 * Get botox zone by name
 */
export function getBotoxZone(name: string): BotoxZone | undefined {
  return BOTOX_ZONES.find((z) => z.name === name);
}

/**
 * Get all botox zones for a specific region
 */
export function getBotoxZonesForRegion(region: string): BotoxZone[] {
  return BOTOX_ZONES.filter((z) => z.region === region);
}
