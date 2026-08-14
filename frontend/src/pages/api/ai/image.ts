// Next.js Serverless API Route: AI Image Generation
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, size } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    let width = 1024;
    let height = 1024;
    if (size === "1792x1024") {
      width = 1792;
      height = 1024;
    } else if (size === "1024x1792") {
      width = 1024;
      height = 1792;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(String(prompt).trim().slice(0, 400));
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    return res.status(200).json({ image: imageUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to generate image" });
  }
}
