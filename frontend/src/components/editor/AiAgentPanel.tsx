// Cursor-Style Right-Side AI Agent Panel for Rezit Studio v2
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  Wand2,
  Settings2,
  Send,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileText,
  Palette,
  Image as ImageIcon,
  LayoutTemplate,
  Trash2,
  ArrowRight,
  Minimize2,
  Maximize2,
  Paperclip,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useEditor } from "@/store/editor";
import { useBrand } from "@/store/brand";
import { useToast } from "@/components/ui/Toast";
import type { PlanStep } from "@hc/aistudio";
import {
  getStoredAiConfig,
  saveStoredAiConfig,
  planCursorAgentTurn,
  generateAiImage,
  callGeminiApi,
  type AiConfig,
} from "@/lib/aiProvider";
import { oc, resolveAssetUrl } from "@/lib/sdk";
import type { Node as DesignNode } from "@hc/schema";
import { fromHex } from "@hc/color";
import { useInspect } from "@/store/inspect";
import { MousePointerClick, Crosshair, X } from "lucide-react";
import { resolvePlanStep, runPlanStep, type AssistantDeps } from "./EditorPanels";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  clarify?: string;
  plan?: PlanStep[];
  timestamp: string;
  status?: "planning" | "ready" | "executing" | "completed" | "error";
  error?: string;
}

