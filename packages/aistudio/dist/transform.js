"use strict";
// F39 Phase 4 - Magic transforms + style transfer (pure core).
//  - Magic Switch: derive an outline from any current design, then re-shape it
//    into a different design type (deck -> summary doc / social set / poster)
//    and re-lay it out for the new form. Deterministic; the model is not needed.
//  - Magic Resize (AI re-layout): recomposing is just running layoutDesign at
//    the new size (it is size-aware), exposed as recomposeSpec for clarity.
//  - Magic Charts: validate a text/NL chart spec into {chartType, categories,
//    series}; the table path reuses the app's tabular parser.
//  - Style transfer: turn an extracted palette into a coherent DeckTheme.
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartSpecJsonSchema = exports.ChartSpecError = void 0;
exports.deriveOutline = deriveOutline;
exports.switchOutline = switchOutline;
exports.recomposeSpec = recomposeSpec;
exports.normalizeChartSpec = normalizeChartSpec;
exports.chartSystemPrompt = chartSystemPrompt;
exports.paletteTheme = paletteTheme;
const color_1 = require("@hc/color");
const layout_1 = require("./layout");
let switchSeq = 0;
function sid() {
    switchSeq += 1;
    return `sw-${switchSeq}`;
}
/** Derive an editable outline from an arbitrary current design: the largest text
 *  on each page becomes the title, the rest become points. */
function deriveOutline(input) {
    const pages = input.pages
        .map((p, i) => {
        const sorted = [...p.texts].filter((t) => t.text.trim()).sort((a, b) => b.fontSize - a.fontSize);
        const title = (sorted[0]?.text ?? p.name ?? `Page ${i + 1}`).trim();
        const points = sorted.slice(1).map((t) => t.text.trim()).filter(Boolean);
        const role = i === 0 ? "cover" : "content";
        return { id: sid(), title, points, visualRole: role };
    })
        .filter((p) => p.title || p.points.length);
    return {
        title: (input.title ?? pages[0]?.title ?? "Untitled").trim() || "Untitled",
        theme: "",
        pages: pages.length ? pages : [{ id: sid(), title: input.title ?? "Untitled", points: [], visualRole: "cover" }],
    };
}
/** Re-shape an outline for a different design type, preserving content. */
function switchOutline(outline, to) {
    if (to === "poster") {
        // Collapse the whole thing into one strong cover.
        const lead = outline.pages[0];
        return {
            title: outline.title,
            theme: outline.theme,
            pages: [{ id: sid(), title: outline.title || lead?.title || "Untitled", points: lead?.points.slice(0, 1) ?? [], visualRole: "cover" }],
        };
    }
    if (to === "social-set") {
        // Each substantive page becomes a standalone, punchy post.
        const posts = outline.pages
            .filter((p) => p.visualRole !== "agenda")
            .map((p) => ({ id: sid(), title: p.title, points: p.points.slice(0, 2), visualRole: (p.visualRole === "data" ? "data" : "cover") }));
        return { title: outline.title, theme: outline.theme, pages: posts.length ? posts : outline.pages };
    }
    if (to === "doc") {
        // Sectioned prose: a title page, then every page as content.
        const pages = outline.pages.map((p, i) => ({ ...p, id: sid(), visualRole: (i === 0 ? "cover" : "content") }));
        return { title: outline.title, theme: outline.theme, pages };
    }
    // deck: identity (re-id for a fresh design).
    return { title: outline.title, theme: outline.theme, pages: outline.pages.map((p) => ({ ...p, id: sid() })) };
}
/** AI Magic Resize re-layout: recompose a spec at a new size (layoutDesign is
 *  size-aware, so this re-flows margins/type-scale/stack rather than scaling). */
function recomposeSpec(spec, size) {
    return (0, layout_1.layoutDesign)(spec, size);
}
// --- Magic Charts ----------------------------------------------------------
const CHART_TYPES = ["bar", "line", "area", "pie", "donut", "scatter", "radar"];
class ChartSpecError extends Error {
}
exports.ChartSpecError = ChartSpecError;
/** Validate a parsed model chart spec into a ChartSpec. Pads/truncates each
 *  series to the category count so the chart model stays well-formed. */
function normalizeChartSpec(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new ChartSpecError("The AI response wasn't a valid chart.");
    }
    const root = parsed;
    const chartType = CHART_TYPES.includes(root.chartType) ? root.chartType : "bar";
    const categories = Array.isArray(root.categories) ? root.categories.map((c) => String(c).trim()).filter(Boolean) : [];
    if (!categories.length)
        throw new ChartSpecError("The chart had no categories.");
    const rawSeries = Array.isArray(root.series) ? root.series : [];
    const series = [];
    for (const s of rawSeries) {
        if (!s || typeof s !== "object")
            continue;
        const o = s;
        const name = typeof o.name === "string" && o.name.trim() ? o.name.trim() : `Series ${series.length + 1}`;
        const raw = Array.isArray(o.values) ? o.values.map((v) => Number(v)) : [];
        const values = categories.map((_, i) => (Number.isFinite(raw[i]) ? raw[i] : 0));
        series.push({ name, values });
    }
    if (!series.length)
        throw new ChartSpecError("The chart had no data series.");
    return { chartType, categories, series };
}
exports.chartSpecJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["chartType", "categories", "series"],
    properties: {
        chartType: { type: "string", enum: CHART_TYPES },
        categories: { type: "array", items: { type: "string" } },
        series: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "values"],
                properties: { name: { type: "string" }, values: { type: "array", items: { type: "number" } } },
            },
        },
    },
};
/** System prompt asking the model to turn a data description into a ChartSpec. */
function chartSystemPrompt() {
    return [
        "You convert a description of data into a single editable chart.",
        `Output ONLY one JSON object, no prose/markdown/fences. Schema: ${JSON.stringify(exports.chartSpecJsonSchema)}.`,
        "Pick the chartType that best fits the data (bar for comparisons, line/area for trends over time, pie/donut for parts of a whole, scatter for correlation, radar for multivariate).",
        "Every series.values array must align 1:1 with categories. Use real numbers from the description; do not invent precision the user didn't give.",
    ].join(" ");
}
// --- Style transfer --------------------------------------------------------
function lum(c) {
    return 0.2126 * c.srgb.r + 0.7152 * c.srgb.g + 0.0722 * c.srgb.b;
}
/** Turn an extracted palette (e.g. from a reference image) into a coherent deck
 *  theme: the darkest vivid color anchors a gradient toward a second hue. */
function paletteTheme(colors, kicker) {
    const usable = colors.filter((c) => c && c.srgb);
    if (!usable.length) {
        return { background: { kind: "solid", color: "#1f2937" }, kicker };
    }
    const sorted = [...usable].sort((a, b) => lum(a) - lum(b));
    const dark = sorted[0];
    const second = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length / 2))] ?? dark;
    if (usable.length === 1) {
        return { background: { kind: "solid", color: (0, color_1.toHex)(dark) }, kicker };
    }
    return {
        background: { kind: "gradient", color: (0, color_1.toHex)(dark), color2: (0, color_1.toHex)(second), angle: 145 },
        kicker,
    };
}
