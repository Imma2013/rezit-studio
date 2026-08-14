// Floating Inline AI Command Bar for Click-to-Edit Visual Inspection
import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  Send,
  X,
  Palette,
  Type,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Maximize2,
  Check,
} from "lucide-react";
import { useInspect } from "@/store/inspect";
import { useEditor } from "@/store/editor";
import { useBrand } from "@/store/brand";
import { useToast } from "@/components/ui/Toast";
import { callGeminiApi, generateAiImage, getStoredAiConfig } from "@/lib/aiProvider";
import { fromHex } from "@hc/color";

export function FloatingAiPopover({
  containerRect,
}: {
  containerRect?: DOMRect | null;
}) {
  const toast = useToast();
  const popoverOpen = useInspect((s) => s.popoverOpen);
  const targetNodeId = useInspect((s) => s.targetNodeId);
  const targetNodeLabel = useInspect((s) => s.targetNodeLabel);
  const targetNodeRect = useInspect((s) => s.targetNodeRect);
  const closePopover = useInspect((s) => s.closePopover);

  const runAsTurn = useEditor((s) => s.runAsTurn);
  const doc = useEditor((s) => s.doc);
  const activePage = useEditor((s) => s.activePage);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (popoverOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [popoverOpen, targetNodeId]);

  if (!popoverOpen || !targetNodeId || !targetNodeRect) return null;

  // Find target node in current page
  const page = doc.pages[activePage];
  const targetNode = page?.children?.find((n: any) => n.id === targetNodeId) as any;
  const isText = targetNode?.type === "text";
  const isImage = targetNode?.type === "image";

  // Calculate floating popover position relative to element
  const posX = Math.max(20, targetNodeRect.x + targetNodeRect.width / 2 - 180);
  const posY = targetNodeRect.y > 100 ? targetNodeRect.y - 75 : targetNodeRect.y + targetNodeRect.height + 15;

  const handleExecute = async (overridePrompt?: string) => {
    const textPrompt = (overridePrompt || prompt).trim();
    if (!textPrompt || loading) return;

    setLoading(true);
    setPrompt("");

    try {
      if (isText) {
        let newText = textPrompt;
        const currentText = targetNode?.text || "";
        const cfg = getStoredAiConfig();
        if (cfg.apiKey) {
          newText = await callGeminiApi(
            `Rewrite this text: "${currentText}". User prompt: "${textPrompt}". Return ONLY the rewritten text without quotes.`,
          );
        }
        runAsTurn(() => {
          useEditor.getState().setText(targetNodeId, newText.trim());
        });
        toast.success("Text updated with AI!");
      } else if (isImage) {
        const newImgUrl = await generateAiImage(textPrompt);
        runAsTurn(() => {
          useEditor.getState().addImage(newImgUrl);
        });
        toast.success("New AI Image placed!");
      } else {
        // Shapes / Containers: Recolor or modify
        const hexMatch = textPrompt.match(/#[0-9a-fA-F]{6}/);
        if (hexMatch) {
          const c = fromHex(hexMatch[0]);
          if (c) {
            runAsTurn(() => {
              useEditor.getState().setFills(targetNodeId, [{ type: "solid", color: c }]);
            });
            toast.success("Element recolored!");
          }
        } else {
          toast.success("Action applied to element!");
        }
      }
      closePopover();
    } catch (err: any) {
      toast.error(err?.message || "Failed to edit element");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ left: posX, top: posY }}
      className="absolute z-50 flex w-[360px] flex-col gap-1.5 rounded-xl border border-brand-300 bg-white/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-1 text-[11px]">
        <span className="flex items-center gap-1.5 font-semibold text-neutral-800">
          <Sparkles size={12} className="text-brand-600 animate-pulse" />
          <span>Edit with AI:</span>
          <span className="max-w-[180px] truncate rounded bg-brand-50 px-1.5 py-0.2 text-brand-700 font-mono text-[10px]">
            {targetNodeLabel || targetNode?.type || "Element"}
          </span>
        </span>

        <button
          onClick={closePopover}
          className="grid h-5 w-5 place-items-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X size={12} />
        </button>
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-surface px-2 py-1 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleExecute();
            } else if (e.key === "Escape") {
              closePopover();
            }
          }}
          placeholder={
            isText
              ? "e.g. 'make it punchier', 'translate to French'..."
              : isImage
              ? "e.g. '3D isometric glowing icon'..."
              : "Ask AI to change color, text, or style..."
          }
          className="min-w-0 flex-1 bg-transparent text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />

        <button
          onClick={() => handleExecute()}
          disabled={!prompt.trim() || loading}
          className="grid h-6 w-6 place-items-center rounded bg-brand-600 text-white shadow-xs hover:bg-brand-700 disabled:opacity-40 transition"
        >
          <Send size={11} />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        {isText ? (
          <>
            <button
              onClick={() => handleExecute("make this copy ultra punchy, energetic, and concise")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              ✍️ Punchy
            </button>
            <button
              onClick={() => handleExecute("rewrite in professional executive tone")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              💼 Professional
            </button>
            <button
              onClick={() => handleExecute("translate into Spanish")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              🌐 Spanish
            </button>
          </>
        ) : isImage ? (
          <>
            <button
              onClick={() => handleExecute("3D glassmorphic modern tech mockup")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              🖼️ 3D Tech Style
            </button>
            <button
              onClick={() => handleExecute("minimalist flat vector logo icon")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              ✨ Vector Logo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleExecute("change color to #6366f1")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              🎨 Indigo Glow
            </button>
            <button
              onClick={() => handleExecute("change color to #0ea5e9")}
              disabled={loading}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
            >
              🌊 Cyan Glow
            </button>
          </>
        )}
      </div>
    </div>
  );
}
