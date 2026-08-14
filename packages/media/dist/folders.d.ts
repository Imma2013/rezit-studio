import type { Folder } from "./types";
export interface FolderNode extends Folder {
    children: FolderNode[];
}
/** Build the forest of root folders (parentId null/undefined) with children. */
export declare function buildFolderTree(folders: Folder[]): FolderNode[];
/** Breadcrumb from a root to `folderId` (inclusive), or [] if not found. */
export declare function folderPath(folders: Folder[], folderId: string): Folder[];
/** Ids of `folderId` and all folders nested beneath it. */
export declare function descendantIds(folders: Folder[], folderId: string): string[];
/**
 * Whether moving `folderId` under `targetParentId` is legal: the target must
 * exist (or be null for root), and must not be the folder itself or one of its
 * descendants (which would create a cycle).
 */
export declare function canMoveFolder(folders: Folder[], folderId: string, targetParentId: string | null): boolean;
export interface DeleteCascade {
    folderIds: string[];
    assetIds: string[];
}
/** Folders and assets affected by deleting `folderId` (FR-8). */
export declare function folderDeleteCascade(folders: Folder[], folderId: string, assets: {
    id: string;
    folderId?: string | null;
}[]): DeleteCascade;
