import { type DesignFile } from "@hc/schema";
import { type DocBlock } from "./model";
export interface BlocksToDesignOptions {
    splitLevel?: 1 | 2 | 3;
    pageWidth?: number;
    pageHeight?: number;
}
/**
 * Convert a doc's blocks into a DesignFile. Content splits into a new page at
 * each heading whose level equals `splitLevel` (default 1); blocks within a
 * section stack vertically with a running y offset and a left margin.
 */
export declare function blocksToDesign(blocks: DocBlock[], opts?: BlocksToDesignOptions): DesignFile;
/** Best-effort reverse: turn a design's scene nodes into doc blocks. */
export declare function designToDoc(design: DesignFile): DocBlock[];
