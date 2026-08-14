"use strict";
// Resolve a PageSelection to concrete page indices, validating against the
// design (out-of-range indices error before queuing, Section 9).
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportError = void 0;
exports.resolvePages = resolvePages;
class ExportError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "ExportError";
    }
}
exports.ExportError = ExportError;
/**
 * The ordered, de-duplicated list of page indices an export should cover.
 * Throws `ExportError` when the design has no pages or a range index is out of
 * bounds.
 */
function resolvePages(file, selection, currentPage = 0) {
    const n = file.pages.length;
    if (n === 0)
        throw new ExportError("no-pages", "design has no pages to export");
    switch (selection.mode) {
        case "all":
            return Array.from({ length: n }, (_, i) => i);
        case "current": {
            if (currentPage < 0 || currentPage >= n) {
                throw new ExportError("page-out-of-range", `current page ${currentPage} is out of range`);
            }
            return [currentPage];
        }
        case "range": {
            const range = selection.range ?? [];
            if (range.length === 0)
                throw new ExportError("empty-range", "range selection has no pages");
            for (const i of range) {
                if (!Number.isInteger(i) || i < 0 || i >= n) {
                    throw new ExportError("page-out-of-range", `page index ${i} is out of range (0..${n - 1})`);
                }
            }
            // De-duplicate while preserving the requested order.
            return [...new Set(range)];
        }
    }
}
