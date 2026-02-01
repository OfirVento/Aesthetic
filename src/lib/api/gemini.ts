/**
 * Client-side function that calls our /api/inpaint proxy route.
 * The API key is kept server-side only — never exposed to the browser.
 */
export async function generateEditedImage(
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  const res = await fetch("/api/inpaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl, prompt }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.imageDataUrl;
}
