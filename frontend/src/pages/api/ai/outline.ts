// Next.js Serverless API Route: Fast Structured Design Outline with Gemini 3 Flash Preview
import type { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBLXK6qJy7LHX27R7CO7Fi7l5L1c3d8YjQ";
const MODEL = process.env.DEFAULT_GEMINI_MODEL || "gemini-3-flash-preview";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, designType = "deck", brandClause = "", pageCount } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const dt = String(designType).toLowerCase();
    const countHint = pageCount ? `Aim for exactly ${pageCount} pages.` : dt === "poster" ? "Exactly 1 page." : "Aim for 4 to 6 pages.";

    const systemPrompt = `You are a world-class presentation and graphic design director.
Create a structured design outline JSON for: "${prompt}".
Design Type: ${dt}. ${countHint}
${brandClause ? `Brand rules: ${brandClause}` : ""}

Return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "title": "Short Punchy Title",
  "theme": "Mood/topic phrase (e.g. 'Dark Modern Neon SaaS' or 'Minimalist Editorial')",
  "pages": [
    {
      "title": "Page Headline",
      "points": ["Short point 1", "Short point 2", "Short point 3"],
      "visualRole": "cover" | "agenda" | "content" | "comparison" | "quote" | "data" | "closing"
    }
  ]
}
Make the copywriting exceptionally polished, concise, and modern. No markdown fences.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      }),
    });

    if (!response.ok) {
      // Fallback to gemini-2.5-flash
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      response = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
        }),
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const outline = JSON.parse(text);

    // Ensure pages array exists
    if (!outline.pages || !Array.isArray(outline.pages)) {
      outline.pages = [
        {
          title: outline.title || prompt,
          points: ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
          visualRole: "cover",
        },
      ];
    }

    return res.status(200).json(outline);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to generate outline" });
  }
}
