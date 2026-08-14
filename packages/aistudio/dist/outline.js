"use strict";
// F39 Phase 2 - multi-page generation (outline-first). The model returns an
// editable DesignOutline (per-page title + key points + a visual role); the user
// can edit it; then each OutlineItem expands deterministically into an
// AiDesignSpec laid out by the Phase 1 engine. No page positions come from the
// model - only content and intent - so a whole deck shares one visual system.
Object.defineProperty(exports, "__esModule", { value: true });
exports.outlineJsonSchema = exports.OutlineError = exports.VISUAL_ROLES = exports.DESIGN_TYPES = void 0;
exports.normalizeOutline = normalizeOutline;
exports.outlineItemToSpec = outlineItemToSpec;
exports.DESIGN_TYPES = ["deck", "doc", "social-set", "poster"];
exports.VISUAL_ROLES = ["cover", "agenda", "content", "comparison", "quote", "data", "closing"];
// --- Validation ------------------------------------------------------------
class OutlineError extends Error {
}
exports.OutlineError = OutlineError;
let idSeq = 0;
/** Deterministic id (no Math.random, which is unavailable in some sandboxes and
 *  breaks reproducibility); unique within a normalize pass. */
function nextId() {
    idSeq += 1;
    return `ol-${idSeq}`;
}
function str(v) {
    return typeof v === "string" ? v.trim() : "";
}
/** Validate + normalize a parsed model value into a DesignOutline. Drops empty
 *  pages, defaults roles, and throws when nothing usable remains. */
function normalizeOutline(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new OutlineError("The AI response wasn't a valid outline.");
    }
    const root = parsed;
    const title = str(root.title) || "Untitled";
    const theme = str(root.theme);
    const rawPages = Array.isArray(root.pages) ? root.pages : [];
    const pages = [];
    for (const item of rawPages) {
        if (!item || typeof item !== "object")
            continue;
        const p = item;
        const pTitle = str(p.title);
        const points = Array.isArray(p.points) ? p.points.map(str).filter(Boolean).slice(0, 8) : [];
        if (!pTitle && !points.length)
            continue;
        const visualRole = exports.VISUAL_ROLES.includes(p.visualRole) ? p.visualRole : "content";
        pages.push({ id: nextId(), title: pTitle || "Untitled", points, visualRole });
    }
    if (!pages.length) {
        throw new OutlineError("The AI didn't return any pages. Try a more specific prompt.");
    }
    return { title, theme, pages };
}
/** JSON Schema for a DesignOutline, embedded in the generation prompt. */
exports.outlineJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["title", "pages"],
    properties: {
        title: { type: "string" },
        theme: { type: "string", description: "short mood/topic phrase" },
        pages: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "visualRole"],
                properties: {
                    title: { type: "string" },
                    points: { type: "array", items: { type: "string" } },
                    visualRole: { type: "string", enum: exports.VISUAL_ROLES },
                },
            },
        },
    },
};
// --- Outline -> per-page spec ---------------------------------------------
/** Map a visual role to a base layout intent. */
const ROLE_LAYOUT = {
    cover: "centered",
    agenda: "title-top",
    content: "left",
    comparison: "title-top",
    quote: "centered",
    data: "title-top",
    closing: "centered",
};
/** Expand one outline item into a laid-out-ready AiDesignSpec, themed
 *  consistently with the rest of the deck. Pure + deterministic. `index` lets
 *  consecutive content pages alternate composition for visual rhythm (FR-3:
 *  template-grounded, well-formed structure, not one rigid layout). */
function outlineItemToSpec(item, theme, opts) {
    const blocks = [];
    const role = item.visualRole;
    const index = opts?.index ?? 0;
    // A kicker eyebrow on non-cover pages ties the deck together.
    if (theme.kicker && role !== "cover" && role !== "quote") {
        blocks.push({ role: "eyebrow", text: theme.kicker });
    }
    if (role === "quote") {
        // A quote page leads with the line itself as the heading.
        const quote = item.points[0] || item.title;
        blocks.push({ role: "heading", text: `"${quote}"` });
        if (item.points[1] || item.title !== quote) {
            blocks.push({ role: "subheading", text: item.points[1] || item.title });
        }
    }
    else {
        blocks.push({ role: "heading", text: item.title });
        // A subheading from the first point gives content/cover pages a deck.
        const [lead, ...rest] = item.points;
        if (role === "cover" && lead) {
            blocks.push({ role: "subheading", text: lead });
            // An accent divider + a trailing call-to-action/footer line make a poster
            // or title page read as a finished composition, not just a headline.
            blocks.push({ role: "accent" });
            if (rest.length)
                blocks.push({ role: "body", text: rest[rest.length - 1] });
        }
        else {
            if (lead)
                blocks.push({ role: "accent" });
            const bodyPoints = role === "cover" ? [] : item.points;
            for (const pt of bodyPoints)
                blocks.push({ role: "body", text: bullet(role, pt) });
            // (rest already covered by bodyPoints loop for non-cover)
            void rest;
        }
    }
    // Content pages alternate left/split so a long deck has rhythm rather than a
    // wall of identical slides (template-grounded variety, FR-3).
    let layout = ROLE_LAYOUT[role];
    if (role === "content" && index % 2 === 1) {
        layout = "split";
    }
    return {
        layout,
        background: theme.background,
        blocks,
        dir: opts?.dir ?? "ltr",
        fonts: { heading: theme.fontHeading, body: theme.fontBody },
    };
}
/** Prefix content/comparison points with a bullet glyph; leave others plain. */
function bullet(role, text) {
    return role === "content" || role === "comparison" || role === "agenda" ? `•  ${text}` : text;
}
