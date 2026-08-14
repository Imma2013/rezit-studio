"use strict";
// Auto-fit: binary-search a uniform font-size scale so the laid-
// out content fits the box height within the configured min/max, and a
// "fit box to text" that returns box dimensions sized to the content.
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoFitScale = autoFitScale;
exports.autoFitNode = autoFitNode;
exports.fitBoxToText = fitBoxToText;
const layout_1 = require("./layout");
function scaleNode(node, scale) {
    const scaleStyle = (style) => {
        const next = { ...style, fontSize: style.fontSize * scale };
        // An absolute line height must scale with the font; multiplier/auto already do.
        if (style.lineHeight && typeof style.lineHeight === "object" && style.lineHeight.mode === "absolute") {
            next.lineHeight = { mode: "absolute", value: style.lineHeight.value * scale };
        }
        return next;
    };
    return {
        ...node,
        content: node.content.map((p) => ({
            ...p,
            runs: p.runs.map((r) => ({ ...r, style: scaleStyle(r.style) })),
        })),
    };
}
/**
 * Largest font-size scale (multiplier on every run's fontSize) in
 * [minScale, maxScale] for which content height fits box.height. Uses a fixed
 * number of bisection steps with hysteresis-free convergence.
 */
function autoFitScale(node, opts = {}, bounds = {}) {
    const minScale = bounds.minScale ?? 0.25;
    const maxScale = bounds.maxScale ?? 4;
    const steps = bounds.steps ?? 20;
    const target = node.box.height - (node.box.padding ? node.box.padding.t + node.box.padding.b : 0);
    const fits = (scale) => {
        const laid = (0, layout_1.layoutText)({ ...scaleNode(node, scale), box: { ...node.box, mode: "autoHeight" } }, opts);
        return laid.height <= target;
    };
    if (fits(maxScale))
        return maxScale;
    if (!fits(minScale))
        return minScale;
    let lo = minScale;
    let hi = maxScale;
    for (let i = 0; i < steps; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid))
            lo = mid;
        else
            hi = mid;
    }
    return lo;
}
/** The node with every run's font scaled DOWN (shrink-only) so the content
 *  fits the box height, or the node itself when it already fits or auto-fit
 *  is not enabled for it. Renderers call this before layout so an enabled
 *  fixed box shrinks its text instead of overflowing. */
function autoFitNode(node, opts = {}) {
    if (!node.box.autoFit?.enabled || node.box.mode !== "fixed")
        return node;
    const scale = autoFitScale(node, opts, { maxScale: 1, steps: 12 });
    return scale >= 0.999 ? node : scaleNode(node, scale);
}
/** Box dimensions sized to the content (fit box to text). The autoWidth measure
 *  already includes padding, so no extra is added. */
function fitBoxToText(node, opts = {}) {
    return (0, layout_1.measureText)({ ...node, box: { ...node.box, mode: "autoWidth" } }, opts);
}
