import type { Color } from "@hc/schema";
export interface GamutResult {
    inGamut: boolean;
    /** Nearest reproducible color when out of gamut; omitted when already in gamut. */
    nearest?: Color;
}
/**
 * Check whether `c` is reproducible in `cmykProfile`. A color is considered in
 * gamut when the sRGB -> CMYK -> sRGB round trip returns (within tolerance) the
 * same color. The round-tripped color is the nearest in-gamut suggestion.
 */
export declare function gamutCheck(c: Color, cmykProfile?: string, tolerance?: number): GamutResult;
