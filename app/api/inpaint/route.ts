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
            model: 'gemini-2.0-flash', // Using latest Flash model for speed/quality balance
            contents: {
                role: "user",
                parts: [
                    { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                    { text: prompt },
                ],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (part?.inlineData) {
            const newImage = `data:image/png;base64,${part.inlineData.data}`;
            return NextResponse.json({ success: true, image: newImage });
        } else {
            // Fallback if no image returned (some text response?)
            return NextResponse.json({ success: false, error: "No image generated" });
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ success: false, error: "Generation failed" }, { status: 500 });
    }
}
