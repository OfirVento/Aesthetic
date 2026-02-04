import type { RegionCategory, SubRegion, CategoryConfig, SubRegionConfig, RegionConfig } from "@/types";

// ============================================================================
// NEW HIERARCHICAL CATEGORY CONFIGS (6 categories, 21 sub-regions)
// ============================================================================

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  // 1. LIPS (5 sub-regions)
  {
    id: "lips",
    label: "Lips",
    shortLabel: "Lips",
    isGated: false,
    subRegions: [
      {
        id: "lips_upperLip",
        label: "Upper Lip",
        shortLabel: "Upper",
        description: "Upper lip volume and shape",
        controls: [
          { key: "volume", label: "Volume", description: "Fullness and plumpness" },
          { key: "projection", label: "Projection", description: "Forward prominence" },
          { key: "eversion", label: "Eversion", description: "Lip roll/flip" },
        ],
      },
      {
        id: "lips_lowerLip",
        label: "Lower Lip",
        shortLabel: "Lower",
        description: "Lower lip volume and projection",
        controls: [
          { key: "volume", label: "Volume", description: "Fullness and plumpness" },
          { key: "projection", label: "Projection", description: "Forward prominence" },
          { key: "definition", label: "Definition", description: "Border sharpness" },
        ],
      },
      {
        id: "lips_vermilionBorder",
        label: "Vermilion Border",
        shortLabel: "Border",
        description: "Lip outline definition",
        controls: [
          { key: "definition", label: "Definition", description: "Border sharpness" },
          { key: "enhancement", label: "Enhancement", description: "White roll visibility" },
        ],
      },
      {
        id: "lips_cupidsBow",
        label: "Cupid's Bow",
        shortLabel: "Cupid's",
        description: "Upper lip peak definition",
        controls: [
          { key: "definition", label: "Definition", description: "Peak sharpness" },
          { key: "height", label: "Height", description: "Peak prominence" },
        ],
      },
      {
        id: "lips_mouthCorners",
        label: "Mouth Corners",
        shortLabel: "Corners",
        description: "Oral commissures/corners",
        controls: [
          { key: "lift", label: "Lift", description: "Corner elevation" },
          { key: "volumization", label: "Volumization", description: "Corner fullness" },
        ],
      },
    ],
  },

  // 2. NOSE (3 sub-regions) - GATED
  {
    id: "nose",
    label: "Nose",
    shortLabel: "Nose",
    isGated: true,
    gateWarning: "Nose treatments carry higher risks including vascular complications. This simulation is for educational preview only. Always consult with a qualified practitioner for actual treatments.",
    subRegions: [
      {
        id: "nose_bridge",
        label: "Bridge / Dorsum",
        shortLabel: "Bridge",
        description: "Nasal dorsum/bridge line",
        controls: [
          { key: "height", label: "Height", description: "Dorsal elevation" },
          { key: "smoothing", label: "Smoothing", description: "Hump reduction" },
          { key: "width", label: "Width", description: "Bridge width" },
        ],
      },
      {
        id: "nose_tip",
        label: "Tip",
        shortLabel: "Tip",
        description: "Nasal tip refinement",
        controls: [
          { key: "projection", label: "Projection", description: "Forward prominence" },
          { key: "rotation", label: "Rotation", description: "Upward/downward tilt" },
          { key: "definition", label: "Definition", description: "Tip sharpness" },
        ],
      },
      {
        id: "nose_base",
        label: "Base / Alar",
        shortLabel: "Base",
        description: "Nostril and alar base",
        controls: [
          { key: "width", label: "Width", description: "Alar width adjustment" },
          { key: "flare", label: "Flare", description: "Nostril flare reduction" },
        ],
      },
    ],
  },

  // 3. UPPER FACE (5 sub-regions)
  {
    id: "upperFace",
    label: "Upper Face",
    shortLabel: "Upper",
    isGated: false,
    subRegions: [
      {
        id: "upperFace_forehead",
        label: "Forehead",
        shortLabel: "Forehead",
        description: "Frontal region smoothing",
        controls: [
          { key: "smoothing", label: "Smoothing", description: "Line reduction" },
          { key: "relaxation", label: "Relaxation", description: "Muscle relaxation" },
          { key: "contouring", label: "Contouring", description: "Shape refinement" },
        ],
      },
      {
        id: "upperFace_glabella",
        label: "Glabella (11s)",
        shortLabel: "11s",
        description: "Frown lines between brows",
        controls: [
          { key: "relaxation", label: "Relaxation", description: "Line softening" },
          { key: "smoothing", label: "Smoothing", description: "Crease reduction" },
        ],
      },
      {
        id: "upperFace_brow",
        label: "Brow",
        shortLabel: "Brow",
        description: "Eyebrow position and shape",
        controls: [
          { key: "lift", label: "Lift", description: "Brow elevation" },
          { key: "arch", label: "Arch", description: "Arch enhancement" },
          { key: "tail", label: "Tail Lift", description: "Lateral brow lift" },
        ],
      },
      {
        id: "upperFace_crowsFeet",
        label: "Crow's Feet",
        shortLabel: "Crow's",
        description: "Lateral orbital lines",
        controls: [
          { key: "smoothing", label: "Smoothing", description: "Line reduction" },
          { key: "relaxation", label: "Relaxation", description: "Muscle relaxation" },
        ],
      },
      {
        id: "upperFace_temples",
        label: "Temples",
        shortLabel: "Temples",
        description: "Temporal hollowing",
        controls: [
          { key: "volume", label: "Volume", description: "Temple filling" },
          { key: "contouring", label: "Contouring", description: "Shape restoration" },
        ],
      },
    ],
  },

  // 4. UNDER-EYE (2 sub-regions)
  {
    id: "underEye",
    label: "Under-Eye",
    shortLabel: "Eye",
    isGated: false,
    subRegions: [
      {
        id: "underEye_tearTrough",
        label: "Tear Trough",
        shortLabel: "Trough",
        description: "Under-eye hollow",
        controls: [
          { key: "fill", label: "Fill", description: "Volume restoration" },
          { key: "smoothing", label: "Smoothing", description: "Transition blending" },
          { key: "darkness", label: "Darkness", description: "Dark circle reduction" },
        ],
      },
      {
        id: "underEye_lowerEyelid",
        label: "Lower Eyelid",
        shortLabel: "Eyelid",
        description: "Lower lid skin quality",
        controls: [
          { key: "tightening", label: "Tightening", description: "Skin firmness" },
          { key: "smoothing", label: "Smoothing", description: "Fine line reduction" },
        ],
      },
    ],
  },

  // 5. CHEEKS & MIDFACE (3 sub-regions)
  {
    id: "cheeksMidface",
    label: "Cheeks & Midface",
    shortLabel: "Cheeks",
    isGated: false,
    subRegions: [
      {
        id: "cheeksMidface_cheek",
        label: "Cheek (Malar)",
        shortLabel: "Malar",
        description: "Cheekbone prominence",
        controls: [
          { key: "volume", label: "Volume", description: "Cheek fullness" },
          { key: "lift", label: "Lift", description: "Vertical positioning" },
          { key: "projection", label: "Projection", description: "Forward prominence" },
        ],
      },
      {
        id: "cheeksMidface_midfaceVolume",
        label: "Midface Volume",
        shortLabel: "Midface",
        description: "Central face fullness",
        controls: [
          { key: "volume", label: "Volume", description: "Overall filling" },
          { key: "lift", label: "Lift", description: "Anti-gravity effect" },
        ],
      },
      {
        id: "cheeksMidface_nasolabialFold",
        label: "Nasolabial Fold",
        shortLabel: "NLF",
        description: "Nose-to-mouth lines",
        controls: [
          { key: "depthReduction", label: "Depth", description: "Fold depth reduction" },
          { key: "smoothing", label: "Smoothing", description: "Transition softening" },
        ],
      },
    ],
  },

  // 6. LOWER FACE (4 sub-regions)
  {
    id: "lowerFace",
    label: "Lower Face",
    shortLabel: "Lower",
    isGated: false,
    subRegions: [
      {
        id: "lowerFace_chin",
        label: "Chin",
        shortLabel: "Chin",
        description: "Chin projection and shape",
        controls: [
          { key: "projection", label: "Projection", description: "Forward prominence" },
          { key: "length", label: "Length", description: "Vertical dimension" },
          { key: "width", label: "Width", description: "Horizontal dimension" },
        ],
      },
      {
        id: "lowerFace_jawline",
        label: "Jawline",
        shortLabel: "Jaw",
        description: "Mandibular contour",
        controls: [
          { key: "definition", label: "Definition", description: "Line sharpness" },
          { key: "contour", label: "Contour", description: "Shape refinement" },
          { key: "angle", label: "Angle", description: "Jaw angle enhancement" },
        ],
      },
      {
        id: "lowerFace_marionetteLines",
        label: "Marionette Lines",
        shortLabel: "Marionette",
        description: "Corner-to-chin lines",
        controls: [
          { key: "depthReduction", label: "Depth", description: "Line depth reduction" },
          { key: "smoothing", label: "Smoothing", description: "Softening effect" },
        ],
      },
      {
        id: "lowerFace_preJowl",
        label: "Pre-Jowl",
        shortLabel: "Pre-Jowl",
        description: "Pre-jowl sulcus area",
        controls: [
          { key: "volume", label: "Volume", description: "Sulcus filling" },
          { key: "contouring", label: "Contouring", description: "Jawline continuity" },
        ],
      },
    ],
  },
];

