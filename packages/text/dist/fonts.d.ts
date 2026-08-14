export type FontCategory = "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
export interface FontCatalogEntry {
    family: string;
    category: FontCategory;
    /** Selectable weights (numeric). */
    weights: number[];
    /** Whether the family ships italic faces. */
    italics?: boolean;
    /** Variable font with continuous axes (FR-6). */
    variable?: boolean;
    /** System stack rather than a downloadable web font. */
    system?: boolean;
}
/**
 * Built-in font library: the system stack, then the featured families (in
 * FEATURED_ORDER), then the rest of the full open-source library (Bunny's mirror
 * of Google Fonts, ~2k families) alphabetically. Metadata is bundled so search
 * works offline with no API key; each family's web font is fetched on demand from
 * the configured provider (Bunny) when it is previewed or applied.
 */
export declare const FONT_CATALOG: FontCatalogEntry[];
/** True for the system stack (no web font to load). */
export declare function isSystemFont(family: string | undefined): boolean;
/** Catalog entry for a family (case-insensitive), or undefined. */
export declare function getFontEntry(family: string): FontCatalogEntry | undefined;
/** Search the catalog by free text and optional category, ranked by prefix. */
export declare function searchFonts(query?: string, category?: FontCategory): FontCatalogEntry[];
declare const FONT_CSS_HOSTS: {
    readonly bunny: "https://fonts.bunny.net/css2";
    readonly google: "https://fonts.googleapis.com/css2";
};
export type FontCssProvider = keyof typeof FONT_CSS_HOSTS;
/** Switch the webfont CSS source ("bunny" default, or "google"). */
export declare function setFontCssProvider(provider: FontCssProvider): void;
/**
 * Webfont CSS URL to load a family's selected weights (and italics when
 * available), from the configured provider (Bunny by default, Google
 * optional; the CSS2 request syntax is identical on both). The browser
 * provider injects this as a stylesheet, then waits for the face via the CSS
 * Font Loading API. Empty string for system/unknown families.
 */
export declare function fontCssUrl(family: string, weights?: number[]): string;
/** @deprecated use fontCssUrl; kept so existing imports keep compiling. */
export declare const googleFontsCssUrl: typeof fontCssUrl;
export {};
