export type RegionCategory =
  | "lips"
  | "cheeksMidface"
  | "underEye"
  | "lowerFace"
  | "nose"
  | "upperFace";

export type SubRegion =
  | "lips_upperLip"
  | "lips_lowerLip"
  | "lips_vermilionBorder"
  | "lips_cupidsBow"
  | "lips_mouthCorners"
  | "cheeksMidface_cheek"
  | "cheeksMidface_midfaceVolume"
  | "cheeksMidface_nasolabialFold"
  | "underEye_tearTrough"
  | "lowerFace_chin"
  | "lowerFace_jawline"
  | "lowerFace_marionetteLines"
  | "lowerFace_preJowl"
  | "nose_bridge"
  | "nose_tip"
  | "upperFace_forehead"
  | "upperFace_glabella"
  | "upperFace_crowsFeet";

export interface MorphTarget {
  name: string;
  region: SubRegion;
  category: RegionCategory;
  // Vertex indices affected by this morph
  affectedVertices: number[];
  // Direction of deformation (along vertex normals by default)
  deformationType: "normal" | "custom";
  // Custom direction if deformationType is "custom"
  customDirection?: { x: number; y: number; z: number };
  // Maximum displacement in normalized units
  maxDisplacement: number;
}

export interface BotoxZone {
  name: string;
  region: SubRegion;
  category: RegionCategory;
  // UV coordinates for the affected area (0-1 range)
  uvBounds: {
    minU: number;
    maxU: number;
    minV: number;
    maxV: number;
  };
  // Landmark indices that define this zone
  landmarkIndices: number[];
  // Maximum blur strength
  maxBlurStrength: number;
}

export interface SimulationState {
  // Filler values per morph target (0-1)
  fillerValues: Record<string, number>;
  // Botox values per zone (0-1)
  botoxValues: Record<string, number>;
}

export interface MeshData {
  vertices: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
}
