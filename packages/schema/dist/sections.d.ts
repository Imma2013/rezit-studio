import type { DesignFile, Page, SlideSection } from "./schema";
/** A contiguous run of slides sharing a section (or the unsectioned run). */
export interface SectionGroup {
    /** The section, or undefined for slides that belong to none. */
    section?: SlideSection;
    /** Page indices in deck order. */
    pageIndices: number[];
}
/** The section a page belongs to, or undefined (no id, or a dangling one). */
export declare function sectionForPage(file: DesignFile, page: Page): SlideSection | undefined;
/**
 * Group the deck into consecutive runs.
 *
 * Slides before the first section (or between sections) form an unsectioned
 * group, so every page appears exactly once and nothing is ever hidden. A
 * dangling `sectionId` (its section was deleted) is treated as unsectioned.
 */
export declare function groupPagesBySection(file: DesignFile): SectionGroup[];
/** Page indices belonging to a section, in deck order (may be non-contiguous). */
export declare function pagesInSection(file: DesignFile, sectionId: string): number[];
/** True when the section is collapsed in the slide bar / overview. */
export declare function isSectionCollapsed(file: DesignFile, sectionId: string | undefined): boolean;
/**
 * The slide a section-aware "next section" jump should land on, or -1.
 *
 * Present navigation is section-aware (FR-5): from anywhere inside a section,
 * this returns the first slide of the following group, skipping the rest of the
 * current one. Hidden slides are the caller's concern (present mode already
 * skips them), so this stays a pure structural query.
 */
export declare function nextSectionStart(file: DesignFile, fromPageIndex: number): number;
/** The first slide of the previous group, or -1. */
export declare function prevSectionStart(file: DesignFile, fromPageIndex: number): number;
/** A section's title for display: its name, else a positional fallback. */
export declare function sectionTitle(section: SlideSection | undefined, groupIndex: number): string;
