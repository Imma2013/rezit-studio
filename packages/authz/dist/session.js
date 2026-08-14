"use strict";
// Refresh-token rotation with reuse detection. Each
// login starts a session "family"; every refresh rotates the token. Presenting
// an already-rotated token outside a short grace window means the token leaked
// and was replayed: the whole family is revoked (sign-out). A brief grace
// tolerates concurrent-tab races so a multi-tab user is not logged out.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GRACE_MS = void 0;
exports.startSession = startSession;
exports.rotateRefresh = rotateRefresh;
exports.DEFAULT_GRACE_MS = 10000;
/** Start a new session family on login. */
function startSession(familyId, tokenId, now) {
    return { familyId, currentTokenId: tokenId, rotatedAt: now, revoked: false };
}
/**
 * Process a refresh attempt. `presentedTokenId` is the refresh token the client
 * sent; `newTokenId` is the id to rotate to on success.
 */
function rotateRefresh(state, presentedTokenId, newTokenId, now, graceMs = exports.DEFAULT_GRACE_MS) {
    if (state.revoked)
        return { action: "reject", state };
    if (presentedTokenId === state.currentTokenId) {
        return {
            action: "rotate",
            state: { ...state, previousTokenId: state.currentTokenId, currentTokenId: newTokenId, rotatedAt: now },
        };
    }
    // The token just rotated away from: a concurrent tab may legitimately present
    // it within the grace window. Beyond that, it is a replay -> revoke.
    if (presentedTokenId === state.previousTokenId) {
        if (now - state.rotatedAt <= graceMs)
            return { action: "tolerate", state };
        return { action: "revoke-family", state: { ...state, revoked: true } };
    }
    // An older/unknown token -> definite reuse -> revoke the family.
    return { action: "revoke-family", state: { ...state, revoked: true } };
}
