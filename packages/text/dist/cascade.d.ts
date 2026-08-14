import type { CharStyle, Paragraph, ParagraphStyle, Run, TextStyleSheet } from "@hc/schema";
/** Effective character style for a run within a paragraph. */
export declare function resolveCharStyle(run: Run, paragraph?: Paragraph, sheet?: TextStyleSheet): CharStyle;
/** Effective paragraph style. */
export declare function resolveParagraphStyle(paragraph: Paragraph, sheet?: TextStyleSheet): ParagraphStyle;
