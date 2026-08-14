import type { Color } from "@hc/schema";
export type HarmonyScheme = "complementary" | "analogous" | "triadic" | "tetradic" | "split-complementary" | "monochromatic";
export declare const HARMONY_SCHEMES: HarmonyScheme[];
/** Colors harmonious with `base` for the given scheme, base first. */
export declare function colorHarmony(base: Color, scheme: HarmonyScheme): Color[];
