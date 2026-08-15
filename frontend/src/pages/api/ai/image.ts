// Next.js Serverless API Route: Google Imagen 3 & High-Res Flux AI Image Generation
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, size, apiKey: clientApiKey } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const authHeader = req.headers.authorization;
    const headerApiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const apiKey = clientApiKey || headerApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    const aspect = size === "1792x1024" ? "16:9" : size === "1024x1792" ? "9:16" : "1:1";
    let width = 1024;
    let height = 1024;
    if (aspect === "16:9") {
      width = 1792;
      height = 1024;
    } else if (aspect === "9:16") {
      width = 1024;
      height = 1792;
    }

    // 1. Try Google Imagen 3 if Gemini API key is available
    if (apiKey) {
      try {
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const imagenRes = await fetch(imagenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: String(prompt) }],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspect,
              personGeneration: "ALLOW_ADULT",
            },
          }),
        });

        if (imagenRes.ok) {
          const data = await imagenRes.json();
          const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
          if (b64) {
            const mime = data?.predictions?.[0]?.mimeType || "image/jpeg";
            return res.status(200).json({ image: `data:${mime};base64,${b64}` });
          }
        }
      } catch {
        // Fallback to Flux
      }
    }

    // 2. High-speed Flux fallback
    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(String(prompt).trim().slice(0, 400));
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    return res.status(200).json({ image: imageUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to generate image" });
  }
}
