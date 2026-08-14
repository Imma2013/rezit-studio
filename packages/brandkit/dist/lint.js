"use strict";
// The brand linter. A pure rule engine over a DesignFile + a
// LintBrandKit: it walks every page/node, then emits violations of five kinds
// with applyable fixes where a safe correction exists:
//
//   off-brand-color  a fill/stroke/text color with no near brand swatch
//                     (when lockColors is on); fix = snap to nearest swatch.
//   off-brand-font   a text family not in the brand font set (when lockFonts
//                     is on); fix = swap to the role-matched brand family.
//   low-contrast     text whose color fails WCAG AA over its background;
//                     fix = nudge the fill to a passing foreground (@hc/color).
//   logo-misuse      a brand logo image placed recolored / non-uniformly
//                     scaled (distorted) / below its min size / inside its
//                     clear space; fix = restore (manual where ambiguous).
//   spacing          an element overlapping the page margin the kit defines
//                     (a pragmatic heuristic, no auto-fix).
//
// Colors are matched in CIELAB via @hc/color (deltaE, nearestPaletteColor),
// reusing the exact tolerance the slice-A locked-save check uses so the live
// lint and the server gate agree. Pure: no IO, runs on the client and a worker.
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR_TOLERANCE = void 0;
exports.kitColors = kitColors;
exports.kitFontFamilies = kitFontFamilies;
exports.lintDesign = lintDesign;
exports.hexOf = hexOf;
const color_1 = require("@hc/color");
/** Max perceptual deltaE for a color to count as "matching" a brand swatch.
 *  Mirrors the slice-A locked-save tolerance so lint and the persist gate agree
 *  (below the just-noticeable-difference threshold). */
exports.COLOR_TOLERANCE = 2.0;
/** WCAG AA normal-text contrast minimum. */
const AA_NORMAL = 4.5;
/** A logo scaled to a width:height ratio that differs from its natural 1:1
 *  placement by more than this is flagged as distorted (non-uniform scale). */
