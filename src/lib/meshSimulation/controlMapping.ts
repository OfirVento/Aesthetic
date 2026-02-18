import type { SubRegion, RegionControlValues } from "@/types";
import type { SimulationState } from "./types";
import { getMorphTargetsForRegion } from "./morphTargets";

/**
 * Maps each SubRegion to weighted control contributions for its morph target.
 * The morph target intensity = weighted sum of active controls (0-1 each).
 *
 * Sub-regions not listed here have no filler morph target (Botox-only or
 * no mesh representation) and are silently skipped.
 */
const CONTROL_WEIGHT_MAP: Partial<Record<SubRegion, Record<string, number>>> = {
  // Lips (5 targets)
  lips_upperLip: { volume: 0.5, projection: 0.3, eversion: 0.2 },
  lips_lowerLip: { volume: 0.5, projection: 0.3, definition: 0.2 },
  lips_vermilionBorder: { definition: 0.6, enhancement: 0.4 },
  lips_cupidsBow: { definition: 0.5, height: 0.5 },
  lips_mouthCorners: { lift: 0.6, volumization: 0.4 },

  // Cheeks & Midface (3 targets)
  cheeksMidface_cheek: { volume: 0.5, lift: 0.25, projection: 0.25 },
  cheeksMidface_midfaceVolume: { volume: 0.6, lift: 0.4 },
  cheeksMidface_nasolabialFold: { depthReduction: 0.6, smoothing: 0.4 },

  // Under-Eye (1 target)
  underEye_tearTrough: { fill: 0.5, smoothing: 0.3, darkness: 0.2 },

  // Lower Face (4 targets)
  lowerFace_chin: { projection: 0.5, length: 0.25, width: 0.25 },
  lowerFace_jawline: { definition: 0.5, contour: 0.3, angle: 0.2 },
  lowerFace_marionetteLines: { depthReduction: 0.6, smoothing: 0.4 },
  lowerFace_preJowl: { volume: 0.6, contouring: 0.4 },

  // Nose (2 targets — nose_base has no morph target)
  nose_bridge: { height: 0.5, smoothing: 0.3, width: 0.2 },
  nose_tip: { projection: 0.5, rotation: 0.3, definition: 0.2 },
};

/**
 * Convert ContextualPanel controlValues for a specific sub-region
 * into a SimulationState that the MeshSimulator understands.
 *
 * Merges with an existing state so cumulative deformation is preserved
 * when working across multiple regions.
 */
export function mapControlsToSimulation(
  subRegion: SubRegion,
  controlValues: RegionControlValues,
  existingState?: SimulationState
): SimulationState {
  const base: SimulationState = existingState ?? {
    fillerValues: {},
    botoxValues: {},
  };

  const weights = CONTROL_WEIGHT_MAP[subRegion];
  if (!weights) {
    // No mesh morph target for this region (Botox-only regions like forehead, glabella, etc.)
    return base;
  }

  const targets = getMorphTargetsForRegion(subRegion);
  if (targets.length === 0) return base;

  // Each sub-region maps to exactly one morph target
  const target = targets[0];

  // Compute weighted intensity from ACTIVE controls only (0-100 → 0-1).
  // Only non-zero controls participate in the average so that a single
  // slider at 85% produces ~85% intensity, not diluted by idle controls.
  let weightedSum = 0;
  let activeWeight = 0;
  for (const [controlKey, weight] of Object.entries(weights)) {
    const value = controlValues[controlKey] ?? 0;
    if (value > 0) {
      weightedSum += (value / 100) * weight;
      activeWeight += weight;
    }
  }

  const intensity = activeWeight > 0 ? weightedSum / activeWeight : 0;

  return {
    fillerValues: {
      ...base.fillerValues,
      [target.name]: Math.max(0, Math.min(1, intensity)),
    },
    botoxValues: base.botoxValues,
  };
}

/**
 * Build a complete SimulationState from ALL accumulated history entries.
 * Used to show cumulative deformation from multiple regions that have
 * already been "applied".
 */
export function buildCumulativeSimulation(
  history: Array<{ subRegion: SubRegion; controlValues: RegionControlValues }>
): SimulationState {
  let state: SimulationState = { fillerValues: {}, botoxValues: {} };
  for (const entry of history) {
    state = mapControlsToSimulation(
      entry.subRegion,
      entry.controlValues,
      state
    );
  }
  return state;
}
