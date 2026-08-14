"use strict";
// Style extraction and swap-styles. extractStyle
// walks the scene graph for a palette (fill colors by frequency), typography
// (text runs ranked into roles by size), and effects. applyStyle re-skins a
// design's content to a StyleDescriptor - colors remapped positionally, text
// typography swapped by role - leaving geometry and copy intact, and reports
// what could not be mapped cleanly.
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStyle = extractStyle;
exports.applyStyle = applyStyle;
const schema_1 = require("@hc/schema");
const color_1 = require("@hc/color");
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
function colorsInFills(fills, out) {
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
function runStylesOf(node) {
    if (node.type !== "text")
        return [];
    const rec = node;
    const out = [];
    for (const para of rec.content ?? []) {
        for (const run of para.runs ?? []) {
            const st = run.style ?? {};
            const axes = st.axes ?? {};
            out.push({ family: String(st.fontFamily ?? "sans-serif"), size: Number(st.fontSize) || 16, weight: axes.wght ?? 400 });
        }
    }
    return out;
}
const ROLES = ["heading", "subheading", "body", "accent"];
/** Extract a StyleDescriptor from a design (FR-9). */
function extractStyle(file, maxPalette = 8) {
    const colorFreq = new Map();
    const runs = [];
    const effects = new Set();
    for (const page of file.pages) {
        if (page.background) {
            const bg = [];
            colorsInFills([page.background], bg);
            for (const c of bg) {
                const hex = (0, color_1.toHex)(c).slice(0, 7);
                colorFreq.set(hex, (colorFreq.get(hex) ?? 0) + 1);
            }
        }
        for (const root of page.children) {
            visit(root, (n) => {
                const rec = n;
                const cols = [];
                colorsInFills(rec.fills, cols);
                const stroke = rec.stroke;
                if (stroke?.fill)
                    colorsInFills([stroke.fill], cols);
                for (const c of cols) {
                    const hex = (0, color_1.toHex)(c).slice(0, 7); // drop alpha for palette grouping
                    colorFreq.set(hex, (colorFreq.get(hex) ?? 0) + 1);
                }
                for (const e of rec.effects ?? [])
                    if (e?.kind)
                        effects.add(String(e.kind));
                runs.push(...runStylesOf(n));
            });
        }
    }
    const palette = [...colorFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxPalette).map((e) => e[0]);
    // Rank distinct run styles by size desc into roles.
    const distinct = new Map();
    for (const r of runs)
        distinct.set(`${r.size}-${r.family}-${r.weight}`, r);
    const ranked = [...distinct.values()].sort((a, b) => b.size - a.size);
    const typography = ranked.slice(0, 4).map((r, i) => ({ role: ROLES[i], family: r.family, weight: r.weight }));
    return { palette, typography, effects: [...effects] };
}
/**
 * Re-skin a design to a StyleDescriptor (FR-7). Solid/gradient colors are
 * remapped positionally from the design's own palette onto the target palette;
 * text runs are restyled by role (largest run in a node = heading, else body).
 * Content (geometry and copy) is untouched. Pure: returns a new file.
 */
function applyStyle(file, style) {
    const clone = JSON.parse(JSON.stringify(file));
    const approximated = new Set();
    let colorsRemapped = 0;
    let runsRestyled = 0;
    // Build old-hex -> new-hex map from the design's palette onto the style's.
    const current = extractStyle(file).palette;
    const targetPalette = style.palette.length ? style.palette : current;
    const colorMap = new Map();
    current.forEach((hex, i) => colorMap.set(hex, targetPalette[i % targetPalette.length]));
    const remapColor = (c) => {
        const hex = (0, color_1.toHex)(c).slice(0, 7);
        const to = colorMap.get(hex);
        if (!to)
            return c;
        const nc = (0, color_1.fromHex)(to);
        if (!nc)
            return c;
        nc.srgb.a = c.srgb.a; // preserve alpha
        colorsRemapped++;
        return nc;
    };
    const remapFills = (fills) => {
        if (!Array.isArray(fills))
            return;
        for (const f of fills) {
            if (f?.type === "solid" && f.color)
                f.color = remapColor(f.color);
            else if (f?.type === "gradient" && Array.isArray(f.stops)) {
                for (const s of f.stops)
                    if (s?.color)
                        s.color = remapColor(s.color);
            }
        }
    };
    const byRole = (role) => style.typography.find((t) => t.role === role);
    for (const page of clone.pages) {
        for (const root of page.children) {
            visit(root, (n) => {
                const rec = n;
                remapFills(rec.fills);
                const stroke = rec.stroke;
                if (stroke?.fill)
                    remapFills([stroke.fill]);
                if (n.type === "text" && Array.isArray(rec.content)) {
                    // Find the largest run size in this node -> heading; others -> body.
                    let maxSize = -Infinity;
                    for (const para of rec.content) {
                        for (const run of para.runs ?? [])
                            maxSize = Math.max(maxSize, Number(run.style?.fontSize) || 16);
                    }
                    const heading = byRole("heading");
                    const body = byRole("body") ?? heading;
                    if (!body)
                        approximated.add("typography");
                    for (const para of rec.content) {
                        for (const run of para.runs ?? []) {
                            const st = run.style ?? (run.style = {});
                            const size = Number(st.fontSize) || 16;
                            const role = size >= maxSize ? heading : body;
                            if (role) {
                                st.fontFamily = role.family;
                                st.axes = { ...st.axes, wght: role.weight };
                                runsRestyled++;
                            }
                        }
                    }
                }
            });
        }
    }
    return { file: clone, colorsRemapped, runsRestyled, approximated: [...approximated] };
}
