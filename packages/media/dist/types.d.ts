export type AssetKind = "image" | "vector" | "gif" | "video" | "audio" | "font" | "model3d" | "document" | "source";
export type AssetStatus = "queued" | "uploading" | "scanning" | "processing" | "ready" | "failed" | "trashed";
export interface AssetTag {
    value: string;
    source: "user" | "ai";
    confidence?: number;
}
export interface AssetMeta {
    width?: number;
    height?: number;
    durationMs?: number;
    pageCount?: number;
    colorProfile?: "sRGB" | "Display P3" | "CMYK" | "unknown";
    dominantColors?: string[];
    exif?: Record<string, string | number>;
    altText?: string;
    font?: {
        family: string;
        style: string;
        weight: number;
        variableAxes?: string[];
    };
    hasAlpha?: boolean;
    fps?: number;
}
export interface Asset {
    id: string;
    workspaceId: string;
    ownerId: string;
    kind: AssetKind;
    status: AssetStatus;
    name: string;
    mimeType: string;
    byteSize: number;
    storageKey: string;
    checksum: string;
    perceptualHash?: string;
    embeddingId?: string;
    folderId?: string | null;
    tags: AssetTag[];
    favorite: boolean;
    meta: AssetMeta;
    currentVersionId: string;
    createdAt: string;
    updatedAt: string;
    trashedAt?: string | null;
}
export interface AssetVersion {
    id: string;
    assetId: string;
    storageKey: string;
    byteSize: number;
    checksum: string;
    createdAt: string;
    authorId: string;
    note?: string;
}
export interface Folder {
    id: string;
    workspaceId: string;
    parentId?: string | null;
    name: string;
    createdAt: string;
}
export interface FidelityReport {
    pages: number;
    warnings: Array<{
        page?: number;
        code: string;
        message: string;
    }>;
    fontsSubstituted: string[];
    unsupportedFeatures: string[];
}
export type ImportFormat = "pdf" | "pptx" | "docx" | "psd" | "ai" | "figma" | "svg";
export interface ImportJob {
    id: string;
    sourceAssetId: string;
    sourceFormat: ImportFormat;
    status: "queued" | "running" | "succeeded" | "partial" | "failed";
    progress: number;
    resultDesignId?: string;
    fidelity: FidelityReport;
    error?: string;
}
/** Storage quota state for a workspace (FR-11). */
export interface StorageUsage {
    usedBytes: number;
    quotaBytes: number;
    byKind: Partial<Record<AssetKind, number>>;
}
/** Combined search query (FR-9). Unset fields do not constrain results. */
export interface AssetQuery {
    text?: string;
    kind?: AssetKind | AssetKind[];
    folderId?: string | null;
    color?: string;
    orientation?: "landscape" | "portrait" | "square";
    minWidth?: number;
    minHeight?: number;
    durationMs?: {
        min?: number;
        max?: number;
    };
    createdAfter?: string;
    createdBefore?: string;
    favorite?: boolean;
    includeTrashed?: boolean;
    sort?: "recent" | "name" | "size" | "kind";
}
