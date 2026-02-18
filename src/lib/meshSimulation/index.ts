export { MeshRenderer } from "./MeshRenderer";
export { buildFaceMesh, buildFullImageMesh } from "./meshBuilder";
export {
  FILLER_MORPH_TARGETS,
  BOTOX_ZONES,
  getMorphTarget,
  getMorphTargetsForRegion,
  getBotoxZone,
  getBotoxZonesForRegion,
} from "./morphTargets";
export {
  mapControlsToSimulation,
  buildCumulativeSimulation,
} from "./controlMapping";
export type {
  MorphTarget,
  BotoxZone,
  SimulationState,
  MeshData,
} from "./types";
