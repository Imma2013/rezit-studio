export type TextMark = "bold" | "italic" | "underline" | "strike" | "code" | {
    color: string;
};
export interface TextRun {
    text: string;
    marks?: TextMark[];
    link?: string;
}
export interface RichText {
    runs: TextRun[];
}
export type DocBlockType = "paragraph" | "heading" | "list" | "quote" | "code" | "divider" | "image" | "chartEmbed" | "table" | "callout" | "embed";
export interface DocBlockBase {
    id: string;
    type: DocBlockType;
}
export interface ParagraphBlock extends DocBlockBase {
    type: "paragraph";
    text: RichText;
}
export interface HeadingBlock extends DocBlockBase {
    type: "heading";
    level: 1 | 2 | 3;
    text: RichText;
}
export interface ListItem {
    id: string;
    text: RichText;
    checked?: boolean;
    depth: number;
}
export interface ListBlock extends DocBlockBase {
    type: "list";
    style: "bullet" | "numbered" | "checklist";
    items: ListItem[];
}
export interface QuoteBlock extends DocBlockBase {
    type: "quote";
    text: RichText;
}
export interface CodeBlock extends DocBlockBase {
    type: "code";
    language?: string;
    code: string;
}
export interface DividerBlock extends DocBlockBase {
    type: "divider";
}
export interface ImageBlock extends DocBlockBase {
    type: "image";
    assetId: string;
    url: string;
    caption?: RichText;
    alt?: string;
}
export interface ChartEmbedBlock extends DocBlockBase {
    type: "chartEmbed";
    chartId: string;
}
export interface TableColumn {
    align: "left" | "center" | "right";
}
export interface TableRow {
    id: string;
    cells: RichText[];
}
export interface TableBlock extends DocBlockBase {
    type: "table";
    headerRow: boolean;
    columns: TableColumn[];
    rows: TableRow[];
}
export interface CalloutBlock extends DocBlockBase {
    type: "callout";
    icon?: string;
    tone: "info" | "warn" | "success";
    text: RichText;
}
export interface EmbedBlock extends DocBlockBase {
    type: "embed";
    url: string;
    provider?: string;
}
export type DocBlock = ParagraphBlock | HeadingBlock | ListBlock | QuoteBlock | CodeBlock | DividerBlock | ImageBlock | ChartEmbedBlock | TableBlock | CalloutBlock | EmbedBlock;
/** doc-kind meta extension stored on `DesignFile.meta`. */
export interface DocMeta {
    kind: "doc";
    blockOrder: string[];
}
/**
 * Fresh block/item id. Reuses @hc/schema's `newId` (UUID v4) so doc ids are
 * consistent with the rest of the open format. The optional `seed` produces a
 * deterministic id, which keeps tests stable when desired.
 */
export declare function newId(seed?: string | number): string;
/** Concatenate all run text into a single plain string. */
export declare function richTextToPlain(rt: RichText): string;
/** Wrap a plain string as a single unstyled run. */
export declare function plainToRichText(s: string): RichText;
export declare function newParagraph(text?: RichText | string): ParagraphBlock;
export declare function newHeading(level: 1 | 2 | 3, text?: RichText | string): HeadingBlock;
export declare function newList(style?: ListBlock["style"], items?: ListItem[]): ListBlock;
export declare function newListItem(text?: RichText | string, depth?: number): ListItem;
export declare function newQuote(text?: RichText | string): QuoteBlock;
export declare function newCode(code?: string, language?: string): CodeBlock;
export declare function newDivider(): DividerBlock;
export declare function newImage(init: {
    assetId?: string;
    url: string;
    caption?: RichText;
    alt?: string;
}): ImageBlock;
export declare function newChartEmbed(chartId: string): ChartEmbedBlock;
export declare function newTable(columns?: TableColumn[], rows?: TableRow[], headerRow?: boolean): TableBlock;
export declare function newTableRow(cells?: RichText[]): TableRow;
export declare function newCallout(tone?: CalloutBlock["tone"], text?: RichText | string, icon?: string): CalloutBlock;
export declare function newEmbed(url: string, provider?: string): EmbedBlock;
/**
 * Convert a block between compatible text block types, preserving text.
 * Supports paragraph <-> heading <-> quote <-> callout and list <-> paragraph
 * (by joining lines into one paragraph, or splitting paragraph lines into list
 * items). The block id is preserved across conversion.
 */
export declare function convertBlock(block: DocBlock, toType: DocBlockType): DocBlock;
/** Pure array move: return a new order with the item at `fromIndex` moved to
 *  `toIndex`. Out-of-range indices are clamped; the input is not mutated. */
export declare function reorderBlocks(order: string[], fromIndex: number, toIndex: number): string[];
