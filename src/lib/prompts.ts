import type { FacialRegion, RegionControlValues } from "@/types";
import { REGION_CONFIGS } from "@/components/controls/controlsConfig";

function intensityLabel(value: number): string {
  if (value === 0) return "no change to";
  if (value <= 30) return "subtle";
  if (value <= 60) return "moderate";
  if (value <= 85) return "enhanced";
  return "maximum";
}

function describeControl(label: string, value: number): string {
  if (value === 0) return "";
  const intensity = intensityLabel(value);
  return `${intensity} ${label.toLowerCase()} (${value}%)`;
}

export function buildInpaintPrompt(
  region: FacialRegion,
  controlValues: RegionControlValues,
  notes?: string
): string {
  const config = REGION_CONFIGS[region];
  if (!config) return "";

  const descriptions = config.controls
    .map((c) => describeControl(c.label, controlValues[c.key] ?? 0))
    .filter(Boolean);

  if (descriptions.length === 0) return "";

  let prompt = `${config.label}: ${descriptions.join(", ")}.`;

  if (notes?.trim()) {
    prompt += ` ${notes.trim()}`;
  }

  prompt += `\nMaintain exact identity, lighting, and all areas outside the mask.`;
  prompt += `\nMedical aesthetic visualization, photorealistic, subtle natural result.`;

  return prompt;
}
