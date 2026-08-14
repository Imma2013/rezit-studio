import type { ExportFormat } from "./types";
export declare const DEFAULT_FILENAME_TEMPLATE = "{title}-{page}";
export interface FilenameVars {
    title: string;
    format: ExportFormat;
    /** Zero-based page index within the export. */
    index: number;
    /** Total pages in the export. */
    total: number;
}
/**
 * Render a filename from a template and variables. The extension for the format
 * is appended (never duplicated if the template already ends with it).
 */
export declare function applyFilenameTemplate(template: string, vars: FilenameVars): string;
