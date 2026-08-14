"use strict";
// Canvas font helpers: turn a rich-text CharStyle into a Canvas2D `font` string,
// a family stack, line advance, and case transform, so on-canvas text uses the
// chosen typeface, weight, and style. Font FILES are loaded by the host
// (browser FontFace / font provider); here we only name the family with a
// sensible fallback so text still renders before the real face arrives.
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontFamilyStack = fontFamilyStack;
exports.weightFromFontStyle = weightFromFontStyle;
exports.canvasFontString = canvasFontString;
exports.resolveLineAdvance = resolveLineAdvance;
exports.applyTextCase = applyTextCase;
const SYSTEM_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const NAMED_WEIGHTS = {
    thin: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    book: 400,
    regular: 400,
    normal: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
};
/** CSS font-family stack for a family name, with a system fallback. */
function fontFamilyStack(family) {
    if (!family || family.toLowerCase() === "system")
        return SYSTEM_STACK;
    return `"${family}", ${SYSTEM_STACK}`;
}
/** Numeric weight from a named style ("SemiBold" -> 600), default 400. */
function weightFromFontStyle(fontStyle) {
    if (!fontStyle)
        return 400;
    const key = fontStyle.toLowerCase().replace(/italic|oblique|\s+/g, "");
    return NAMED_WEIGHTS[key] ?? 400;
}
// Map a variable-font width axis (wdth, ~50..200 where 100 is normal) to the
// nearest CSS font-stretch keyword, which the Canvas2D `font` shorthand accepts
// and the browser applies to a variable font's wdth axis. Static fonts ignore it.
function widthKeyword(wdth) {
    const stops = [
        [50, "ultra-condensed"], [62.5, "extra-condensed"], [75, "condensed"],
        [87.5, "semi-condensed"], [100, "normal"], [112.5, "semi-expanded"],
        [125, "expanded"], [150, "extra-expanded"], [200, "ultra-expanded"],
    ];
    let best = stops[4];
    for (const s of stops)
        if (Math.abs(s[0] - wdth) < Math.abs(best[0] - wdth))
            best = s;
    return best[1];
}
/** A Canvas2D `font` string (e.g. `italic small-caps 600 condensed 24px "Inter"`).
 *  Applies variable-font axes that Canvas2D can express: wght (weight), wdth
 *  (font-stretch keyword), and ital/slnt (italic). Other axes need the GPU path. */
function canvasFontString(style) {
    const size = style.fontSize;
    const weight = style.axes?.wght ?? weightFromFontStyle(style.fontStyle);
    const italicByAxis = (style.axes?.ital ?? 0) >= 0.5 || (style.axes?.slnt ?? 0) < 0;
    const italic = italicByAxis || /italic|oblique/i.test(style.fontStyle ?? "") ? "italic " : "";
    // Small caps render via the font-variant slot of the canvas `font` shorthand.
    const variant = style.case === "smallcaps" ? "small-caps " : "";
    const wdth = style.axes?.wdth;
    const stretch = typeof wdth === "number" && wdth !== 100 ? `${widthKeyword(wdth)} ` : "";
    return `${italic}${variant}${weight} ${stretch}${size}px ${fontFamilyStack(style.fontFamily)}`;
}
/** Resolve a line advance in px from a CharStyle lineHeight (default 1.2x). */
function resolveLineAdvance(size, lineHeight) {
    if (lineHeight == null)
        return size * 1.2;
    if (typeof lineHeight === "number")
        return size * lineHeight;
    if (lineHeight.mode === "absolute")
        return lineHeight.value;
    if (lineHeight.mode === "multiple")
        return size * lineHeight.value;
    return size * 1.2; // auto
}
/** Apply a case transform to display text. */
function applyTextCase(text, textCase) {
    switch (textCase) {
        case "upper":
            return text.toUpperCase();
        case "lower":
            return text.toLowerCase();
        case "title":
            return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
        default:
            return text;
    }
}
