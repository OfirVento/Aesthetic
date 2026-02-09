/**
 * Client-side function that calls our /api/inpaint proxy route.
 * The API key is kept server-side only — never exposed to the browser.
 */
export async function generateEditedImage(
  imageDataUrl: string,
  prompt: string,
  maskDataUrl?: string
): Promise<string> {
  console.log("=== CLIENT: Sending to /api/inpaint ===");
  console.log("Prompt:", prompt);
  console.log("Image data length:", imageDataUrl.length);
  if (maskDataUrl) console.log("Mask data length:", maskDataUrl.length);

  const res = await fetch("/api/inpaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl, prompt, maskDataUrl }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.debugPrompt) {
    console.log("=== FULL PROMPT SENT TO GEMINI ===");
    console.log(data.debugPrompt);
    console.log("==================================");
  }

  return data.imageDataUrl;
}
