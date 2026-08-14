"use strict";
// Storage quota accounting. Pure math over a workspace's
// StorageUsage: applying uploads, deletes, and version replacements keeps the
// total and the per-kind breakdown consistent, and an over-quota upload is
// blocked without ever harming stored content.
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUpload = canUpload;
exports.remainingBytes = remainingBytes;
exports.applyUpload = applyUpload;
exports.applyHardDelete = applyHardDelete;
exports.applyVersionAdd = applyVersionAdd;
function clampNonNeg(n) {
    return n < 0 ? 0 : n;
}
function adjust(usage, kind, delta) {
    const byKind = { ...usage.byKind };
    byKind[kind] = clampNonNeg((byKind[kind] ?? 0) + delta);
    return {
        quotaBytes: usage.quotaBytes,
        usedBytes: clampNonNeg(usage.usedBytes + delta),
        byKind,
    };
}
/** Whether `byteSize` more bytes fits within quota (FR-11). quota <= 0 = unlimited. */
function canUpload(usage, byteSize) {
    if (usage.quotaBytes <= 0)
        return true;
    return usage.usedBytes + byteSize <= usage.quotaBytes;
}
/** Remaining free bytes (Infinity when unlimited). */
function remainingBytes(usage) {
    return usage.quotaBytes <= 0 ? Infinity : clampNonNeg(usage.quotaBytes - usage.usedBytes);
}
/** Account for a new upload (caller checks {@link canUpload} first). */
function applyUpload(usage, kind, byteSize) {
    return adjust(usage, kind, byteSize);
}
/** Account for hard-deleting an asset (Trash soft-delete does not free quota). */
function applyHardDelete(usage, kind, byteSize) {
    return adjust(usage, kind, -byteSize);
}
/**
 * Account for replacing an asset in place (FR-17): all versions are retained,
 * so the new version's bytes are added on top of the old.
 */
function applyVersionAdd(usage, kind, newByteSize) {
    return adjust(usage, kind, newByteSize);
}
