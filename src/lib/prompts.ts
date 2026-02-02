import type { FacialRegion, RegionControlValues } from "@/types";

/**
 * Concrete physical edit descriptions for each region + control + intensity.
 * Each entry maps: region → control key → function(value) → physical description
 */
const EDIT_DESCRIPTIONS: Record<string, Record<string, (v: number) => string>> = {
  lips: {
    volume: (v) => {
      if (v <= 25) return "Make the lips slightly fuller, as if a small amount of lip filler was injected.";
      if (v <= 50) return "Make the lips noticeably fuller and plumper, with visibly more volume in both upper and lower lips.";
      if (v <= 75) return "Make the lips significantly fuller with prominent volume increase. The lips should look like they received a substantial dermal filler treatment.";
      return "Make the lips dramatically fuller and very plump. Both lips should be visibly large and voluminous, like a heavy lip filler result.";
    },
    projection: (v) => {
      if (v <= 25) return "Slightly increase the forward projection of the lips.";
      if (v <= 50) return "Make the lips project forward more noticeably from the face.";
      if (v <= 75) return "Significantly increase lip projection so they protrude forward prominently.";
      return "Dramatically increase lip projection for a very pronounced, pouty appearance.";
    },
    definition: (v) => {
      if (v <= 25) return "Slightly sharpen the lip border (vermillion border) for better definition.";
      if (v <= 50) return "Make the lip border clearly more defined and sharp, with a distinct cupid's bow.";
      if (v <= 75) return "Significantly enhance lip border definition with a very crisp, well-defined vermillion border.";
      return "Create dramatically sharp and perfectly defined lip borders with an exaggerated cupid's bow.";
    },
    width: (v) => {
      if (v <= 25) return "Slightly widen the lips horizontally.";
      if (v <= 50) return "Noticeably widen the lips for a broader smile shape.";
      if (v <= 75) return "Significantly widen the lips horizontally.";
      return "Dramatically widen the lips for a much broader mouth appearance.";
    },
  },
  jawline: {
    definition: (v) => {
      if (v <= 25) return "Slightly sharpen the jawline for a more defined mandibular border.";
      if (v <= 50) return "Make the jawline noticeably sharper and more chiseled.";
      if (v <= 75) return "Create a significantly more defined, angular jawline with clear bone structure visible.";
      return "Dramatically sculpt the jawline to be extremely sharp and angular, like a model's jawline.";
    },
    contour: (v) => {
      if (v <= 25) return "Slightly refine the overall jawline contour for a cleaner shape.";
      if (v <= 50) return "Noticeably improve jawline contour with a smoother, more refined shape.";
      if (v <= 75) return "Significantly reshape the jawline contour for a sculpted, V-shaped lower face.";
      return "Dramatically reshape the jawline into a perfectly contoured, sculpted V-shape.";
    },
    angle: (v) => {
      if (v <= 25) return "Slightly increase the angular appearance of the jaw angle.";
      if (v <= 50) return "Make the jaw angle noticeably more angular and defined.";
      if (v <= 75) return "Create a significantly more angular jaw with sharp mandibular angles.";
      return "Dramatically enhance the jaw angles for an extremely angular, square-jawed appearance.";
    },
  },
  chin: {
    projection: (v) => {
      if (v <= 25) return "Slightly increase chin projection, moving it slightly forward.";
      if (v <= 50) return "Noticeably increase chin projection for better facial balance.";
      if (v <= 75) return "Significantly project the chin forward, like a chin implant or substantial filler.";
      return "Dramatically increase chin projection for a very prominent, strong chin.";
    },
    length: (v) => {
      if (v <= 25) return "Slightly elongate the chin vertically.";
      if (v <= 50) return "Noticeably lengthen the chin for a more elongated lower face.";
      if (v <= 75) return "Significantly lengthen the chin vertically.";
      return "Dramatically elongate the chin for a much longer lower face proportion.";
    },
    width: (v) => {
      if (v <= 25) return "Slightly widen the chin.";
      if (v <= 50) return "Noticeably widen the chin for a broader lower face.";
      if (v <= 75) return "Significantly widen the chin.";
      return "Dramatically widen the chin for a much broader appearance.";
    },
  },
  cheeks: {
    volume: (v) => {
      if (v <= 25) return "Add a subtle amount of volume to the cheeks, like a light cheek filler.";
      if (v <= 50) return "Add noticeable volume to the cheeks, making them fuller and rounder, like mid-face filler.";
      if (v <= 75) return "Add significant volume to the cheeks for prominently full, round cheekbones.";
      return "Add dramatic volume to the cheeks for very full, prominent, apple-shaped cheeks.";
    },
    lift: (v) => {
      if (v <= 25) return "Slightly lift the cheekbones upward for a subtle lifted appearance.";
      if (v <= 50) return "Noticeably lift the cheekbones higher on the face.";
      if (v <= 75) return "Significantly lift and elevate the cheekbones for a high-cheekbone look.";
      return "Dramatically lift the cheekbones to their highest position for a supermodel cheekbone effect.";
    },
    projection: (v) => {
      if (v <= 25) return "Slightly increase the forward projection of the cheekbones.";
      if (v <= 50) return "Noticeably increase cheekbone projection for more prominent cheeks.";
      if (v <= 75) return "Significantly project the cheekbones forward for very prominent mid-face structure.";
      return "Dramatically increase cheekbone projection for extremely prominent, sculpted cheekbones.";
    },
  },
  nasolabial: {
    depthReduction: (v) => {
      if (v <= 25) return "Slightly reduce the depth of the nasolabial folds (smile lines from nose to mouth).";
      if (v <= 50) return "Noticeably reduce the nasolabial folds, making the smile lines visibly shallower.";
      if (v <= 75) return "Significantly reduce the nasolabial folds, making them much less visible.";
      return "Almost completely eliminate the nasolabial folds for a smooth transition from nose to mouth.";
    },
    smoothing: (v) => {
      if (v <= 25) return "Slightly smooth the skin around the nasolabial area.";
      if (v <= 50) return "Noticeably smooth and soften the nasolabial fold area.";
      if (v <= 75) return "Significantly smooth the entire nasolabial area for a much younger appearance.";
      return "Dramatically smooth the nasolabial area, removing nearly all creases and folds.";
    },
  },
  upperFace: {
    relaxation: (v) => {
      if (v <= 25) return "Slightly relax the forehead lines, like a mild Botox effect.";
      if (v <= 50) return "Noticeably smooth forehead wrinkles and frown lines, like a Botox treatment.";
      if (v <= 75) return "Significantly relax all forehead muscles, removing most wrinkles and furrows.";
      return "Completely smooth the forehead, removing all wrinkles, lines, and furrows for a perfectly smooth forehead.";
    },
    lift: (v) => {
      if (v <= 25) return "Slightly lift the eyebrows upward.";
      if (v <= 50) return "Noticeably lift the brow position for a more open, refreshed eye area.";
      if (v <= 75) return "Significantly lift the eyebrows for a prominent brow lift effect.";
      return "Dramatically lift the eyebrows to their highest natural position, creating a very open, arched look.";
    },
    smoothing: (v) => {
      if (v <= 25) return "Slightly smooth the forehead skin texture.";
      if (v <= 50) return "Noticeably improve forehead skin smoothness and texture.";
      if (v <= 75) return "Significantly smooth the entire forehead for a refined, youthful texture.";
      return "Create a perfectly smooth, poreless forehead with flawless skin texture.";
    },
  },
  tearTroughs: {
    fill: (v) => {
      if (v <= 25) return "Slightly fill the under-eye hollows to reduce the tired, sunken appearance.";
      if (v <= 50) return "Noticeably fill the tear troughs, reducing dark circles and hollow appearance under the eyes.";
      if (v <= 75) return "Significantly fill the tear troughs for a well-rested, refreshed under-eye area with minimal hollowing.";
      return "Completely fill the tear troughs, eliminating all hollowing and dark circles under the eyes.";
    },
    smoothing: (v) => {
      if (v <= 25) return "Slightly smooth the under-eye skin.";
      if (v <= 50) return "Noticeably smooth the transition between lower eyelid and cheek.";
      if (v <= 75) return "Significantly smooth the entire under-eye area for a rejuvenated look.";
      return "Perfectly smooth the under-eye area, creating a seamless transition from eye to cheek.";
    },
  },
  nose: {
    bridgeHeight: (v) => {
      if (v <= 25) return "Slightly raise the nasal bridge height.";
      if (v <= 50) return "Noticeably increase the nasal bridge height for a more prominent nose bridge.";
      if (v <= 75) return "Significantly raise the nasal bridge for a higher, more defined nose profile.";
      return "Dramatically increase nasal bridge height for a very prominent, high nose bridge.";
    },
    tipProjection: (v) => {
      if (v <= 25) return "Slightly refine and project the nose tip forward.";
      if (v <= 50) return "Noticeably project the nasal tip forward for better tip definition.";
      if (v <= 75) return "Significantly increase nose tip projection for a more prominent, defined tip.";
      return "Dramatically project the nose tip forward with maximum tip refinement.";
    },
    width: (v) => {
      if (v <= 25) return "Slightly narrow the nostrils and overall nose width.";
      if (v <= 50) return "Noticeably narrow the nose, reducing nostril width for a slimmer nose.";
      if (v <= 75) return "Significantly narrow the nose for a much slimmer nasal appearance.";
      return "Dramatically narrow the nose for the slimmest possible natural appearance.";
    },
  },
};

