export declare function graphemes(text: string, locale?: string): string[];
/** Count of grapheme clusters (the user-perceived character count). */
export declare function graphemeCount(text: string, locale?: string): number;
/** Word-like segments (excludes whitespace/punctuation-only segments). */
export declare function words(text: string, locale?: string): string[];
export interface WrapChunk {
    text: string;
    /** True for whitespace-only chunks (collapsible at a line break). */
    whitespace: boolean;
}
/**
 * Split text into chunks at word boundaries for line breaking: each word-like
 * segment and each run of trailing whitespace becomes a chunk, so a line break
 * may occur between any two chunks.
 */
export declare function wrapChunks(text: string, locale?: string): WrapChunk[];
