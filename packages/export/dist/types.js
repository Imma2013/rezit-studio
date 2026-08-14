"use strict";
// Export engine data model. These types describe an export
// request, presets, jobs, and the pre-flight report. The pure core in this
// package operates on a DesignFile and produces SVG, dimensions, page
// lists, filenames, presets, and pre-flight results. Binary encoding (PNG/JPG/
// PDF/GIF), job execution, REST, and realtime are the runtime/worker layer.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRINT_FORMATS = exports.RASTER_FORMATS = void 0;
/** Formats that produce raster pixels (need dimension math). */
exports.RASTER_FORMATS = new Set(["png", "jpg", "gif", "apng"]);
/** Formats that are print-grade and care about bleed / CMYK gamut. */
exports.PRINT_FORMATS = new Set(["pdfx"]);
