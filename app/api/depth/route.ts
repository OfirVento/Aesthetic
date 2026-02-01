import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(req: Request) {
    try {
        const { image } = await req.json(); // expects base64 or url

        if (!process.env.REPLICATE_API_TOKEN) {
            return NextResponse.json({ error: "Missing REPLICATE_API_TOKEN" }, { status: 500 });
        }

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        // Run Depth Anything V2
        // Input must be a public URL or data URI
        const output = await replicate.run(
            "depth-anything/depth-anything-v2:40656461947522d057a6e1336183c50937a07cd060f644b93b063544ec1c5030", // Check model version
            {
                input: {
                    image: image
                }
            }
        );

        // Output is usually a URL to the depth map image
        return NextResponse.json({ success: true, depthMap: output });

    } catch (error) {
        console.error("Depth Gen Error:", error);
        return NextResponse.json({ success: false, error: "Depth failed" }, { status: 500 });
    }
}
