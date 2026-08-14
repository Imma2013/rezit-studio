"use strict";
// F39 Phase 2 - assemble a whole multi-page design from an outline + a theme.
// Pure: turns each OutlineItem into a laid-out page (background + nodes) via the
// Phase 1 engine, so the store just persists the result as new pages. Cover
// pages can use a distinct emphasis while the rest share the system.
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutDeck = layoutDeck;
const layout_1 = require("./layout");
const quality_1 = require("./quality");
const outline_1 = require("./outline");
/** Lay out every outline page into a DeckPage. `dir` propagates RTL. */
function layoutDeck(outline, theme, size, opts) {
    // Default the kicker to the deck title so content pages carry it, unless the
    // theme already set one.
    const themed = { ...theme, kicker: theme.kicker ?? outline.title };
    const pages = outline.pages.map((item, i) => {
        const spec = (0, outline_1.outlineItemToSpec)(item, themed, { ...opts, index: i });
        const laid = (0, layout_1.layoutDesign)(spec, size);
        return {
            ...laid,
            name: item.title || `Page ${i + 1}`,
            quality: (0, quality_1.qualityCheck)({ ...laid, size }),
        };
    });
    return { title: outline.title, pages };
}
