import type { DocBlock } from "./model";
export interface OutlineEntry {
    id: string;
    level: 1 | 2 | 3;
    text: string;
    /** URL-safe anchor slug derived from the heading text. */
    slug: string;
}
/** Extract the heading outline (TOC) in document order. */
export declare function docOutline(blocks: DocBlock[]): OutlineEntry[];
/** All plain text contained in a block (paragraphs, list items, table cells,
 *  captions, code), used for counting. */
export declare function blockText(block: DocBlock): string;
export interface DocStats {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    blocks: number;
    headings: number;
    /** Estimated reading time in minutes (>= 1 for any content) at 200 wpm. */
    readingMinutes: number;
}
/** Aggregate word/character counts and reading time across a document. */
export declare function docStats(blocks: DocBlock[], wordsPerMinute?: number): DocStats;
