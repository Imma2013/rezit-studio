import type { CanvasLike } from "./types";
import type { DesignFile, Node, PageTransition } from "@hc/schema";
/** Anything the destination context can `drawImage`: an HTMLCanvasElement, an
 *  OffscreenCanvas, an ImageBitmap, or a server canvas surface. */
export type TransitionSurface = unknown;
export interface TransitionFrame {
    /** The leaving slide, already rendered. */
    from: TransitionSurface;
    /** The arriving slide, already rendered. */
    to: TransitionSurface;
    /** Destination pixel width. */
    width: number;
    /** Destination pixel height. */
    height: number;
    /** Eased progress, 0 (fully `from`) to 1 (fully `to`). */
    progress: number;
    /** Background painted before compositing; slides may be transparent. */
    background?: string;
}
/**
 * Composite `frame.from` and `frame.to` for `transition` at `frame.progress`.
 *
 * The caller owns rendering each slide into its surface (once per frame) and,
 * for `morph`, drawing the tweened shared elements after this returns.
 * Unknown transition types fall back to showing the arriving slide, matching
 * the `none` behavior, so a forward-compatible file never renders blank.
 */
export declare function renderTransition(ctx: CanvasLike, transition: PageTransition, frame: TransitionFrame): void;
/** The shared elements a Magic Move tweens, indexed under the arriving node id. */
export interface MorphPlan {
    ids: string[];
    fromNodes: Map<string, Node>;
    toNodes: Map<string, Node>;
}
/**
 * Plan a Magic Move: the top-level children shared between two slides.
 *
 * Matching is by stable schema node id first (the open format's advantage over
 * PowerPoint's name heuristics), then by a name unique on BOTH sides, which
 * covers "duplicate the slide, then move an element" since duplication
 * regenerates ids but keeps names. Returns null when nothing is shared, so the
 * caller can fall back to a plain cross-fade.
 */
export declare function morphPlan(from: DesignFile, fromPage: number, to: DesignFile, toPage: number): MorphPlan | null;
/** Interpolate a node between its outgoing and incoming pose (transform/size/
 *  opacity) at eased progress `p`; appearance is taken from the destination. */
export declare function lerpNode(a: Node, b: Node, p: number): Node;
/** Build the design a morph draws on top: the arriving page with only the
 *  shared elements, posed at `p`. Render this after `renderTransition`. */
export declare function morphDesignAt(plan: MorphPlan, to: DesignFile, toPage: number, p: number): DesignFile;
/** The ids a morph tweens, which the caller must hide while rendering the two
 *  buffers so they are not also cross-faded underneath the tweened layer. */
export declare function morphHiddenIds(plan: MorphPlan): Set<string>;
