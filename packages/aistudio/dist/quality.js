"use strict";
// F39 AI Creative Studio - the quality pass. Given a laid-out page (background +
// nodes), report problems a human designer would catch: text that fails WCAG AA
// against the background, blocks that overflow the page, and blocks that overlap.
// layoutDesign already avoids these by construction; qualityCheck is the
// verifier (used in tests and surfaced as warnings), so the two stay honest.
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualityCheck = qualityCheck;
const color_1 = require("@hc/color");
function nodeBox(n) {
    const t = n.transform;
    const s = n.size;
    if (!t || !s)
        return null;
    return { id: n.id, x: t.x ?? 0, y: t.y ?? 0, w: s.width ?? 0, h: s.height ?? 0 };
}
function backgroundReferences(background) {
    if (background.type === "solid")
        return [background.color];
    if (background.type === "gradient" && background.stops.length) {
        // Every stop is a reference: text must be readable across the whole
        // gradient, so contrast is judged against the worst stop, not an average.
        return background.stops.map((s) => s.color);
    }
    return [];
}
function firstTextColor(n) {
    const content = n.content;
    const fill = content?.[0]?.runs?.[0]?.style?.fill;
    if (fill && fill.type === "solid")
        return fill.color;
    return null;
}
function overlaps(a, b) {
    // Ignore touching edges; require real area overlap with a small tolerance.
    const tol = 1;
    return a.x < b.x + b.w - tol && a.x + a.w > b.x + tol && a.y < b.y + b.h - tol && a.y + a.h > b.y + tol;
}
function qualityCheck(page) {
    const issues = [];
    const bgRefs = backgroundReferences(page.background);
    const boxes = [];
    for (const n of page.nodes) {
        const box = nodeBox(n);
        if (!box)
            continue;
        boxes.push(box);
        // Contrast (text nodes only): worst case across every background reference.
        if (n.type === "text" && bgRefs.length) {
            const fg = firstTextColor(n);
            if (fg) {
                let ratio = Infinity;
                for (const ref of bgRefs)
                    ratio = Math.min(ratio, (0, color_1.contrastRatio)(fg, ref));
                if (ratio < 4.5) {
                    issues.push({ kind: "contrast", nodeId: n.id, ratio, message: `Text contrast ${ratio.toFixed(2)}:1 is below AA (4.5:1).` });
                }
            }
        }
        // Overflow past the page bounds (small tolerance for rounding).
        const tol = 1;
        if (box.x < -tol || box.y < -tol || box.x + box.w > page.size.width + tol || box.y + box.h > page.size.height + tol) {
            issues.push({ kind: "overflow", nodeId: n.id, message: "Element extends past the page bounds." });
        }
    }
    // Overlap between any two placed boxes.
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
            if (overlaps(boxes[i], boxes[j])) {
                issues.push({ kind: "overlap", nodeId: boxes[i].id, message: `Overlaps element ${boxes[j].id}.` });
            }
        }
    }
    return { ok: issues.length === 0, issues };
}
