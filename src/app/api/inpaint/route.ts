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

    console.log("=== INPAINT REQUEST ===");
    console.log("Full prompt being sent to Gemini:");
    console.log(prompt);
    console.log("Image data length:", imageDataUrl.length);
    console.log("=======================");

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

    // Send the prompt directly - client has already built the full prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } },
        ],
      },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    console.log("Gemini response parts count:", parts?.length);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parts?.forEach((p: any, i: number) => {
      if (p.text) console.log(`Part ${i} (text):`, p.text);
      if (p.inlineData) console.log(`Part ${i} (image): ${p.inlineData.data?.length} chars of base64`);
    });

    if (!parts) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textPart = parts.find((p: any) => p.text);
      const textMsg = textPart?.text || "No image generated";
      console.log("Gemini returned text instead of image:", textMsg);
      return NextResponse.json(
        { error: `Gemini did not return an image: ${textMsg}` },
        { status: 502 }
      );
    }

    console.log("=== INPAINT SUCCESS: Image generated ===");
    return NextResponse.json({
      imageDataUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
      debugPrompt: prompt,
    });
  } catch (err) {
    console.error("Inpaint API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
