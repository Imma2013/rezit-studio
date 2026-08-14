// Google Gemini & Multi-Model AI Provider Engine for Rezit Studio v2
import type { PlanStep, ToolDef } from "@hc/aistudio";
import { toolCatalog } from "@hc/aistudio";

export interface AiConfig {
  provider: "gemini" | "openai" | "anthropic" | "deepseek" | "custom";
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

const AI_CONFIG_KEY = "rezit_ai_config";

export function getStoredAiConfig(): AiConfig {
  if (typeof window === "undefined") return { provider: "gemini", model: "gemini-3-flash-preview" };
  try {
    const raw = window.localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { provider: "gemini", model: "gemini-3-flash-preview" };
}

export function saveStoredAiConfig(cfg: AiConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

/** Calls Google Gemini REST API */
export async function callGeminiApi(
  prompt: string,
  systemPrompt?: string,
  optionsOrModel?:
    | string
    | {
        model?: string;
        apiKey?: string;
        jsonMode?: boolean;
        temperature?: number;
      },
): Promise<string> {
  const modelArg = typeof optionsOrModel === "string" ? optionsOrModel : optionsOrModel?.model;
  const options = typeof optionsOrModel === "object" ? optionsOrModel : undefined;

  // Try server-side route first for 100% security & speed
  try {
    const res = await fetch("/api/ai/text/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system: systemPrompt, model: modelArg || "gemini-3-flash-preview" }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.text) return data.text;
    }
  } catch {
    // fallback to client-side direct
  }

  const cfg = getStoredAiConfig();
  const apiKey = options?.apiKey || cfg.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const model = modelArg || cfg.model || "gemini-3-flash-preview";

  // Google Generative Language API endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents: Array<{ role?: string; parts: Array<{ text: string }> }> = [];

  const body: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      ...(options?.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini API error: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

/** Free, high-speed AI Image Generation using Pollinations/Flux */
export async function generatePollinationsImage(
  prompt: string,
  width: number = 1024,
  height: number = 1024,
): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(prompt.trim().slice(0, 400));
  const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
  return imageUrl;
}

/** Generates an AI Image using Google Imagen, OpenAI DALL-E, or Pollinations Flux */
export async function generateAiImage(
  prompt: string,
  options?: {
    aspect?: "square" | "landscape" | "portrait";
    size?: string;
    style?: string;
  },
): Promise<string> {
  const aspect = options?.aspect || "square";
  const width = aspect === "landscape" ? 1792 : aspect === "portrait" ? 1024 : 1024;
  const height = aspect === "landscape" ? 1024 : aspect === "portrait" ? 1792 : 1024;

  const cfg = getStoredAiConfig();
  if (cfg.provider === "openai" && cfg.apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: aspect === "landscape" ? "1792x1024" : aspect === "portrait" ? "1024x1792" : "1024x1024",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.data?.[0]?.url || "";
      }
    } catch {
      // fallback to Pollinations
    }
  }

  // Fast high-quality Flux generation
  return await generatePollinationsImage(prompt, width, height);
}

/** Generates a complete Cursor-Style Agent Plan for the current canvas context */
export async function planCursorAgentTurn(
  userPrompt: string,
  context: {
    pageTitle?: string;
    pageCount: number;
    activePageIndex: number;
    pageDimensions: { width: number; height: number };
    selectionCount: number;
    selectedNodeTypes: string[];
    selectedText?: string;
    brandColors?: string[];
    brandVoice?: string;
    attachedSourceText?: string;
  },
): Promise<{ reply: string; clarify?: string; plan: PlanStep[] }> {
  const tools = toolCatalog();
  const toolSummary = tools.map((t) => `- ${t.name}: ${t.description} (params: ${t.params.map((p) => `${p.name}:${p.type}${p.required ? '!' : ''}`).join(', ') || 'none'})`).join('\n');

  const system = `You are the AI Creative Agent inside Rezit Studio (a modern graphic & video design platform like Canva + Figma + Cursor).
You have full tool-calling capabilities to create, edit, rebrand, and layout designs on the canvas.

CURRENT CANVAS CONTEXT:
- Active Slide/Page: ${context.activePageIndex + 1} of ${context.pageCount} (${context.pageDimensions.width}x${context.pageDimensions.height}px)
- Current Selection: ${context.selectionCount} node(s) [${context.selectedNodeTypes.join(', ') || 'none'}]
${context.selectedText ? `- Selected Text Content: "${context.selectedText}"` : ''}
${context.brandColors?.length ? `- Brand Colors: ${context.brandColors.join(', ')}` : ''}
${context.brandVoice ? `- Brand Voice: ${context.brandVoice}` : ''}
${context.attachedSourceText ? `- Attached Source Text: ${context.attachedSourceText.slice(0, 3000)}` : ''}

AVAILABLE TOOL CATALOG:
${toolSummary}

RULES:
1. Understand the user's intent. If they want to create something from scratch (e.g. "make a pitch deck", "create an instagram post"), plan "generateDesign".
2. If they want to edit or rewrite text, plan "setSelectedText" or "rewriteSelectedText".
3. If they want background changes, plan "setPageBackground" or "generateBackgroundImage".
4. If they want images, plan "generateImage" or "editSelectedImage".
5. Return ONLY a JSON object matching this schema:
{
  "reply": "Short natural language explanation of what you are doing (1-2 sentences)",
  "clarify": "Optional question if prompt is completely ambiguous, otherwise omit",
  "plan": [
    {
      "action": "toolName",
      "args": { "param1": "value" },
      "status": "planned"
    }
  ]
}`;

  const cfg = getStoredAiConfig();
  if (cfg.apiKey || cfg.provider === "gemini") {
    try {
      const rawJson = await callGeminiApi(userPrompt, system, { jsonMode: true, temperature: 0.2 });
      const parsed = JSON.parse(rawJson);
      if (parsed && Array.isArray(parsed.plan)) {
        return {
          reply: parsed.reply || "I've created a plan to update your design.",
          clarify: parsed.clarify,
          plan: parsed.plan.map((s: { action: string; args?: Record<string, unknown> }) => ({
            action: s.action,
            args: s.args || {},
            status: "planned" as const,
          })),
        };
      }
    } catch (err) {
      console.warn("Gemini agent planning fallback:", err);
    }
  }

  // Deterministic local smart heuristic planner if offline or no key configured
  return fallbackHeuristicPlanner(userPrompt, context);
}

function fallbackHeuristicPlanner(
  prompt: string,
  context: { selectionCount: number; selectedNodeTypes: string[]; selectedText?: string },
): { reply: string; plan: PlanStep[] } {
  const p = prompt.toLowerCase();
  const plan: PlanStep[] = [];

  if (p.includes("deck") || p.includes("presentation") || p.includes("pitch") || p.includes("slide")) {
    plan.push({ action: "generateDesign", args: { prompt, designType: "deck" }, status: "planned" });
    return { reply: "Generating a custom slide deck based on your prompt.", plan };
  }
  if (p.includes("post") || p.includes("instagram") || p.includes("flyer") || p.includes("poster") || p.includes("card")) {
    plan.push({ action: "generateDesign", args: { prompt, designType: "poster" }, status: "planned" });
    return { reply: "Creating a high-impact design tailored to your request.", plan };
  }
  if (p.includes("image") || p.includes("photo") || p.includes("illustration") || p.includes("picture") || p.includes("generate")) {
    plan.push({ action: "generateImage", args: { prompt }, status: "planned" });
    return { reply: "Generating an AI image for your canvas.", plan };
  }
  if (p.includes("background") || p.includes("bg")) {
    plan.push({ action: "generateBackgroundImage", args: { prompt }, status: "planned" });
    return { reply: "Generating a full-bleed background scene.", plan };
  }
  if (p.includes("rewrite") || p.includes("copy") || p.includes("headline") || p.includes("text")) {
    if (context.selectionCount > 0 && context.selectedNodeTypes.includes("text")) {
      plan.push({ action: "rewriteSelectedText", args: { instruction: prompt }, status: "planned" });
      return { reply: "Rewriting the selected text to match your instructions.", plan };
    }
    plan.push({ action: "writeText", args: { prompt }, status: "planned" });
    return { reply: "Writing new copy and placing it onto the design.", plan };
  }
  if (p.includes("tidy") || p.includes("align") || p.includes("clean") || p.includes("organize")) {
    plan.push({ action: "tidyLayout", args: {}, status: "planned" });
    plan.push({ action: "harmonize", args: {}, status: "planned" });
    return { reply: "Aligning layout and harmonizing typography and colors.", plan };
  }

  // Default design generation
  plan.push({ action: "generateDesign", args: { prompt }, status: "planned" });
  return { reply: "Building your design request on the canvas.", plan };
}
