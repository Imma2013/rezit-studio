// Next.js Serverless API Route: AI Copywriting with Google Gemini 3 Flash Preview
import type { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_MODEL = process.env.DEFAULT_GEMINI_MODEL || "gemini-3-flash-preview";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, system, model: reqModel, apiKey: clientApiKey } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const authHeader = req.headers.authorization;
    const headerApiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const apiKey = clientApiKey || headerApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (!apiKey) {
      return res.status(401).json({ error: "No Gemini API key provided. Please configure your key in AI Settings." });
    }

    const modelToUse = reqModel || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

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
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
