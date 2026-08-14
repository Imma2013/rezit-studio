import type { CharStyle, Paragraph, TextNode } from "@hc/schema";
/** Plain text of a node: runs concatenated, paragraphs joined by newlines. */
export declare function getPlainText(node: TextNode): string;
export declare function getParagraphText(p: Paragraph): string;
export interface FindQuery {
    text: string;
    caseSensitive?: boolean;
    wholeWord?: boolean;
    regex?: boolean;
}
export interface Match {
    paragraph: number;
    start: number;
    end: number;
    text: string;
}
/** All matches across the node's paragraphs (matches do not cross paragraphs). */
export declare function findMatches(node: TextNode, q: FindQuery): Match[];
/**
 * Replace all matches with `replacement`, mutating the node in place. Replacement
 * text takes the character style at each match start. Returns the match count.
 */
export declare function replaceAll(node: TextNode, q: FindQuery, replacement: string): number;
/** Apply a character-style patch to a [start, end) range of a paragraph. */
export declare function applyCharToRange(node: TextNode, paragraphIndex: number, start: number, end: number, patch: Partial<CharStyle>): void;
