import type { ExportPreset, ExportRequest } from "./types";
/** Build a preset from a concrete request by dropping its `designId`. */
export declare function toPreset(request: ExportRequest, meta: {
    id: string;
    name: string;
    scope: "user" | "workspace";
}): ExportPreset;
/** Apply a preset to a design, reproducing every stored setting (AC-7). */
export declare function applyPreset(preset: ExportPreset, designId: string): ExportRequest;
