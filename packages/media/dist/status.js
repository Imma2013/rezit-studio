"use strict";
// Asset status state machine. An asset is unusable until
// it passes scanning/processing; Trash is a reversible terminal-ish state. This
// captures the legal transitions so the backend and UI agree.
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.transition = transition;
exports.isUsable = isUsable;
exports.isProcessing = isProcessing;
const TRANSITIONS = {
    queued: ["uploading", "failed"],
    uploading: ["scanning", "failed"],
    scanning: ["processing", "failed"], // failed scan = quarantined
    processing: ["ready", "failed"],
    ready: ["trashed"],
    failed: ["queued"], // retry
    trashed: ["ready"], // restore
};
function canTransition(from, to) {
    return TRANSITIONS[from]?.includes(to) ?? false;
}
/** Apply a transition, throwing on an illegal one. */
function transition(from, to) {
    if (!canTransition(from, to)) {
        throw new Error(`illegal asset status transition: ${from} -> ${to}`);
    }
    return to;
}
/** Only `ready` assets are placeable/shareable/searchable (FR-4, FR-16). */
function isUsable(status) {
    return status === "ready";
}
/** Whether an asset is still being ingested (UI shows a spinner). */
function isProcessing(status) {
    return status === "queued" || status === "uploading" || status === "scanning" || status === "processing";
}
