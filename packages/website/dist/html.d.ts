import type { Color, Fill } from "@hc/schema";
/** Escape text for safe insertion into HTML element content. */
export declare function escapeHtml(s: string): string;
/** Escape a string for use inside a double-quoted HTML attribute. */
export declare function escapeAttr(s: string): string;
/**
 * Sanitize a URL destined for an href/src so it cannot smuggle script.
 * Strips control characters and whitespace, then allows only a safe scheme
 * set: http, https, mailto, tel; relative paths (starting with `/`, `./`,
 * `../`); and pure in-page anchors (`#...`). Protocol-relative `//host` is
 * rejected (treated as unsafe). Anything else (javascript:, data:, vbscript:,
 * file:, etc.) collapses to `"#"`. The returned value still must be passed
 * through `escapeAttr` before placing it in an attribute.
 */
export declare function safeUrl(url: string | undefined): string;
/**
 * Sanitize a font-family name for embedding inside a CSS declaration that is
 * itself placed in a double-quoted `style="..."` attribute. Strips characters
 * that could break out of the single-quoted CSS string or the declaration:
 * quotes, angle brackets, semicolons, braces, backslashes, and newlines.
 * Returns `'<clean>', sans-serif`, or plain `sans-serif` when empty.
 */
export declare function cssFontFamily(name?: string): string;
/** Canonical sRGB to a CSS rgba() string (mirrors engine `colorToCss`). */
export declare function colorToCss(color: Color): string;
/** A CSS `background` value for a fill. Solid -> rgba; linear/radial/conic ->
 *  a real CSS gradient; pattern/image -> transparent (drawn as <img>/asset). */
export declare function fillToCss(fill: Fill | undefined): string;
/** Serialize a style object to a CSS declaration string, skipping empty values.
 *  Defense-in-depth: a double-quote in any value would close the surrounding
 *  `style="..."` attribute, so quotes are stripped from serialized values. */
export declare function style(props: Record<string, string | number | undefined | null>): string;