// Helper functions for looking up configs
export function getCategoryConfig(categoryId: RegionCategory): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find(c => c.id === categoryId);
}

export function getSubRegionConfig(subRegionId: SubRegion): SubRegionConfig | undefined {
  for (const category of CATEGORY_CONFIGS) {
    const subRegion = category.subRegions.find(sr => sr.id === subRegionId);
    if (subRegion) return subRegion;
  }
  return undefined;
}

export function getCategoryForSubRegion(subRegionId: SubRegion): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find(c => c.subRegions.some(sr => sr.id === subRegionId));
}

// ============================================================================
// LEGACY REGION_CONFIGS (kept for backward compatibility during migration)
// Maps SubRegion IDs to RegionConfig format
// ============================================================================

export const REGION_CONFIGS: Record<SubRegion, RegionConfig> = {
  // Lips
  lips_upperLip: { label: "Upper Lip", controls: getSubRegionConfig("lips_upperLip")?.controls ?? [] },
  lips_lowerLip: { label: "Lower Lip", controls: getSubRegionConfig("lips_lowerLip")?.controls ?? [] },
  lips_vermilionBorder: { label: "Vermilion Border", controls: getSubRegionConfig("lips_vermilionBorder")?.controls ?? [] },
  lips_cupidsBow: { label: "Cupid's Bow", controls: getSubRegionConfig("lips_cupidsBow")?.controls ?? [] },
  lips_mouthCorners: { label: "Mouth Corners", controls: getSubRegionConfig("lips_mouthCorners")?.controls ?? [] },
  // Nose
  nose_bridge: { label: "Bridge / Dorsum", controls: getSubRegionConfig("nose_bridge")?.controls ?? [] },
  nose_tip: { label: "Tip", controls: getSubRegionConfig("nose_tip")?.controls ?? [] },
  nose_base: { label: "Base / Alar", controls: getSubRegionConfig("nose_base")?.controls ?? [] },
  // Upper Face
  upperFace_forehead: { label: "Forehead", controls: getSubRegionConfig("upperFace_forehead")?.controls ?? [] },
  upperFace_glabella: { label: "Glabella (11s)", controls: getSubRegionConfig("upperFace_glabella")?.controls ?? [] },
  upperFace_brow: { label: "Brow", controls: getSubRegionConfig("upperFace_brow")?.controls ?? [] },
  upperFace_crowsFeet: { label: "Crow's Feet", controls: getSubRegionConfig("upperFace_crowsFeet")?.controls ?? [] },
  upperFace_temples: { label: "Temples", controls: getSubRegionConfig("upperFace_temples")?.controls ?? [] },
  // Under-Eye
  underEye_tearTrough: { label: "Tear Trough", controls: getSubRegionConfig("underEye_tearTrough")?.controls ?? [] },
  underEye_lowerEyelid: { label: "Lower Eyelid", controls: getSubRegionConfig("underEye_lowerEyelid")?.controls ?? [] },
  // Cheeks & Midface
  cheeksMidface_cheek: { label: "Cheek (Malar)", controls: getSubRegionConfig("cheeksMidface_cheek")?.controls ?? [] },
  cheeksMidface_midfaceVolume: { label: "Midface Volume", controls: getSubRegionConfig("cheeksMidface_midfaceVolume")?.controls ?? [] },
  cheeksMidface_nasolabialFold: { label: "Nasolabial Fold", controls: getSubRegionConfig("cheeksMidface_nasolabialFold")?.controls ?? [] },
  // Lower Face
  lowerFace_chin: { label: "Chin", controls: getSubRegionConfig("lowerFace_chin")?.controls ?? [] },
  lowerFace_jawline: { label: "Jawline", controls: getSubRegionConfig("lowerFace_jawline")?.controls ?? [] },
  lowerFace_marionetteLines: { label: "Marionette Lines", controls: getSubRegionConfig("lowerFace_marionetteLines")?.controls ?? [] },
  lowerFace_preJowl: { label: "Pre-Jowl", controls: getSubRegionConfig("lowerFace_preJowl")?.controls ?? [] },
};
