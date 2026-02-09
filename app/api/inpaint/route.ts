import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { image, prompt } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

        // Split base64
        const base64Data = image.split(',')[1];

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                role: "user",
                parts: [
                    { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                    { text: prompt + " \n\nIMPORTANT: You must return the result as a generated image. Do not provide a text description." },
                ],
            },
            config: {
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ],
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Debug: Log the full response structure to understand what's coming back
        console.log("Gemini Response Candidates:", JSON.stringify(response.candidates, null, 2));

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (part?.inlineData) {
            const newImage = `data:image/png;base64,${part.inlineData.data}`;
            return NextResponse.json({ success: true, image: newImage });
        } else {
            // Fallback: Check if there is a text refusal or explanation
            const candidate = response.candidates?.[0];
            const textPart = candidate?.content?.parts?.find(p => p.text);
            const textResponse = textPart ? textPart.text : "No content returned";
            const finishReason = candidate?.finishReason || "UNKNOWN";
            // Check for prompt level partial failure
            const promptFeedback = (response as any).promptFeedback;

            console.error("Gemini failed to generate image. Text response:", textResponse, "FinishReason:", finishReason, "PromptFeedback:", promptFeedback);

            return NextResponse.json({
                success: false,
                error: `No image generated. Reason: ${finishReason}. PromptFeedback: ${JSON.stringify(promptFeedback)}. Model said: ${textResponse}`
            });
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        const msg = (error instanceof Error) ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: "Gemini Error: " + msg }, { status: 500 });
    }
}
