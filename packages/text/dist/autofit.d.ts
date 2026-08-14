import type { TextNode } from "@hc/schema";
import { type LayoutOptions } from "./layout";
/**
 * Largest font-size scale (multiplier on every run's fontSize) in
 * [minScale, maxScale] for which content height fits box.height. Uses a fixed
 * number of bisection steps with hysteresis-free convergence.
 */
export declare function autoFitScale(node: TextNode, opts?: LayoutOptions, bounds?: {
    minScale?: number;
    maxScale?: number;
    steps?: number;
}): number;
/** The node with every run's font scaled DOWN (shrink-only) so the content
 *  fits the box height, or the node itself when it already fits or auto-fit
 *  is not enabled for it. Renderers call this before layout so an enabled
 *  fixed box shrinks its text instead of overflowing. */
export declare function autoFitNode(node: TextNode, opts?: LayoutOptions): TextNode;
/** Box dimensions sized to the content (fit box to text). The autoWidth measure
 *  already includes padding, so no extra is added. */
export declare function fitBoxToText(node: TextNode, opts?: LayoutOptions): {
    width: number;
    height: number;
};
