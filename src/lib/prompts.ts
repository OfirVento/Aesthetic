import type { FacialRegion, RegionControlValues } from "@/types";
import type { PromptConfig } from "@/lib/store/prompts";

function getIntensityKey(value: number): "slight" | "noticeable" | "significant" | "dramatic" {
  if (value <= 25) return "slight";
  if (value <= 50) return "noticeable";
  if (value <= 75) return "significant";
  return "dramatic";
}

export function buildInpaintPrompt(
  region: FacialRegion,
  controlValues: RegionControlValues,
  promptsConfig: PromptConfig,
  notes?: string
): string {
  const regionConfig = promptsConfig.regions[region];
  if (!regionConfig) return "";

  const descriptions: string[] = [];

  for (const [controlKey, controlPrompts] of Object.entries(regionConfig.controls)) {
    const value = controlValues[controlKey] ?? 0;
    if (value > 0) {
      const intensityKey = getIntensityKey(value);
      const promptText = controlPrompts[intensityKey];
      if (promptText) {
        descriptions.push(promptText);
      }
    }
  }

  if (descriptions.length === 0) return "";

  let taskPrompt = `TASK: Edit ${regionConfig.location} in this face photo.\n\n`;
  taskPrompt += `CHANGES TO APPLY:\n`;
  taskPrompt += descriptions.map((d, i) => `${i + 1}. ${d}`).join("\n");

  if (notes?.trim()) {
    taskPrompt += `\n\nDOCTOR'S NOTES: ${notes.trim()}`;
  }

  return taskPrompt;
}

export function buildFullPrompt(taskPrompt: string, systemPrompt: string): string {
  return systemPrompt.replace("{TASK_PROMPT}", taskPrompt);
}
