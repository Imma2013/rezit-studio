import type { Color, DesignFile } from "@hc/schema";
import type { BrandLintViolation, LintBrandKit } from "./types";
/** Max perceptual deltaE for a color to count as "matching" a brand swatch.
 *  Mirrors the slice-A locked-save tolerance so lint and the persist gate agree
 *  (below the just-noticeable-difference threshold). */
export declare const COLOR_TOLERANCE = 2;
/** Hex for a color (alpha dropped), for messages + fix `from`. */
declare function hexOf(c: Color): string;
/** Every approved color in the kit, flattened. */
export declare function kitColors(kit: LintBrandKit): Color[];
/** Lowercased approved font families (for case-insensitive matching). */
export declare function kitFontFamilies(kit: LintBrandKit): Set<string>;
/**
 * Lint a design against a brand kit (FR-7). Returns every violation found, each
 * with a stable id and (where safe) an applyable fix. An on-brand design returns
 * `[]`. Color/font checks only run when the matching lock is on AND the kit
 * actually defines a constraint (an empty palette/font set cannot constrain, so
 * it is treated as "no rule" rather than rejecting everything). Contrast, logo,
 * and spacing checks always run when the kit is present (they are advisory).
 */
export declare function lintDesign(file: DesignFile, kit: LintBrandKit): BrandLintViolation[];
export { hexOf };
