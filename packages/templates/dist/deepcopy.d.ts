import { type DesignFile } from "@hc/schema";
export interface DeepCopyResult {
    file: DesignFile;
    /** old node/page id -> new id, so external references (fillable fields) remap. */
    idMap: Map<string, string>;
}
export interface DeepCopyOptions {
    designId?: string;
    idGen?: () => string;
}
/** Deep-copy a design, regenerating the design id, page ids, and all node ids. */
export declare function deepCopyDesign(file: DesignFile, opts?: DeepCopyOptions): DeepCopyResult;