export function AiAgentPanel({
  workspaceId,
  onClose,
}: {
  workspaceId?: string | null;
  onClose?: () => void;
}) {
  const toast = useToast();
  const runAsTurn = useEditor((s) => s.runAsTurn);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const rev = useEditor((s) => s.rev);

  // Live Canvas Context
  const doc = useEditor((s) => s.doc);
  const activePage = useEditor((s) => s.activePage);
  const selection = useEditor((s) => s.selection);

  const currentPage = doc.pages[activePage] || { width: 1920, height: 1080, children: [] };
  const pageCount = doc.pages.length;

  const selectedNodes = useMemo(() => {
    if (!selection.length) return [];
    return (currentPage.children || []).filter((n) => selection.includes((n as { id: string }).id));
  }, [currentPage, selection]);

  const selectedNodeTypes = useMemo(() => {
    return selectedNodes.map((n) => (n as { type: string }).type);
  }, [selectedNodes]);

  const selectedText = useMemo(() => {
    const textNode = selectedNodes.find((n) => (n as { type: string }).type === "text");
    if (!textNode) return undefined;
    return (textNode as { text?: string }).text;
  }, [selectedNodes]);

  // Brand Kit Context
  const brandKit = useBrand((s) => s.kit);
  const brandColors = useMemo(() => {
    return (brandKit?.palettes || []).flatMap((p) => p.colors.map((c) => String(c.value)));
  }, [brandKit]);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AiConfig>(getStoredAiConfig);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(aiConfig.apiKey || "");
  const [tempModel, setTempModel] = useState(aiConfig.model || "gemini-2.5-flash");

  // Chat & Agent State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: "👋 Hi! I'm your Rezit AI Agent. Ask me to generate a full slide deck, design a poster, rewrite copy, generate 3D/Flux images, or re-layout elements.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedContext, setAttachedContext] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSaveConfig = () => {
    const updated: AiConfig = {
      ...aiConfig,
      apiKey: tempApiKey.trim(),
      model: tempModel,
    };
    setAiConfig(updated);
    saveStoredAiConfig(updated);
    setShowConfigModal(false);
    toast.success("AI Configuration saved!");
  };

  // Submit Prompt to Agent
  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isProcessing) return;

    setInputPrompt("");
    const userMsgId = `usr-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const initialAsstMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      text: "Thinking...",
      status: "planning",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, initialAsstMsg]);
    setIsProcessing(true);

    try {
      // 1. Gather live context
      const context = {
        pageTitle: doc.title || "Untitled",
        pageCount,
        activePageIndex: activePage,
        pageDimensions: { width: currentPage.width || 1920, height: currentPage.height || 1080 },
        selectionCount: selection.length,
        selectedNodeTypes,
        selectedText,
        brandColors,
        brandVoice: typeof brandKit?.voice === "string" ? brandKit.voice : brandKit?.voice ? JSON.stringify(brandKit.voice) : undefined,
        attachedSourceText: attachedContext || undefined,
      };

      // 2. Plan agent turn
      const { reply, clarify, plan } = await planCursorAgentTurn(prompt, context);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: reply,
                clarify,
                plan,
                status: plan && plan.length > 0 ? "ready" : "completed",
              }
            : m,
        ),
      );

      // If plan has only 1-2 standard actions (e.g. rewrite, re-color), auto-execute
      if (plan && plan.length > 0 && plan.length <= 2 && !clarify) {
        await executePlan(assistantMsgId, plan);
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: "I encountered an issue planning this request.",
                status: "error",
                error: err?.message || String(err),
              }
            : m,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Agent Plan through full @hc/aistudio native engine
  const executePlan = async (messageId: string, plan: PlanStep[]) => {
    setIsProcessing(true);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: "executing" } : m)),
    );

    try {
      const fonts = brandKit?.fonts ?? [];
      const byRole = (m: string) => fonts.find((f: any) => f.role?.toLowerCase().includes(m))?.fontFamily;
      const heading = byRole("head") ?? byRole("title") ?? fonts[0]?.fontFamily;
      const body = byRole("body") ?? byRole("text") ?? byRole("para") ?? fonts[fonts.length - 1]?.fontFamily;

      const wsId = workspaceId || "ws-default";
      const voiceClause = brandKit?.voice ? `Brand voice: ${JSON.stringify(brandKit.voice)}` : "";
      const deps: AssistantDeps = {
        workspaceId: wsId,
        voiceClause,
        brandPalette: brandColors,
        brandFonts: { heading, body },
        imageCapable: true,
        sourceText: attachedContext || undefined,
      };

      const payloads: any[] = [];
      const skips: (string | undefined)[] = [];

      for (let i = 0; i < plan.length; i++) {
        const r = await resolvePlanStep(plan[i], deps);
        payloads[i] = r.payload;
        skips[i] = r.error;
      }

      runAsTurn(() => {
        plan.forEach((step, i) => {
          if (skips[i]) {
            step.status = "failed";
            step.reason = skips[i];
            return;
          }
          try {
            const ok = runPlanStep(step, { payload: payloads[i] });
            step.status = ok ? "done" : "failed";
          } catch (e: any) {
            step.status = "failed";
            step.reason = e?.message || "Execution failed";
          }
        });
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, plan: [...plan], status: "completed" }
            : m,
        ),
      );
      toast.success("Agent edits applied to canvas!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply plan");
    } finally {
      setIsProcessing(false);
    }
  };

  // Visual Inspect Mode
  const inspectMode = useInspect((s) => s.inspectMode);
  const toggleInspectMode = useInspect((s) => s.toggleInspectMode);
  const targetNodeLabel = useInspect((s) => s.targetNodeLabel);
  const closePopover = useInspect((s) => s.closePopover);

  // Global Cmd+Shift+C shortcut for Click-to-Edit Inspect Mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        toggleInspectMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleInspectMode]);

  return (
    <div className="flex h-full flex-col bg-surface select-none">
      {/* Agent Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50/70 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-sm">
            <Sparkles size={13} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              Rezit AI Agent
              <span className="rounded bg-brand-100 px-1 py-0.5 text-[9px] font-bold text-brand-700 uppercase">
                {aiConfig.model?.split("-")[0] || "Gemini"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleInspectMode}
            title={inspectMode ? "Exit Inspect Mode (Cmd+Shift+C)" : "Click-to-Edit: Click any canvas element to edit with AI (Cmd+Shift+C)"}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
              inspectMode
                ? "bg-amber-500 text-white shadow-xs animate-pulse"
                : "text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 border border-neutral-200"
            }`}
          >
            <MousePointerClick size={12} />
            <span>{inspectMode ? "Inspecting" : "Inspect"}</span>
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            title="Configure AI Models & Keys"
            className="grid h-7 w-7 place-items-center rounded text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800"
          >
            <Settings2 size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close Agent Panel"
              className="grid h-7 w-7 place-items-center rounded text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800"
            >
              <Minimize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Context Bar (Active Selection & Page Metadata) */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-neutral-100 bg-white px-3 py-1.5 text-[11px] text-neutral-500">
        <span className="flex shrink-0 items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700 font-medium">
          <LayoutTemplate size={11} /> Slide {activePage + 1}/{pageCount}
        </span>
        {selection.length > 0 ? (
          <span className="flex shrink-0 items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-brand-700 font-medium border border-brand-200">
            <Layers size={11} /> {selection.length} {selection.length === 1 ? "element" : "elements"} selected
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-neutral-400 text-[10px]">
            (No element selected)
          </span>
        )}
        {brandColors.length > 0 && (
          <span className="flex shrink-0 items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 font-medium">
            <Palette size={11} /> Brand active
          </span>
        )}
      </div>

      {/* Chat Messages Stream */}
      <div className="oc-scroll min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1.5 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Clarifying Question */}
              {msg.clarify && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 border border-amber-200">
                  <HelpCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{msg.clarify}</span>
                </div>
              )}

              {/* Plan Preview Cards */}
              {msg.plan && msg.plan.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50/80 p-2">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                      Action Plan ({msg.plan.length} steps)
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        msg.status === "completed"
                          ? "text-emerald-600"
                          : msg.status === "executing"
                          ? "text-brand-600"
                          : "text-neutral-500"
                      }`}
                    >
                      {msg.status === "completed"
                        ? "Applied"
                        : msg.status === "executing"
                        ? "Executing..."
                        : "Ready to run"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {msg.plan.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1 text-[11px] border border-neutral-150"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-neutral-100 text-[9px] font-bold text-neutral-600">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-neutral-700 truncate">
                            {step.action}
                          </span>
                        </div>

                        <div className="shrink-0">
                          {step.status === "done" ? (
                            <CheckCircle2 size={13} className="text-emerald-500" />
                          ) : step.status === "failed" ? (
                            <XCircle size={13} className="text-rose-500" />
                          ) : (
                            <Clock size={13} className="text-neutral-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Plan Execution Button */}
                  {msg.status === "ready" && (
                    <button
                      onClick={() => executePlan(msg.id, msg.plan!)}
                      disabled={isProcessing}
                      className="mt-1.5 flex items-center justify-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-700 transition"
                    >
                      <Play size={12} /> Apply Changes to Canvas
                    </button>
                  )}
                </div>
              )}

              {/* Error Message */}
              {msg.error && (
                <div className="mt-2 flex items-start gap-1.5 rounded bg-rose-50 p-2 text-[11px] text-rose-700 border border-rose-200">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{msg.error}</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-neutral-400 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/50 p-2">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-neutral-500">
          <span>SUGGESTED ACTIONS</span>
          <span className="text-[9px] text-neutral-400">Cmd+L to focus</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { label: "✨ 5-Slide Pitch Deck", prompt: "Generate a 5-slide modern pitch deck for a B2B AI SaaS app" },
            { label: "🖼️ AI Hero Image", prompt: "Generate a 3D glassmorphic hero illustration for this slide" },
            { label: "✍️ Rewrite Copy", prompt: "Rewrite the selected text to sound ultra punchy, concise, and modern" },
            { label: "📐 Auto-Tidy Page", prompt: "Align and harmonize all elements and colors on this page" },
            { label: "🌐 Translate to Spanish", prompt: "Translate this entire presentation to Spanish" },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip.prompt)}
              disabled={isProcessing}
              className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Input Box */}
      <div className="shrink-0 border-t border-neutral-200 bg-white p-2.5">
        {targetNodeLabel && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] text-brand-800">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[9px] text-white">🎯</span>
              <span>Targeting:</span>
              <span className="font-mono font-bold">{targetNodeLabel}</span>
            </span>
            <button
              onClick={() => closePopover()}
              title="Clear target selection"
              className="text-brand-500 hover:text-brand-800"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5 rounded-xl border border-neutral-300 bg-surface p-2 shadow-inner focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <textarea
            ref={inputRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSendPrompt();
              }
            }}
            placeholder={
              targetNodeLabel
                ? `Ask AI to edit ${targetNodeLabel} (e.g. rewrite, restyle, replace)...`
                : "Ask AI Agent to edit canvas, create decks, or generate images..."
            }
            rows={2}
            className="w-full resize-none bg-transparent text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Sparkles size={11} className="text-brand-500" />
              {aiConfig.apiKey ? "Gemini Key Active" : "Built-in AI Engine"}
            </span>

            <button
              onClick={() => handleSendPrompt()}
              disabled={!inputPrompt.trim() || isProcessing}
              className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white shadow hover:bg-brand-700 disabled:opacity-40 transition"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-brand-600" />
                <h3 className="text-sm font-bold text-neutral-800">AI Agent Settings</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 py-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-neutral-700">
                  Google Gemini Model
                </label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand-500 focus:outline-none"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra Fast)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-3-flash-preview">Google Gemini 3 Flash Preview</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-neutral-700">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-brand-500 focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-neutral-500">
                  Get your free Gemini API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 underline font-medium"
                  >
                    Google AI Studio
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