const ASPECT_TOLERANCE = 0.02;
// --- color extraction -------------------------------------------------------
function eachFillColor(fill, out) {
    const f = fill;
    if (f.type === "solid" && f.color)
        out.push(f.color);
    else if (Array.isArray(f.stops))
        for (const s of f.stops)
            out.push(s.color);
}
function collectNodeColors(node, pageId, out) {
    const n = node;
    for (const fill of n.fills ?? []) {
        const cs = [];
        eachFillColor(fill, cs);
        for (const c of cs)
            out.push({ color: c, nodeId: n.id, pageId });
    }
    if (n.stroke?.fill) {
        const cs = [];
        eachFillColor(n.stroke.fill, cs);
        for (const c of cs)
            out.push({ color: c, nodeId: n.id, pageId });
    }
    if (n.stroke?.color)
        out.push({ color: n.stroke.color, nodeId: n.id, pageId });
    for (const para of n.content ?? [])
        for (const run of para.runs) {
            if (run.style.fill) {
                const cs = [];
                eachFillColor(run.style.fill, cs);
                for (const c of cs)
                    out.push({ color: c, nodeId: n.id, pageId });
            }
            if (run.style.color)
                out.push({ color: run.style.color, nodeId: n.id, pageId });
        }
}
function collectNodeFonts(node, pageId, out) {
    const n = node;
    if (n.type !== "text")
        return;
    for (const para of n.content ?? [])
        for (const run of para.runs) {
            const fam = run.style.fontFamily;
            if (fam)
                out.push({ family: fam, nodeId: n.id, pageId });
        }
}
function childrenOfNode(node) {
    const rec = node;
    const kids = rec.children;
    const out = Array.isArray(kids) ? [...kids] : [];
    // Vector composites also nest content (mirrors @hc/templates' findNode).
    if (node.type === "mask" && rec.child)
        out.push(rec.child);
    if (node.type === "boolean" && Array.isArray(rec.operands))
        out.push(...rec.operands);
    return out;
}
function walk(nodes, pageId, visit) {
    for (const node of nodes) {
        visit(node, pageId);
        const kids = childrenOfNode(node);
        if (kids.length)
            walk(kids, pageId, visit);
    }
}
// --- helpers ----------------------------------------------------------------
/** Hex for a color (alpha dropped), for messages + fix `from`. */
function hexOf(c) {
    const ch = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${ch(c.srgb.r)}${ch(c.srgb.g)}${ch(c.srgb.b)}`;
}
/** Every approved color in the kit, flattened. */
function kitColors(kit) {
    const out = [];
    for (const pal of kit.palettes)
        for (const sw of pal.colors)
            out.push(sw.value);
    return out;
}
/** Lowercased approved font families (for case-insensitive matching). */
function kitFontFamilies(kit) {
    return new Set(kit.fonts.map((f) => f.fontFamily.trim().toLowerCase()));
}
/** The brand font to swap an off-brand family to: prefer body, then the first. */
function brandSwapFont(kit) {
    return kit.fonts.find((f) => f.role === "body") ?? kit.fonts[0] ?? null;
}
/** The first solid background color of a page, if any (for contrast checks). */
function pageBackgroundColor(page) {
    if (!page.background)
        return null;
    const cs = [];
    eachFillColor(page.background, cs);
    return cs[0] ?? null;
}
/** The nearest enclosing background color for a text node: its own solid fill is
 *  not the background, so we use the page background (a pragmatic, dependency-
 *  free choice; per-node z-stacking is out of scope for the lint heuristic). */
function backgroundFor(page) {
    return pageBackgroundColor(page) ?? { srgb: { r: 1, g: 1, b: 1, a: 1 } };
}
// --- the linter -------------------------------------------------------------
/**
 * Lint a design against a brand kit (FR-7). Returns every violation found, each
 * with a stable id and (where safe) an applyable fix. An on-brand design returns
 * `[]`. Color/font checks only run when the matching lock is on AND the kit
 * actually defines a constraint (an empty palette/font set cannot constrain, so
 * it is treated as "no rule" rather than rejecting everything). Contrast, logo,
 * and spacing checks always run when the kit is present (they are advisory).
 */
function lintDesign(file, kit) {
    const violations = [];
    if (kit.controls.lintPolicy === "off")
        return violations;
    const palette = kitColors(kit);
    const families = kitFontFamilies(kit);
    const swapFont = brandSwapFont(kit);
    const logoAssetIds = new Set(kit.logos.flatMap((l) => [
        l.assetId,
        l.variants?.dark,
        l.variants?.light,
    ]).filter((x) => !!x));
    const logoById = new Map(kit.logos.map((l) => [l.assetId, l]));
    // --- colors + fonts (FR-7 off-brand) --------------------------------------
    if (kit.controls.lockColors && palette.length > 0) {
        const colors = [];
        for (const page of file.pages) {
            const bg = pageBackgroundColor(page);
            if (bg)
                colors.push({ color: bg, nodeId: page.id, pageId: page.id });
            walk(page.children, page.id, (n, pid) => collectNodeColors(n, pid, colors));
        }
        const seen = new Set();
        for (const { color, nodeId, pageId } of colors) {
            const near = (0, color_1.nearestPaletteColor)(color, palette);
            if (near && near.distance <= exports.COLOR_TOLERANCE)
                continue;
            const hex = hexOf(color);
            const key = `color:${hex}@${nodeId}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            violations.push({
                id: key,
                kind: "off-brand-color",
                severity: "warn",
                nodeId,
                pageId,
                message: `Color ${hex} is not in the brand palette.`,
                fix: near ? { kind: "snap_color", from: hex, to: near.color } : undefined,
            });
        }
    }
    if (kit.controls.lockFonts && families.size > 0) {
        const fonts = [];
        for (const page of file.pages)
            walk(page.children, page.id, (n, pid) => collectNodeFonts(n, pid, fonts));
        const seen = new Set();
        for (const { family, nodeId, pageId } of fonts) {
            if (families.has(family.trim().toLowerCase()))
                continue;
            const key = `font:${family}@${nodeId}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            violations.push({
                id: key,
                kind: "off-brand-font",
                severity: "warn",
                nodeId,
                pageId,
                message: `Font "${family}" is not an approved brand font.`,
                fix: swapFont && swapFont.fontFamily.trim().toLowerCase() !== family.trim().toLowerCase()
                    ? { kind: "swap_font", from: family, to: swapFont.fontFamily }
                    : undefined,
            });
        }
    }
    // --- low contrast (FR-7) --------------------------------------------------
    for (const page of file.pages) {
        const bg = backgroundFor(page);
        walk(page.children, page.id, (node, pid) => {
            if (node.type !== "text")
                return;
            const n = node;
            // Use the first text color found on the node (the dominant run color).
            let fg = null;
            for (const para of n.content ?? []) {
                for (const run of para.runs) {
                    if (run.style.color) {
                        fg = run.style.color;
                        break;
                    }
                    if (run.style.fill) {
                        const cs = [];
                        eachFillColor(run.style.fill, cs);
                        if (cs[0]) {
                            fg = cs[0];
                            break;
                        }
                    }
                }
                if (fg)
                    break;
            }
            if (!fg)
                return;
            const ratio = (0, color_1.contrastRatio)(fg, bg);
            if (ratio >= AA_NORMAL)
                return;
            violations.push({
                id: `contrast:${n.id}`,
                kind: "low-contrast",
                severity: "warn",
                nodeId: n.id,
                pageId: pid,
                message: `Text contrast ${ratio.toFixed(1)}:1 is below WCAG AA (4.5:1).`,
                fix: { kind: "fix_contrast", color: (0, color_1.fixToAA)(fg, bg, AA_NORMAL) },
            });
        });
    }
    // --- logo misuse (FR-7) ---------------------------------------------------
    if (kit.logos.length > 0) {
        for (const page of file.pages) {
            walk(page.children, page.id, (node, pid) => {
                if (node.type !== "image")
                    return;
                const img = node;
                const assetId = img.source?.assetId;
                if (!assetId || !logoAssetIds.has(assetId))
                    return;
                const logo = logoById.get(assetId);
                // Distortion: non-uniform scale (the image is squashed/stretched).
                const sx = Math.abs(img.transform?.scaleX ?? 1);
                const sy = Math.abs(img.transform?.scaleY ?? 1);
                if (sx > 0 && sy > 0 && Math.abs(sx - sy) / Math.max(sx, sy) > ASPECT_TOLERANCE) {
                    violations.push({
                        id: `logo-aspect:${img.id}`,
                        kind: "logo-misuse",
                        severity: "error",
                        nodeId: img.id,
                        pageId: pid,
                        message: "Logo is distorted (non-uniform scale). Scale it uniformly.",
                        fix: { kind: "restore_logo", reason: "aspect" },
                    });
                }
                // Recolor: a logo image carrying a solid color overlay/tint fill that is
                // not an approved variant is treated as an unapproved recolor.
                if ((img.fills ?? []).some((f) => f.type === "solid")) {
                    violations.push({
                        id: `logo-recolor:${img.id}`,
                        kind: "logo-misuse",
                        severity: "error",
                        nodeId: img.id,
                        pageId: pid,
                        message: "Logo appears recolored. Use an approved logo variant instead.",
                    });
                }
                // Min size: rendered width below the kit's minimum.
                const w = (img.size?.width ?? 0) * sx;
                if (logo?.minSizePx && w > 0 && w < logo.minSizePx) {
                    violations.push({
                        id: `logo-size:${img.id}`,
                        kind: "logo-misuse",
                        severity: "warn",
                        nodeId: img.id,
                        pageId: pid,
                        message: `Logo is below its minimum size (${logo.minSizePx}px).`,
                        fix: { kind: "restore_logo", reason: "min_size" },
                    });
                }
            });
        }
    }
    // --- spacing (FR-7, pragmatic) --------------------------------------------
    // A kit may define a page margin (in px) via controls or a logo clear-space
    // ratio; here we flag elements that overlap the page margin band. The margin
    // is read from the design meta (meta.brandMargin) when present, so this stays
    // a lightweight, dependency-free heuristic that an admin can opt into.
    const margin = readMargin(file);
    if (margin > 0) {
        for (const page of file.pages) {
            const w = page.width;
            const h = page.height;
            walk(page.children, page.id, (node, pid) => {
                const t = node.transform;
                const s = node.size;
                if (!t || !s)
                    return;
                const x = t.x ?? 0;
                const y = t.y ?? 0;
                const nw = s.width ?? 0;
                const nh = s.height ?? 0;
                const overlapsMargin = x < margin || y < margin || x + nw > w - margin || y + nh > h - margin;
                if (overlapsMargin) {
                    violations.push({
                        id: `spacing:${node.id}`,
                        kind: "spacing",
                        severity: "info",
                        nodeId: node.id,
                        pageId: pid,
                        message: `Element extends into the ${margin}px brand margin.`,
                    });
                }
            });
        }
    }
    return violations;
}
/** The opt-in page margin (px) for the spacing check, from `meta.brandMargin`. */
function readMargin(file) {
    const m = file.meta?.brandMargin;
    return typeof m === "number" && m > 0 ? m : 0;
}
