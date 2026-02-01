import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { imageDataUrl, prompt } = await req.json();

    if (!imageDataUrl || !prompt) {
      return NextResponse.json(
        { error: "Missing imageDataUrl or prompt" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const base64Data = imageDataUrl.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid image data URL" },
        { status: 400 }
      );
    }

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

    const response = await ai.models.generateContent({
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

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "No image in Gemini response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imageDataUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
    });
  } catch (err) {
    console.error("Inpaint API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
