"use strict";
// Pre-flight: a pure pass over the design that surfaces export risks before the
// job runs. Reports low-resolution images (low PPI),
// out-of-gamut colors for a CMYK target, and missing bleed for print.
// Font embeddability is reported when the design declares it; absent that
// metadata it is treated as embeddable (no false warnings).
Object.defineProperty(exports, "__esModule", { value: true });
exports.preflight = preflight;
const schema_1 = require("@hc/schema");
const engine_1 = require("@hc/engine");
const color_1 = require("@hc/color");
const pages_1 = require("./pages");
const types_1 = require("./types");
const PRINT_MIN_PPI = 150;
const SCREEN_MIN_PPI = 72;
/** Visit a node and all descendants (containers, mask child, boolean operands). */
function visit(node, fn) {
    fn(node);
    for (const c of (0, schema_1.childrenOf)(node))
        visit(c, fn);
    const rec = node;
    if (node.type === "mask" && rec.child)
        visit(rec.child, fn);
    if (node.type === "boolean" && Array.isArray(rec.operands)) {
        for (const op of rec.operands)
            visit(op, fn);
    }
}
/** Pull solid colors out of a fills array (gradients are checked per stop). */
function colorsOfFills(fills, out) {
    if (!Array.isArray(fills))
        return;
    for (const f of fills) {
        if (!f)
            continue;
        if (f.type === "solid" && f.color)
            out.push(f.color);
        else if (f.type === "gradient" && Array.isArray(f.stops)) {
            for (const s of f.stops)
                if (s?.color)
                    out.push(s.color);
        }
    }
}
/** Colors referenced by a node (node fills, stroke fill, text run fills). */
function colorsOfNode(node) {
    const out = [];
    const rec = node;
    colorsOfFills(rec.fills, out);
    const stroke = rec.stroke;
    if (stroke?.fill)
        colorsOfFills([stroke.fill], out);
    if (node.type === "text" && Array.isArray(rec.content)) {
        for (const para of rec.content) {
            for (const run of para.runs ?? []) {
                const style = run.style;
                if (style?.fill)
                    colorsOfFills([style.fill], out);
            }
        }
    }
    return out;
}
/**
 * Run pre-flight for an export request over its selected pages. Pure: no I/O.
 */
function preflight(file, request) {
    const pages = (0, pages_1.resolvePages)(file, request.pages);
    const isPrint = types_1.PRINT_FORMATS.has(request.format);
    const isPdf = request.format === "pdf" || request.format === "pdfx";
    const minPpi = isPdf ? PRINT_MIN_PPI : SCREEN_MIN_PPI;
    const cmyk = request.pdf?.intent === "cmyk";
    const cmykProfile = request.pdf?.cmykProfile;
    const lowResImages = [];
    const outOfGamut = [];
    for (const pi of pages) {
        for (const root of file.pages[pi].children) {
            visit(root, (node) => {
                if (node.type === "image") {
                    const ppi = (0, engine_1.computeEffectivePpi)(node, file);
                    if (Number.isFinite(ppi) && ppi > 0 && ppi < minPpi) {
                        lowResImages.push({ nodeId: node.id, ppi: Math.round(ppi) });
                    }
                }
                if (cmyk) {
                    for (const color of colorsOfNode(node)) {
                        if (!(0, color_1.gamutCheck)(color, cmykProfile).inGamut) {
                            outOfGamut.push({ nodeId: node.id, color });
                        }
                    }
                }
            });
        }
    }
    // Print needs a bleed on every exported page; flag if any lacks one.
    const missingBleed = isPrint && pages.some((pi) => !file.pages[pi].bleed);
    // Font embeddability: honor an explicit `embeddable === false` on a FontRef.
    const fontIssues = [];
    for (const font of file.fonts) {
        const rec = font;
        if (rec.embeddable === false) {
            fontIssues.push({ fontId: font.id, reason: "font does not permit embedding" });
        }
    }
    return { lowResImages, outOfGamut, missingBleed, fontIssues };
}
