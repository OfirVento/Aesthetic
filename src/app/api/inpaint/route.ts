import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { imageDataUrl, prompt, maskDataUrl } = await req.json();

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
    if (maskDataUrl) console.log("Mask data length:", maskDataUrl.length);
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

    // Build parts array: prompt + image + optional mask
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType } },
    ];

    // Include mask if provided for region-targeted editing
    if (maskDataUrl) {
      const maskBase64 = maskDataUrl.split(",")[1];
      if (maskBase64) {
        const maskMimeMatch = maskDataUrl.match(/^data:(image\/\w+);base64,/);
        const maskMime = maskMimeMatch ? maskMimeMatch[1] : "image/png";
        parts.push({ text: "The following mask image shows the exact region to edit (white = edit area, black = preserve):" });
        parts.push({ inlineData: { data: maskBase64, mimeType: maskMime } });
      }
    }

    // Send the prompt directly - client has already built the full prompt
    // Retry logic with exponential backoff for 503 errors
    let response;
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delayMs}ms delay...`);
          await sleep(delayMs);
        }

        response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts,
          },
          config: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });
        break; // Success, exit retry loop
      } catch (retryErr) {
        lastError = retryErr;
        const errMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.log(`Attempt ${attempt + 1} failed:`, errMsg);

        // Only retry on 503/overload errors
        if (!errMsg.includes("503") && !errMsg.toLowerCase().includes("overload")) {
          throw retryErr; // Non-retryable error
        }

        if (attempt === MAX_RETRIES - 1) {
          return NextResponse.json(
            { error: "The AI model is currently overloaded. Please try again in a few moments." },
            { status: 503 }
          );
        }
      }
    }

    if (!response) {
      const message = lastError instanceof Error ? lastError.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const responseParts = response.candidates?.[0]?.content?.parts;
    console.log("Gemini response parts count:", responseParts?.length);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseParts?.forEach((p: any, i: number) => {
      if (p.text) console.log(`Part ${i} (text):`, p.text);
      if (p.inlineData) console.log(`Part ${i} (image): ${p.inlineData.data?.length} chars of base64`);
    });

    if (!responseParts) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = responseParts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textPart = responseParts.find((p: any) => p.text);
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
