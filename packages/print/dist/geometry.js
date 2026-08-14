"use strict";
// Print geometry (F35 FR-2/FR-4): bleed/trim/safe-zone rectangles, design-to-
// product fitting, and the effective-PPI quality badge. All pure math in
// millimetres unless noted; origin (0,0) is the top-left of the outermost
// (bleed) box. We reuse @hc/engine's `computeEffectivePpi` for placed images via
// the pre-flight module; here `effectivePpi` is the standalone ratio for any
// natural-vs-rendered pixel comparison.
Object.defineProperty(exports, "__esModule", { value: true });
exports.mmToPx = mmToPx;
exports.pxToMm = pxToMm;
exports.mmToPt = mmToPt;
exports.printRects = printRects;
exports.cropMarks = cropMarks;
exports.fitDesignToProduct = fitDesignToProduct;
exports.effectivePpi = effectivePpi;
exports.qualityBadge = qualityBadge;
exports.trimSizeMm = trimSizeMm;
const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;
/** Millimetres -> pixels at a given dpi. */
function mmToPx(mm, dpi) {
    return (mm / MM_PER_INCH) * dpi;
}
/** Pixels -> millimetres at a given dpi. */
function pxToMm(px, dpi) {
    if (dpi <= 0)
        return 0;
    return (px / dpi) * MM_PER_INCH;
}
/** Millimetres -> PostScript points (1pt = 1/72 inch). */
function mmToPt(mm) {
    return (mm / MM_PER_INCH) * PT_PER_INCH;
}
/**
 * The bleed / trim / safe rectangles for a finished (trim) size in mm. The bleed
 * box is the outermost rectangle with its top-left at the origin; the trim box
 * is inset by `bleedMm` on every side; the safe box is inset a further
 * `safeZoneMm` inside the trim. (FR-2, FR-4.)
 */
function printRects(widthMm, heightMm, bleedMm, safeZoneMm) {
    const b = Math.max(0, bleedMm);
    const s = Math.max(0, safeZoneMm);
    const bleed = {
        x: 0,
        y: 0,
        width: widthMm + 2 * b,
        height: heightMm + 2 * b,
    };
    const trim = {
        x: b,
        y: b,
        width: widthMm,
        height: heightMm,
    };
    const safe = {
        x: b + s,
        y: b + s,
        width: Math.max(0, widthMm - 2 * s),
        height: Math.max(0, heightMm - 2 * s),
    };
    return { bleed, trim, safe };
}
/**
 * Printer crop marks for the trim box: two strokes at each of the four corners,
 * sitting in the bleed margin and not crossing into the trim area (FR-2). All
 * coordinates are in mm in the same space as printRects (bleed box at origin).
 * Marks are clamped so they never extend past the bleed sheet edge.
 */
function cropMarks(rects, opts = {}) {
    const len = Math.max(0, opts.markLengthMm ?? 3);
    const gap = Math.max(0, opts.offsetMm ?? 1);
    const t = rects.trim;
    const sheet = rects.bleed;
    const left = t.x;
    const right = t.x + t.width;
    const top = t.y;
    const bottom = t.y + t.height;
    // Outward mark span [near, far] from a trim edge, clamped to the sheet.
    const out = (edge, dir, min, max) => {
        const near = edge + dir * gap;
        const far = edge + dir * (gap + len);
        return [Math.min(Math.max(near, min), max), Math.min(Math.max(far, min), max)];
    };
    const [lN, lF] = out(left, -1, sheet.x, sheet.x + sheet.width);
    const [rN, rF] = out(right, 1, sheet.x, sheet.x + sheet.width);
    const [tN, tF] = out(top, -1, sheet.y, sheet.y + sheet.height);
    const [bN, bF] = out(bottom, 1, sheet.y, sheet.y + sheet.height);
    return [
        // top-left corner: horizontal then vertical
        { x1: lF, y1: top, x2: lN, y2: top },
        { x1: left, y1: tF, x2: left, y2: tN },
        // top-right
        { x1: rN, y1: top, x2: rF, y2: top },
        { x1: right, y1: tF, x2: right, y2: tN },
        // bottom-left
        { x1: lF, y1: bottom, x2: lN, y2: bottom },
        { x1: left, y1: bN, x2: left, y2: bF },
        // bottom-right
        { x1: rN, y1: bottom, x2: rF, y2: bottom },
        { x1: right, y1: bN, x2: right, y2: bF },
    ];
}
/**
 * Map a design (given as width/height in px at some dpi) onto a product's print
 * area for `sizeId`. The print area is the bleed box (so content fills to the
 * bleed). Uses a cover fit by default so the bleed box is fully covered; offsets
 * centre the scaled design and are in design pixels (negative when the design
 * overflows the target, i.e. is cropped). The returned `scale` is the multiplier
 * applied to the design's pixels to reach the target measured in mm-space px
 * (the target box expressed at the design's own dpi via `printRects`).
 *
 * Math is resolution-independent: `scale` is unitless (target-mm per design-px
 * ratio along the chosen axis). Callers convert with `mmToPx` for rendering.
 */
function fitDesignToProduct(designW, designH, product, sizeId, mode = "cover") {
    const size = product.sizes.find((s) => s.id === sizeId);
    if (!size)
        throw new Error(`size ${sizeId} not found on product ${product.id}`);
    if (designW <= 0 || designH <= 0) {
        throw new Error("design dimensions must be positive");
    }
    const { bleed } = printRects(size.widthMm, size.heightMm, product.bleedMm, product.safeZoneMm);
    // Target box dimensions in mm (the bleed box).
    const targetW = bleed.width;
    const targetH = bleed.height;
    const sx = targetW / designW;
    const sy = targetH / designH;
    const scale = mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
    const scaledW = designW * scale;
    const scaledH = designH * scale;
    // Centre the scaled design in the target box (offsets in mm).
    const offsetX = (targetW - scaledW) / 2;
    const offsetY = (targetH - scaledH) / 2;
    return { scale, offsetX, offsetY, mode };
}
/**
 * Effective PPI for a standalone source: natural source pixels along an axis
 * divided by the rendered physical size of that axis. `renderedSizePx` is the
 * placed size measured in pixels at `dpi`; the result is natural pixels per inch
 * once the rendered size is converted to inches. Returns 0 when undeterminable.
 *
 * For placed `ImageNode`s inside a `DesignFile`, prefer @hc/engine's
 * `computeEffectivePpi` (re-exported by the pre-flight module), which accounts
 * for crop and transform; this helper is the raw ratio for simple cases.
 */
function effectivePpi(naturalPx, renderedSizePx, dpi) {
    if (naturalPx <= 0 || renderedSizePx <= 0 || dpi <= 0)
        return 0;
    const renderedInches = renderedSizePx / dpi;
    if (renderedInches <= 0)
        return 0;
    return naturalPx / renderedInches;
}
/**
 * Quality badge from an effective PPI against the product's required DPI (FR-4):
 * `good` at/above the requirement, `warn` within 75%..100% of it, `fail` below
 * 75%. Below the requirement is never `good`.
 */
function qualityBadge(effective, requiredDpi) {
    if (requiredDpi <= 0)
        return "good";
    if (effective >= requiredDpi)
        return "good";
    if (effective >= requiredDpi * 0.75)
        return "warn";
    return "fail";
}
/** Convenience: the trim (finished) size in mm for a product size. */
function trimSizeMm(size) {
    return { widthMm: size.widthMm, heightMm: size.heightMm };
}
