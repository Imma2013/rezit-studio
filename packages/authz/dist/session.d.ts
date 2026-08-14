export interface SessionState {
    familyId: string;
    currentTokenId: string;
    previousTokenId?: string;
    rotatedAt: number;
    revoked: boolean;
}
export declare const DEFAULT_GRACE_MS = 10000;
export type RefreshOutcome = {
    action: "rotate";
    state: SessionState;
} | {
    action: "tolerate";
    state: SessionState;
} | {
    action: "revoke-family";
    state: SessionState;
} | {
    action: "reject";
    state: SessionState;
};
/** Start a new session family on login. */
export declare function startSession(familyId: string, tokenId: string, now: number): SessionState;
/**
 * Process a refresh attempt. `presentedTokenId` is the refresh token the client
 * sent; `newTokenId` is the id to rotate to on success.
 */
export declare function rotateRefresh(state: SessionState, presentedTokenId: string, newTokenId: string, now: number, graceMs?: number): RefreshOutcome;
