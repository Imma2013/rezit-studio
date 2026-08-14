"use strict";
// Resolve color-system colors to CSS color strings for the Canvas2D path. The
// Color's canonical sRGB is used on screen; explicit cmyk/spot drive print
// export. ICC soft-proofing is a render-time transform layered on later.
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorToCss = colorToCss;
exports.fillToCss = fillToCss;
function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
}
function rgba(r, g, b, a) {
    const c = (n) => Math.round(clamp01(n) * 255);
    return `rgba(${c(r)}, ${c(g)}, ${c(b)}, ${clamp01(a)})`;
}
function colorToCss(color) {
    const s = color.srgb;
    return rgba(s.r, s.g, s.b, s.a);
}
/** A flat CSS color for a fill (gradients fall back to a representative stop;
 *  real gradient/image painting is a GPU/2d-path enhancement). */
function fillToCss(fill) {
    switch (fill.type) {
        case "solid":
            return colorToCss(fill.color);
        case "gradient":
            if (fill.stops.length > 0)
                return colorToCss(fill.stops[0].color);
            if (fill.mesh && fill.mesh.points.length > 0)
                return colorToCss(fill.mesh.points[0].color);
            return "rgba(0, 0, 0, 0)";
        case "pattern":
        case "image":
            return "rgba(0, 0, 0, 0)"; // drawn as media/placeholder elsewhere
        default:
            return "rgba(0, 0, 0, 0)";
    }
}
