import { buildAuthorizeUrl, clientIdEnv, type SocialProvider } from '@/lib/social';

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const envKey = clientIdEnv(provider as SocialProvider);
  const clientId = process.env[envKey];
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId || clientId.startsWith('your-') || clientId.startsWith('set-in-')) {
    return Response.json(
      { error: `Provider ${provider} is not configured on the server.` },
      { status: 501 }
    );
  }

  const url = buildAuthorizeUrl(provider as SocialProvider, clientId, base);
  return Response.json({ url });
}