/** Region location descriptions for context */
const REGION_LOCATION: Record<FacialRegion, string> = {
  lips: "the lips",
  jawline: "the jawline",
  chin: "the chin",
  cheeks: "the cheeks",
  nasolabial: "the nasolabial folds (smile lines)",
  upperFace: "the forehead and brow area",
  tearTroughs: "the under-eye area (tear troughs)",
  nose: "the nose",
};

export function buildInpaintPrompt(
  region: FacialRegion,
  controlValues: RegionControlValues,
  notes?: string
): string {
  const regionDescriptions = EDIT_DESCRIPTIONS[region];
  if (!regionDescriptions) return "";

  const descriptions: string[] = [];
  for (const [key, descFn] of Object.entries(regionDescriptions)) {
    const value = controlValues[key] ?? 0;
    if (value > 0) {
      descriptions.push(descFn(value));
    }
  }

  if (descriptions.length === 0) return "";

  const location = REGION_LOCATION[region];

  let prompt = `TASK: Edit ${location} in this face photo.\n\n`;
  prompt += `CHANGES TO APPLY:\n`;
  prompt += descriptions.map((d, i) => `${i + 1}. ${d}`).join("\n");

  if (notes?.trim()) {
    prompt += `\n\nDOCTOR'S NOTES: ${notes.trim()}`;
  }

  return prompt;
}
