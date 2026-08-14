import type { Color } from "@hc/schema";
export type Rgb = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export type Hsl = {
    h: number;
    s: number;
    l: number;
    a: number;
};
export type Cmyk = {
    c: number;
    m: number;
    y: number;
    k: number;
};
/** Clamp n into [0,1]. */
export declare function clamp01(n: number): number;
/** Build a canonical Color from sRGB channels (0..1). */
export declare function color(r: number, g: number, b: number, a?: number): Color;
/** Parse a HEX string to a Color, or null if malformed. */
export declare function fromHex(s: string): Color | null;
/**
 * Format a Color as a HEX string. Includes the alpha byte only when the color
 * is not fully opaque. Always lowercase, always with a leading `#`.
 */
export declare function toHex(c: Color): string;
/** Convert sRGB (0..1) to HSL (h 0..360). */
export declare function rgbToHsl(c: Color): Hsl;
/** Convert HSL (h 0..360) to a Color. */
export declare function hslToRgb(hsl: Hsl): Color;
/**
 * Convert a Color to CMYK. Returns the device-naive conversion. If the color
 * carries explicit `cmyk` data it is authoritative and returned verbatim.
 */
export declare function rgbToCmyk(c: Color, _profile?: string): Cmyk;
/**
 * Convert CMYK to a Color, preserving the source CMYK as authoritative print
 * data on the result (so a round trip through sRGB does not lose it).
 */
export declare function cmykToRgb(cmyk: Cmyk, _profile?: string): Color;
