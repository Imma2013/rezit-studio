import type { Color } from "@hc/schema";
export type CvdType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
/** Row-major 3x3 matrices mapping (r,g,b) -> simulated (r,g,b). */
export declare const CVD_MATRICES: Record<CvdType, readonly [number, number, number, number, number, number, number, number, number]>;
/** Apply a CVD transform to a single color (preview only; non-destructive). */
export declare function simulateCvd(c: Color, type: CvdType): Color;
