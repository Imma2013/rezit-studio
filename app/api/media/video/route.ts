import { GoogleGenAI } from '@google/genai';
import { envConfigured } from '@/lib/env';

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: unknown; duration?: unknown };
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) return Response.json({ error: 'Prompt is required.' }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!envConfigured(apiKey)) {
    return Response.json({
      uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mock: true,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const model = process.env.GEMINI_VIDEO_MODEL || 'veo-3.1';
    const response = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        aspectRatio: '9:16',
        durationSeconds: typeof body.duration === 'number' ? body.duration : 6,
      },
    });

    const op = response as unknown as {
      generatedVideos?: Array<{ video?: { uri?: string } }>;
      response?: { generatedVideos?: Array<{ video?: { uri?: string } }> };
    };
    const videoUri = op.generatedVideos?.[0]?.video?.uri || op.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) return Response.json({ uri: videoUri });

    return Response.json({
      uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    });
  } catch (error) {
    return Response.json({
      uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      error: error instanceof Error ? error.message : 'Veo video generation error',
    });
  }
}
