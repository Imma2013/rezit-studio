"use strict";
// Default categorical palette for chart series. A small, accessible,
// distinguishable qualitative scheme returned as canonical `Color`s. Pure and
// deterministic so charts seed the same default colors everywhere.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERIES_PALETTE_HEX = void 0;
exports.seriesPalette = seriesPalette;
exports.seriesColorAt = seriesColorAt;
const convert_1 = require("./convert");
/** Ordered qualitative swatches (hex), tuned for legibility on light surfaces. */
exports.SERIES_PALETTE_HEX = [
    "#6366f1", // indigo
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#3b82f6", // blue
    "#ec4899", // pink
    "#14b8a6", // teal
    "#8b5cf6", // violet
];
/** The default series palette as `Color`s, cycling when `count` exceeds the
 *  base scheme so any number of series gets a distinct-as-possible color. */
function seriesPalette(count) {
    const out = [];
    for (let i = 0; i < Math.max(0, count); i++) {
        const c = (0, convert_1.fromHex)(exports.SERIES_PALETTE_HEX[i % exports.SERIES_PALETTE_HEX.length]);
        if (c)
            out.push(c);
    }
    return out;
}
/** The default color for the series at `index` (cycles through the palette). */
function seriesColorAt(index) {
    return (0, convert_1.fromHex)(exports.SERIES_PALETTE_HEX[((index % exports.SERIES_PALETTE_HEX.length) + exports.SERIES_PALETTE_HEX.length) % exports.SERIES_PALETTE_HEX.length]);
}
