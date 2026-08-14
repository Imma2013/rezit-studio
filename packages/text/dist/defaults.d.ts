import type { CharStyle, Color, Fill, Paragraph, ParagraphStyle, Run } from "@hc/schema";
export declare const BLACK: Color;
export declare const SOLID_BLACK: Fill;
export declare const DEFAULT_CHAR_STYLE: CharStyle;
export declare const DEFAULT_PARAGRAPH_STYLE: ParagraphStyle;
export declare function createRun(text: string, style?: Partial<CharStyle>): Run;
export declare function createParagraph(text?: string, charStyle?: Partial<CharStyle>, paraStyle?: Partial<ParagraphStyle>): Paragraph;
/** Content for a new text node from a plain string (one paragraph per line). */
export declare function contentFromText(text: string, charStyle?: Partial<CharStyle>): Paragraph[];
