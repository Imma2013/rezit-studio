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

function cleanJsonPayload(raw: string): string {
  // Strip reasoning thoughts
  let s = raw.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();
  // Strip markdown fences
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/i, "").trim();
  }
  // Find JSON boundary
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return s.slice(firstBrace, lastBrace + 1);
  }
  return s;
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

  const hasSelection = context.selectionCount > 0;
  const isTargetingText = hasSelection && context.selectedNodeTypes.includes("text");
  const isTargetingImage = hasSelection && context.selectedNodeTypes.includes("image");

  const system = `You are the AI Creative & Video Editing Agent inside Rezit Studio (like Cursor + Palmier Pro for design and video editing).
You have full tool-calling capabilities to create, edit, rebrand, trim, split, color grade, and layout designs and video timelines.

CURRENT CANVAS / VIDEO CONTEXT:
- Document Type: ${context.selectedNodeTypes.includes("video") ? "Video Project" : "Design / Presentation"}
- Active Slide/Page: ${context.activePageIndex + 1} of ${context.pageCount} (${context.pageDimensions.width}x${context.pageDimensions.height}px)
- Current Selection: ${context.selectionCount} node(s) [${context.selectedNodeTypes.join(', ') || 'none'}]
${context.selectedText ? `- Selected Text Content: "${context.selectedText}"` : ''}
${context.brandColors?.length ? `- Brand Colors: ${context.brandColors.join(', ')}` : ''}
${context.brandVoice ? `- Brand Voice: ${context.brandVoice}` : ''}
${context.attachedSourceText ? `- Attached Source Text: ${context.attachedSourceText.slice(0, 3000)}` : ''}

AVAILABLE TOOL CATALOG (DESIGN & PALMIER PRO VIDEO TOOLS):
${toolSummary}
- set_clip_properties: Trims clip in/out/duration, changes speed, volume, opacity. Args: { durationSeconds?: number, speed?: number, clipId?: string }
- split_clips: Splits a video clip at a timestamp or middle. Args: { atSeconds?: number }
- add_captions: Generates dynamic animated karaoke subtitles overlay. Args: { style?: string, text?: string }
- apply_color: Applies cinematic color grading LUT. Args: { preset: "vivid"|"warm"|"cool"|"noir"|"faded"|"teal_orange" }
- set_project_settings: Sets canvas aspect ratio or resolution. Args: { aspectRatio: "16:9"|"9:16"|"1:1", fps?: number }
- generate_video: Generates a generative video scene using Veo. Args: { prompt: string }

CRITICAL RULES:
1. When asked to cut, shorten, or trim a video (e.g. "cut clip down to 1 minute", "trim to 30s"), plan "set_clip_properties" with { "durationSeconds": 60 }.
2. When asked to split a clip, plan "split_clips".
3. When asked to speed up or slow down, plan "set_clip_properties" with { "speed": 1.5 }.
4. When asked for captions/subtitles, plan "add_captions".
5. When asked to change color/look/mood, plan "apply_color".
6. Return ONLY a valid JSON object matching this schema without any thinking or markdown fences:
{
  "reply": "Crisp 1-sentence explanation of what you did",
  "clarify": "Optional question if ambiguous, otherwise omit",
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
      const rawResponse = await callGeminiApi(userPrompt, system, { jsonMode: true, temperature: 0.2 });
      const cleanJson = cleanJsonPayload(rawResponse);
      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.plan)) {
        // Safety guard: prevent accidental deck generation if element is selected
        let planSteps = parsed.plan;
        if (hasSelection) {
          planSteps = planSteps.filter((s: { action: string }) => s.action !== "generateDesign");
          if (planSteps.length === 0) {
            if (isTargetingText) {
              planSteps = [{ action: "rewriteSelectedText", args: { instruction: userPrompt } }];
            } else if (isTargetingImage) {
              planSteps = [{ action: "editSelectedImage", args: { prompt: userPrompt } }];
            }
          }
        }
        return {
          reply: parsed.reply || "Updated your project with the requested changes.",
          clarify: parsed.clarify,
          plan: planSteps.map((s: { action: string; args?: Record<string, unknown> }) => ({
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

  // Deterministic local smart heuristic planner
  return fallbackHeuristicPlanner(userPrompt, context);
}

function fallbackHeuristicPlanner(
  prompt: string,
  context: { selectionCount: number; selectedNodeTypes: string[]; selectedText?: string },
): { reply: string; plan: PlanStep[] } {
  const p = prompt.toLowerCase();
  const plan: PlanStep[] = [];
  const hasSelection = context.selectionCount > 0;
  const isText = hasSelection && context.selectedNodeTypes.includes("text");
  const isImage = hasSelection && context.selectedNodeTypes.includes("image");

  // PALMIER PRO VIDEO HEURISTICS
  if (p.includes("minute") || p.includes("trim") || p.includes("cut") || p.includes("shorten") || p.includes("duration") || p.includes("length")) {
    let durationSeconds = 60;
    if (p.includes("1 minute") || p.includes("one minute") || p.includes("1m") || p.includes("60s")) durationSeconds = 60;
    else if (p.includes("30") || p.includes("half minute")) durationSeconds = 30;
    else if (p.includes("15")) durationSeconds = 15;
    else if (p.includes("2 minute") || p.includes("two minute")) durationSeconds = 120;
    else {
      const match = p.match(/(\d+)\s*(?:min|sec|s|m)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (p.includes("min") || p.includes("m")) durationSeconds = val * 60;
        else durationSeconds = val;
      }
    }

    plan.push({ action: "set_clip_properties", args: { durationSeconds }, status: "planned" });
    return { reply: `Trimmed the video clip down to ${durationSeconds >= 60 ? `${durationSeconds / 60} minute(s)` : `${durationSeconds} seconds`}.`, plan };
  }

  if (p.includes("split") || p.includes("cut in half") || p.includes("divide")) {
    plan.push({ action: "split_clips", args: { atSeconds: 3 }, status: "planned" });
    return { reply: "Split the clip on the timeline.", plan };
  }

  if (p.includes("speed") || p.includes("fast") || p.includes("slow") || p.includes("2x") || p.includes("1.5x")) {
    let speed = 1.5;
    if (p.includes("2x") || p.includes("double")) speed = 2.0;
    else if (p.includes("0.5x") || p.includes("slow")) speed = 0.5;
    plan.push({ action: "set_clip_properties", args: { speed }, status: "planned" });
    return { reply: `Adjusted clip playback speed to ${speed}x.`, plan };
  }

  if (p.includes("caption") || p.includes("subtitle")) {
    plan.push({ action: "add_captions", args: { style: "karaoke-yellow" }, status: "planned" });
    return { reply: "Added dynamic bold yellow auto-captions track.", plan };
  }

  if (p.includes("color") || p.includes("grade") || p.includes("vibrant") || p.includes("noir") || p.includes("warm") || p.includes("teal")) {
    let preset = "vivid";
    if (p.includes("noir") || p.includes("black and white") || p.includes("moody")) preset = "noir";
    else if (p.includes("warm")) preset = "warm";
    else if (p.includes("teal")) preset = "teal_orange";
    plan.push({ action: "apply_color", args: { preset }, status: "planned" });
    return { reply: `Applied ${preset} color grading to the video clips.`, plan };
  }

  if (p.includes("generate video") || p.includes("create video") || p.includes("ai video") || p.includes("veo")) {
    plan.push({ action: "generate_video", args: { prompt }, status: "planned" });
    return { reply: "Generating AI video with Veo.", plan };
  }

  // 1. If element is selected, prioritize targeted micro-edits
  if (isText) {
    plan.push({ action: "rewriteSelectedText", args: { instruction: prompt }, status: "planned" });
    return { reply: "Updated the selected text.", plan };
  }
  if (isImage) {
    plan.push({ action: "editSelectedImage", args: { prompt }, status: "planned" });
    return { reply: "Updated the selected image.", plan };
  }

  // 2. Global actions
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
    plan.push({ action: "writeText", args: { prompt }, status: "planned" });
    return { reply: "Writing new copy and placing it onto the design.", plan };
  }
  if (p.includes("tidy") || p.includes("align") || p.includes("clean") || p.includes("organize")) {
    plan.push({ action: "tidyLayout", args: {}, status: "planned" });
    plan.push({ action: "harmonize", args: {}, status: "planned" });
    return { reply: "Aligning layout and harmonizing typography and colors.", plan };
  }

  // 3. Fallback
  plan.push({ action: "tidyLayout", args: {}, status: "planned" });
  return { reply: "Optimized the layout and spacing.", plan };
}
