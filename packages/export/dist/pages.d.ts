import type { DesignFile } from "@hc/schema";
import type { PageSelection } from "./types";
export declare class ExportError extends Error {
    code: string;
    constructor(code: string, message: string);
}
/**
 * The ordered, de-duplicated list of page indices an export should cover.
 * Throws `ExportError` when the design has no pages or a range index is out of
 * bounds.
 */
export declare function resolvePages(file: DesignFile, selection: PageSelection, currentPage?: number): number[];
