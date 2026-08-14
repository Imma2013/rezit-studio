// Next.js Serverless API Route: AI Copywriting with Google Gemini 3 Flash Preview
import type { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBLXK6qJy7LHX27R7CO7Fi7l5L1c3d8YjQ";
const MODEL = process.env.DEFAULT_GEMINI_MODEL || "gemini-3-flash-preview";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, system, model: reqModel } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const modelToUse = reqModel || MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`;

    const contents: any[] = [];
    if (system) {
      contents.push({
        role: "user",
        parts: [{ text: `System instruction: ${system}\n\nUser request: ${prompt}` }],
      });
    } else {
      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      // If 3 flash preview fails or is unavailable, fallback to 2.5 flash
      if (modelToUse !== "gemini-2.5-flash") {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.7 } }),
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          return res.status(200).json({ text });
        }
      }
      const errBody = await response.text();
      return res.status(response.status).json({ error: `Gemini API Error: ${errBody}` });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
}
