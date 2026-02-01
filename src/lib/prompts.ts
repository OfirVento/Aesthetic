import type { FacialRegion, RegionControlValues } from "@/types";
import { REGION_CONFIGS } from "@/components/controls/controlsConfig";

/** Maps region to a specific anatomical location description for Gemini */
const REGION_LOCATION: Record<FacialRegion, string> = {
  lips: "the lips (upper lip, lower lip, cupid's bow, and vermillion border)",
  jawline: "the jawline (mandibular border from ear to chin on both sides)",
  chin: "the chin (mentalis region, lower face below the lower lip)",
  cheeks: "the cheeks (malar and zygomatic area, mid-face)",
  nasolabial: "the nasolabial folds (smile lines running from nose to mouth corners)",
  upperFace: "the upper face (forehead, glabella, and brow area)",
  tearTroughs: "the tear troughs (under-eye hollows between lower eyelid and cheek)",
  nose: "the nose (nasal bridge, tip, and nostrils)",
};

function intensityLabel(value: number): string {
  if (value === 0) return "";
  if (value <= 25) return "slightly";
  if (value <= 50) return "noticeably";
  if (value <= 75) return "significantly";
  return "dramatically";
}

function describeControl(label: string, description: string, value: number): string {
  if (value === 0) return "";
  const intensity = intensityLabel(value);
  return `- ${intensity} increase ${label.toLowerCase()} (${description}) — set to ${value}%`;
}

export function buildInpaintPrompt(
  region: FacialRegion,
  controlValues: RegionControlValues,
  notes?: string
): string {
  const config = REGION_CONFIGS[region];
  if (!config) return "";

  const descriptions = config.controls
    .map((c) => describeControl(c.label, c.description, controlValues[c.key] ?? 0))
    .filter(Boolean);

  if (descriptions.length === 0) return "";

  const location = REGION_LOCATION[region];

  let prompt = `EDIT REGION: ${location}\n\n`;
  prompt += `REQUIRED MODIFICATIONS (these changes MUST be clearly visible in the output):\n`;
  prompt += descriptions.join("\n");

  if (notes?.trim()) {
    prompt += `\n\nADDITIONAL NOTES: ${notes.trim()}`;
  }

  prompt += `\n\nIMPORTANT: The changes should be clearly visible and obvious when comparing the output to the input. Do NOT leave the image unchanged.`;

  return prompt;
}
