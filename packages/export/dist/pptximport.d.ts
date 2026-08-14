import type { DesignFile } from "@hc/schema";
/** Parse .pptx bytes into an editable DesignFile. Embedded images become
 *  self-contained data: URL assets, so the file opens anywhere. */
export declare function pptxToDesign(bytes: Uint8Array, opts?: {
    title?: string;
}): Promise<DesignFile>;
