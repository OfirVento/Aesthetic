import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyC6i6dGQoOCUBL2uLU4kaj0YqeSWfg94hk";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (ai) return ai;
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

/**
 * Generate an edited face image using Gemini's image generation.
 * Sends the original image + a clinical prompt describing the desired changes.
 */
export async function generateEditedImage(
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  const client = getAI();

  // Extract base64 data from data URL
  const base64Data = imageDataUrl.split(",")[1];
  if (!base64Data) {
    throw new Error("Invalid image data URL");
  }

  // Determine mime type from data URL
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const fullPrompt = `SYSTEM INSTRUCTION: You are an expert medical aesthetic visualization engine.
OBJECTIVE: Apply the following precise clinical modifications to the provided face photograph.

${prompt}

CRITICAL CONSTRAINTS:
- Maintain 100% identity preservation of eyes, hair, clothing, and background.
- Only modify the specific region described above.
- Ensure lighting and shadows remain anatomically consistent with the modifications.
- The result must be photorealistic, not stylized or filtered.
- Output a single photograph with the modifications applied naturally.`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: fullPrompt },
      ],
    },
    config: {
      responseModalities: ["image", "text"],
    },
  });

  // Extract the generated image from the response
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No response from Gemini");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagePart = parts.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData?.data) {
    throw new Error("No image in Gemini response");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
}
