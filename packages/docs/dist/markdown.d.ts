import { type DocBlock, type RichText } from "./model";
/** Serialize a block list to GitHub-flavored markdown. */
export declare function blocksToMarkdown(blocks: DocBlock[]): string;
/**
 * Parse a single line of inline markdown into runs. Handles links, bold,
 * italic, strike, inline code, and <u> underline. The parser is intentionally
 * simple (no nested emphasis beyond one level) but round-trips the marks this
 * package emits.
 */
declare function parseInline(s: string): RichText;
/** Parse a markdown document into a block list (common subset). */
export declare function markdownToBlocks(md: string): DocBlock[];
export { parseInline as parseInlineMarkdown };
export declare function paragraphFromText(text: string): DocBlock;
