"use strict";
// Raster output dimension math. A page's geometry is in
// design units at the design's source DPI; an export targets either a scale
// multiplier or an explicit DPI. Both resolve to the same pixel-size formula.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rasterDimensions = rasterDimensions;
/**
 * Compute the output pixel size for a page. `scale` takes precedence; otherwise
 * an explicit `dpi` is converted to a scale via the source DPI; otherwise 1x.
 * Dimensions are rounded to whole pixels.
 */
function rasterDimensions(page, opts = {}, sourceDpi = 96) {
    let scale;
    if (typeof opts.scale === "number" && opts.scale > 0) {
        scale = opts.scale;
    }
    else if (typeof opts.dpi === "number" && opts.dpi > 0) {
        scale = opts.dpi / sourceDpi;
    }
    else {
        scale = 1;
    }
    return {
        width: Math.max(1, Math.round(page.width * scale)),
        height: Math.max(1, Math.round(page.height * scale)),
        scale,
        dpi: scale * sourceDpi,
    };
}
