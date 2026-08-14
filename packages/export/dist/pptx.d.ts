import type { DesignFile } from "@hc/schema";
export interface PptxImage {
    data: Uint8Array;
    /** image/png or image/jpeg; anything else falls back to png extension. */
    mime: string;
}
export interface PptxRaster {
    png: Uint8Array;
    /** Placement in page px (the node's rendered bounds). */
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PptxOptions {
    /** Bytes for an ImageNode's asset. Null skips the image. */
    resolveImage?: (assetId: string) => Promise<PptxImage | null>;
    /** Rasterize a node PowerPoint can't express natively (charts, paths, ink,
     *  tables, ...). Null drops the node. Without the callback such nodes are
     *  skipped entirely - the export still succeeds, visibly degraded. */
    rasterizeNode?: (pageIndex: number, nodeId: string) => Promise<PptxRaster | null>;
    title?: string;
}
export declare function deckToPptx(file: DesignFile, opts?: PptxOptions): Promise<Uint8Array>;
