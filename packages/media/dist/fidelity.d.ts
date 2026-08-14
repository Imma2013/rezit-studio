import type { FidelityReport, ImportJob } from "./types";
export declare function createFidelityReport(pages?: number): FidelityReport;
export declare function addWarning(report: FidelityReport, code: string, message: string, page?: number): FidelityReport;
/** Record a font substitution once (deduped) and add a FONT_SUBSTITUTED warning. */
export declare function recordFontSubstitution(report: FidelityReport, fontFamily: string, page?: number): FidelityReport;
/** Record an unsupported feature once (deduped) and add a warning. */
export declare function recordUnsupported(report: FidelityReport, feature: string, page?: number): FidelityReport;
/** Merge a per-page report into an accumulator (e.g. combining page imports). */
export declare function mergeFidelity(into: FidelityReport, part: FidelityReport): FidelityReport;
/**
 * The terminal import status implied by a report: "succeeded" when nothing was
 * approximated, otherwise "partial" (the design imported, but with caveats).
 */
export declare function fidelityStatus(report: FidelityReport): Extract<ImportJob["status"], "succeeded" | "partial">;
