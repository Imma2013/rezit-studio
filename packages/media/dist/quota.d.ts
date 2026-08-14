import type { AssetKind, StorageUsage } from "./types";
/** Whether `byteSize` more bytes fits within quota (FR-11). quota <= 0 = unlimited. */
export declare function canUpload(usage: StorageUsage, byteSize: number): boolean;
/** Remaining free bytes (Infinity when unlimited). */
export declare function remainingBytes(usage: StorageUsage): number;
/** Account for a new upload (caller checks {@link canUpload} first). */
export declare function applyUpload(usage: StorageUsage, kind: AssetKind, byteSize: number): StorageUsage;
/** Account for hard-deleting an asset (Trash soft-delete does not free quota). */
export declare function applyHardDelete(usage: StorageUsage, kind: AssetKind, byteSize: number): StorageUsage;
/**
 * Account for replacing an asset in place (FR-17): all versions are retained,
 * so the new version's bytes are added on top of the old.
 */
export declare function applyVersionAdd(usage: StorageUsage, kind: AssetKind, newByteSize: number): StorageUsage;
