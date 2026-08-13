import { GoogleGenAI } from '@google/genai';
import { envConfigured } from '@/lib/env';

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: unknown };
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) return Response.json({ error: 'Prompt is required.' }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!envConfigured(apiKey)) {
    return Response.json({
      uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      mock: true,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    for (const cand of response.candidates || []) {
      for (const part of cand.content?.parts || []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return Response.json({ uri: `data:${mime};base64,${part.inlineData.data}` });
        }
      }
    }

    return Response.json({
      uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    });
  } catch (error) {
    return Response.json({
      uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      error: error instanceof Error ? error.message : 'Image generation error',
    });
  }
}
