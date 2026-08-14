import type { Color } from "@hc/schema";
export type ExportFormat = "png" | "jpg" | "svg" | "pdf" | "pdfx" | "gif" | "apng" | "lottie";
export type ColorIntent = "rgb" | "cmyk";
export interface PageSelection {
    mode: "all" | "current" | "range";
    range?: number[];
}
export interface RasterOptions {
    transparent?: boolean;
    scale?: number;
    dpi?: number;
    jpgQuality?: number;
    matte?: Color;
}
export interface SvgOptions {
    keepEditable: boolean;
    embedRasters: boolean;
}
export interface PdfOptions {
    intent: ColorIntent;
    cmykProfile?: string;
    embedFonts: boolean;
    flattenTransparency?: boolean;
    bleedMm?: number;
    cropMarks?: boolean;
    trimMarks?: boolean;
    registrationMarks?: boolean;
    colorBars?: boolean;
}
export interface AnimatedOptions {
    fps: number;
    loop?: number;
    durationMs?: number;
}
export interface ExportRequest {
    designId: string;
    format: ExportFormat;
    pages: PageSelection;
    raster?: RasterOptions;
    svg?: SvgOptions;
    pdf?: PdfOptions;
    animated?: AnimatedOptions;
    filenameTemplate?: string;
}
export interface ExportPreset {
    id: string;
    name: string;
    scope: "user" | "workspace";
    request: Omit<ExportRequest, "designId">;
}
export interface ExportJob {
    id: string;
    designId: string;
    status: "queued" | "rendering" | "encoding" | "done" | "error";
    progress: number;
    outputs?: {
        url: string;
        bytes: number;
        page?: number;
        format: ExportFormat;
    }[];
    archiveUrl?: string;
    error?: {
        code: string;
        message: string;
    };
}
export interface PreflightReport {
    lowResImages: {
        nodeId: string;
        ppi: number;
    }[];
    outOfGamut: {
        nodeId: string;
        color: Color;
    }[];
    missingBleed: boolean;
    fontIssues: {
        fontId: string;
        reason: string;
    }[];
}
/** Formats that produce raster pixels (need dimension math). */
export declare const RASTER_FORMATS: ReadonlySet<ExportFormat>;
/** Formats that are print-grade and care about bleed / CMYK gamut. */
export declare const PRINT_FORMATS: ReadonlySet<ExportFormat>;
