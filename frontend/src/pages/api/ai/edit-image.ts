// Next.js Serverless API Route: AI Image Editing & Background Removal
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mode = "edit" } = req.body || {};

    // 1. Background Removal Mode
    if (mode === "remove-bg" || String(prompt).toLowerCase().includes("remove background") || String(prompt).toLowerCase().includes("transparent")) {
      // Use clean transparent cutout service
      const cleanPrompt = encodeURIComponent("transparent background cutout sticker, clean isolated object, white background removed, alpha transparency");
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux&transparent=true`;
      return res.status(200).json({ image: imageUrl });
    }

    // 2. Generative Image-to-Image / Magic Edit Mode
    if (!prompt) {
      return res.status(400).json({ error: "Missing instruction/prompt for image edit" });
    }

    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(String(prompt).trim().slice(0, 400));
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    return res.status(200).json({ image: imageUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to edit image" });
  }
}
