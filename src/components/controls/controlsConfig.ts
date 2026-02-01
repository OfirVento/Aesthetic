import type { FacialRegion, RegionConfig } from "@/types";

export const REGION_CONFIGS: Record<FacialRegion, RegionConfig> = {
  lips: {
    label: "Lips",
    controls: [
      { key: "volume", label: "Volume", description: "Fullness and plumpness" },
      { key: "projection", label: "Projection", description: "Forward/back prominence" },
      { key: "definition", label: "Definition", description: "Vermillion border sharpness" },
      { key: "width", label: "Width", description: "Horizontal spread" },
    ],
  },
  jawline: {
    label: "Jawline",
    controls: [
      { key: "definition", label: "Definition", description: "Sharpness of mandibular line" },
      { key: "contour", label: "Contour", description: "Overall shape refinement" },
      { key: "angle", label: "Angle", description: "Angular vs soft appearance" },
    ],
  },
  chin: {
    label: "Chin",
    controls: [
      { key: "projection", label: "Projection", description: "Forward/back position" },
      { key: "length", label: "Length", description: "Vertical dimension" },
      { key: "width", label: "Width", description: "Horizontal dimension" },
    ],
  },
  cheeks: {
    label: "Cheeks",
    controls: [
      { key: "volume", label: "Volume", description: "Fullness and roundness" },
      { key: "lift", label: "Lift", description: "Vertical position emphasis" },
      { key: "projection", label: "Projection", description: "Forward prominence" },
    ],
  },
  nasolabial: {
    label: "Nasolabial Folds",
    controls: [
      { key: "depthReduction", label: "Depth Reduction", description: "Reduce fold depth" },
      { key: "smoothing", label: "Smoothing", description: "Soften appearance" },
    ],
  },
  upperFace: {
    label: "Upper Face / Forehead",
    controls: [
      { key: "relaxation", label: "Relaxation", description: "Botox-like muscle relaxation" },
      { key: "lift", label: "Lift", description: "Brow position elevation" },
      { key: "smoothing", label: "Smoothing", description: "Texture refinement" },
    ],
  },
  tearTroughs: {
    label: "Tear Troughs",
    controls: [
      { key: "fill", label: "Fill", description: "Reduce hollow appearance" },
      { key: "smoothing", label: "Smoothing", description: "Soften transition" },
    ],
  },
  nose: {
    label: "Nose",
    controls: [
      { key: "bridgeHeight", label: "Bridge Height", description: "Dorsal line adjustment" },
      { key: "tipProjection", label: "Tip Projection", description: "Tip forward/back" },
      { key: "width", label: "Width", description: "Nostril width adjustment" },
    ],
  },
};
