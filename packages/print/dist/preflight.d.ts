import { type DesignFile } from "@hc/schema";
import { type PreflightReport } from "@hc/export";
import { type PreflightCheck, type PreflightCode, type PreflightLevel, type PreflightResult, type PrintProduct } from "./types";
export interface PrintPreflightOptions {
    /** Page index within the design that maps to the product (default 0). */
    pageIndex?: number;
    /** ISO timestamp for `ranAt`; defaults to a fixed empty string for determinism. */
    ranAt?: string;
    /** Inject a pre-computed export report (tests / caching). Otherwise computed. */
    exportReport?: PreflightReport;
}
/**
 * Run print pre-flight for `design` against `product`/`sizeId`. Pure: no I/O.
 */
export declare function runPrintPreflight(design: DesignFile, product: PrintProduct, sizeId: string, opts?: PrintPreflightOptions): PreflightResult;
/** error if any error, else warn if any warn, else pass. */
export declare function aggregateStatus(checks: PreflightCheck[]): PreflightLevel;
export interface GateResult {
    /** True when nothing blocks ordering: no un-overridden errors and all warnings
     *  acknowledged. */
    canOrder: boolean;
    /** Checks currently blocking the order (errors not overridden, or warnings not
     *  acknowledged). */
    blocking: PreflightCheck[];
    /** Errors that were overridden (overridable + present in `overrides`). */
    acknowledged: PreflightCheck[];
}
/**
 * Gate ordering on a pre-flight result (FR-6). Errors block unless the check is
 * `overridable` and its code is in `overrides`. Warnings are non-blocking but
 * require acknowledgment (their code present in `overrides`). Pass checks never
 * block. A non-overridable error always blocks regardless of `overrides`.
 */
export declare function evaluateGate(result: PreflightResult, overrides?: Set<PreflightCode>): GateResult;
