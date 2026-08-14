import type { Color, ColorSwatch, DesignFile, Fill, Page, Placeholder, SlideLayout, SlideMaster, Theme } from "./schema";
/** The layout a page inherits from, or undefined when it stands alone (no
 *  `layoutId`, or one that dangles because the layout was deleted). */
export declare function layoutForPage(file: DesignFile, page: Page): SlideLayout | undefined;
/** The master behind a layout, or undefined when the reference dangles. */
export declare function masterForLayout(file: DesignFile, layout: SlideLayout | undefined): SlideMaster | undefined;
/** The theme in effect for a page: the master's named theme when it resolves,
 *  else the file theme. */
export declare function themeForPage(file: DesignFile, page: Page): Theme | undefined;
/** Placeholders a page inherits: the master's, with the layout's overriding by
 *  `id` and appended when new. Keyed by id, not role, because a layout may
 *  legitimately declare several of a role (two-content has two `content`
 *  regions). A page with no layout inherits none, the pre-master behavior. */
export declare function placeholdersForPage(file: DesignFile, page: Page): Placeholder[];
/** The resolved style for rendering a page: its own background when set, else
 *  the layout's, else the master's. */
export declare function resolvePageStyle(file: DesignFile, page: Page): {
    background?: Fill;
    placeholders: Placeholder[];
};
/** The title placeholder for a page, if its layout declares one. Its presence
 *  is what guarantees a real, screen-reader-navigable slide title (FR-3). */
export declare function titlePlaceholder(file: DesignFile, page: Page): Placeholder | undefined;
/** A page's accessible title: its name, else the deck position. Never empty, so
 *  an exported deck always has per-slide titles (FR-29). */
export declare function slideTitle(page: Page, index: number): string;
/** Look up a theme color slot by index; undefined when out of range. */
export declare function themeColor(theme: Theme | undefined, slot: number): Color | undefined;
/**
 * Adopt `theme` for the whole deck (FR-4).
 *
 * Purely a file-level swap: the theme record is replaced and every master that
 * named the OLD theme is repointed at the new one, so the cascade keeps
 * resolving. Page content is untouched (recoloring individual nodes is the
 * separate "re-skin" operation the Brand panel already owns), which is what
 * keeps this a safe, reversible, single undo step.
 */
export declare function applyTheme(file: DesignFile, theme: Theme): DesignFile;
/** A theme's variant as a full theme (variants only override the palette). */
export declare function themeVariant(theme: Theme, variantId: string): Theme | undefined;
/** Build a theme from a flat palette + font pair, so a deck that predates the
 *  theme record (or a brand kit) can adopt one without hand-authoring it. */
export declare function themeFromPalette(id: string, colors: ColorSwatch[], opts?: {
    name?: string;
    fontHeading?: string;
    fontBody?: string;
}): Theme;
export declare const BUILTIN_MASTER_ID = "master-default";
/** The default master + the five built-in layouts PowerPoint users expect
 *  (title, title+content, two-content, comparison, picture). Sized to `page`,
 *  so a 16:9 deck and an A4 deck both get sane placeholder rects. */
export declare function builtinMasterAndLayouts(page: {
    width: number;
    height: number;
}): {
    master: SlideMaster;
    layouts: SlideLayout[];
};
