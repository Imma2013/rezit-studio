"use strict";
// Fidelity report construction for source import. An
// importer records every approximation (font substitution, unsupported feature)
// so the user sees exactly what changed, never a silent visual difference.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFidelityReport = createFidelityReport;
exports.addWarning = addWarning;
exports.recordFontSubstitution = recordFontSubstitution;
exports.recordUnsupported = recordUnsupported;
exports.mergeFidelity = mergeFidelity;
exports.fidelityStatus = fidelityStatus;
function createFidelityReport(pages = 0) {
    return { pages, warnings: [], fontsSubstituted: [], unsupportedFeatures: [] };
}
function addWarning(report, code, message, page) {
    report.warnings.push(page === undefined ? { code, message } : { page, code, message });
    return report;
}
/** Record a font substitution once (deduped) and add a FONT_SUBSTITUTED warning. */
function recordFontSubstitution(report, fontFamily, page) {
    if (!report.fontsSubstituted.includes(fontFamily))
        report.fontsSubstituted.push(fontFamily);
    return addWarning(report, "FONT_SUBSTITUTED", `font "${fontFamily}" was substituted`, page);
}
/** Record an unsupported feature once (deduped) and add a warning. */
function recordUnsupported(report, feature, page) {
    if (!report.unsupportedFeatures.includes(feature))
        report.unsupportedFeatures.push(feature);
    return addWarning(report, "UNSUPPORTED_FEATURE", `unsupported feature: ${feature}`, page);
}
/** Merge a per-page report into an accumulator (e.g. combining page imports). */
function mergeFidelity(into, part) {
    into.pages += part.pages;
    into.warnings.push(...part.warnings);
    for (const f of part.fontsSubstituted)
        if (!into.fontsSubstituted.includes(f))
            into.fontsSubstituted.push(f);
    for (const u of part.unsupportedFeatures)
        if (!into.unsupportedFeatures.includes(u))
            into.unsupportedFeatures.push(u);
    return into;
}
/**
 * The terminal import status implied by a report: "succeeded" when nothing was
 * approximated, otherwise "partial" (the design imported, but with caveats).
 */
function fidelityStatus(report) {
    const clean = report.warnings.length === 0 && report.fontsSubstituted.length === 0 && report.unsupportedFeatures.length === 0;
    return clean ? "succeeded" : "partial";
}
