import { type BlendMode } from "@hc/schema";
import type { AssetProvider, CanvasLike, Scene, Viewport } from "./types";
export declare function bumpTextLayout(): void;
export interface Render2DOptions {
    /** Called when a node throws during draw; the node still renders a placeholder. */
    onError?: (err: unknown, nodeId: string) => void;
    /** Loaded media/fonts; when absent, media draws a neutral placeholder (FR-11). */
    assets?: AssetProvider;
    /** Skip expensive work during interaction (reserved for adaptive quality). */
    quality?: "full" | "low";
    /** Clear the canvas before drawing (default true). Set false to draw multiple
     *  scenes onto one canvas, e.g. stacked pages in continuous-scroll mode. */
    clear?: boolean;
    /** Skip drawing this node (and its subtree). Used to hide a text node while it
     *  is being edited in the live HTML overlay, so the two don't double up. */
    skipNodeId?: string;
    /** Skip drawing these nodes (and their subtrees). Per-client visual hide that
     *  does not touch the document, used by whiteboard private mode to hide other
     *  participants' new contributions until reveal (FR-15). */
    hiddenIds?: ReadonlySet<string>;
    /** Viewport culling + sub-pixel LOD (FR-27); default on. Set false to force a
     *  full paint of every node (e.g. off-screen thumbnail/export of a whole page). */
    cull?: boolean;
    /** Draw ONLY the page background (fill), then return. Used by the editor's
     *  two-pass stacked render: all page backgrounds first, so a later page's
     *  background never covers an earlier page's overflowing content. */
    backgroundOnly?: boolean;
    /** Skip the page background fill and draw only the content. The other half of
     *  the two-pass render (content composited on top of every background). */
    skipBackground?: boolean;
    /** Node ids to render at reduced opacity (and their subtrees). The editor sets
     *  this to the element(s) being actively moved/resized so the page shows through
     *  them during the gesture. */
    fadeIds?: ReadonlySet<string>;
    /** Clip each top-level element to the page rectangle so content that overflows
     *  the artboard is hidden (clean page edges). Off by default so
     *  export/thumbnail render the full content. `revealIds` are exempt. */
    clipToPage?: boolean;
    /** Top-level node ids exempt from `clipToPage`, drawn unclipped so their
     *  overflow is visible. The editor sets this to the current selection so a
     *  selected element reveals the parts hidden past the page edge. */
    revealIds?: ReadonlySet<string>;
}
/** Map a scene-model blend mode to a Canvas2D globalCompositeOperation. */
export declare function blendToComposite(mode: BlendMode): string;
/** Render a scene to a 2D context at the given viewport. */
export declare function renderScene(scene: Scene, ctx: CanvasLike, viewport: Viewport, opts?: Render2DOptions): void;
