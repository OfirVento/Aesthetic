export type AppStep = "scan" | "simulation" | "results";

export interface CapturedImages {
  front?: string;
  simulatedFront?: string;
}

// Legacy type - kept for backward compatibility
export type LegacyFacialRegion =
  | "lips"
  | "jawline"
  | "chin"
  | "cheeks"
  | "nasolabial"
  | "upperFace"
  | "tearTroughs"
  | "nose";

// New hierarchical structure - 6 categories
export type RegionCategory =
  | "lips"
  | "nose"
  | "upperFace"
  | "underEye"
  | "cheeksMidface"
  | "lowerFace";

// 21 sub-regions (excluding neck)
export type SubRegion =
  // Lips (5)
  | "lips_upperLip"
  | "lips_lowerLip"
  | "lips_vermilionBorder"
  | "lips_cupidsBow"
  | "lips_mouthCorners"
  // Nose (3) - GATED
  | "nose_bridge"
  | "nose_tip"
  | "nose_base"
  // Upper Face (5)
  | "upperFace_forehead"
  | "upperFace_glabella"
  | "upperFace_brow"
  | "upperFace_crowsFeet"
  | "upperFace_temples"
  // Under-Eye (2)
  | "underEye_tearTrough"
  | "underEye_lowerEyelid"
  // Cheeks & Midface (3)
  | "cheeksMidface_cheek"
  | "cheeksMidface_midfaceVolume"
  | "cheeksMidface_nasolabialFold"
  // Lower Face (4)
  | "lowerFace_chin"
  | "lowerFace_jawline"
  | "lowerFace_marionetteLines"
  | "lowerFace_preJowl";

// Alias for backward compatibility
export type FacialRegion = SubRegion;

export interface RegionControlConfig {
  key: string;
  label: string;
  description: string;
}

// Legacy config - kept for backward compatibility
export interface RegionConfig {
  label: string;
  controls: RegionControlConfig[];
}

// New hierarchical config types
export interface SubRegionConfig {
  id: SubRegion;
  label: string;
  shortLabel: string; // For compact UI display
  description: string;
  controls: RegionControlConfig[];
}

export interface CategoryConfig {
  id: RegionCategory;
  label: string;
  shortLabel: string;
  isGated: boolean;
  gateWarning?: string;
  subRegions: SubRegionConfig[];
}

export type RegionControlValues = Record<string, number>;

export interface VersionEntry {
  id: string;
  timestamp: number;
  // New hierarchical fields
  category: RegionCategory;
  categoryLabel: string;
  subRegion: SubRegion;
  subRegionLabel: string;
  // Legacy field for migration (optional)
  legacyRegion?: LegacyFacialRegion | "custom";
  // Keep for display compatibility
  region: SubRegion | "custom";
  regionLabel: string;
  controlValues: RegionControlValues;
  notes: string;
  prompt: string;
  inputImage: string;
  outputImage: string;
  meshPreviewImage?: string;
  maskData?: string;
}

export interface SessionState {
  step: AppStep;
  capturedImage: string | null;
  activeImage: string | null;
  // New hierarchical selection
  selectedCategory: RegionCategory | null;
  selectedSubRegion: SubRegion | null;
  expandedCategories: RegionCategory[];
  acknowledgedGatedCategories: RegionCategory[];
  // Legacy - for backward compatibility during migration
  selectedRegion: SubRegion | null;
  controlValues: RegionControlValues;
  notes: string;
  history: VersionEntry[];
  isProcessing: boolean;
  landmarks: number[][] | null;
}
