export type AppStep = "scan" | "simulation" | "results";

export interface CapturedImages {
  front?: string;
  simulatedFront?: string;
}

export type FacialRegion =
  | "lips"
  | "jawline"
  | "chin"
  | "cheeks"
  | "nasolabial"
  | "upperFace"
  | "tearTroughs"
  | "nose";

export interface RegionControlConfig {
  key: string;
  label: string;
  description: string;
}

export interface RegionConfig {
  label: string;
  controls: RegionControlConfig[];
}

export type RegionControlValues = Record<string, number>;

export interface VersionEntry {
  id: string;
  timestamp: number;
  region: FacialRegion | "custom";
  regionLabel: string;
  controlValues: RegionControlValues;
  notes: string;
  prompt: string;
  inputImage: string;
  outputImage: string;
  maskData?: string;
}

export interface SessionState {
  step: AppStep;
  capturedImage: string | null;
  activeImage: string | null;
  selectedRegion: FacialRegion | null;
  controlValues: RegionControlValues;
  notes: string;
  history: VersionEntry[];
  isProcessing: boolean;
  landmarks: number[][] | null;
}
