export interface TimerState {
    running: boolean;
    durationMs: number;
    startedAt?: number;
    elapsedBeforeMs?: number;
}
export interface Vote {
    nodeId: string;
    userId: string;
}
export interface VoteSession {
    id: string;
    open: boolean;
    budgetPerUser: number;
    anonymous: boolean;
    revealed: boolean;
    votes: Vote[];
}
/** A saved viewport bookmark (FR-3): named region a facilitator can recall or
 *  step through as an agenda, and the target of a shareable deep-link (FR-34). */
export interface SavedView {
    id: string;
    name: string;
    viewport: {
        zoom: number;
        panX: number;
        panY: number;
    };
}
export interface WhiteboardMeta {
    kind: "whiteboard";
    grid: {
        size: number;
        snap: boolean;
    };
    /** Legacy client-side dot-vote, used as the offline fallback. Saved+connected
     *  boards use the server-authoritative session pointed to by `voteSessionId`. */
    vote?: VoteSession;
    /** The active server-authoritative vote session id (FR-19), synced via the CRDT
     *  so every client fetches the same tally over REST. Absent when no round runs. */
    voteSessionId?: string;
    timer?: TimerState;
    /** Saved viewport bookmarks for named-view recall + agenda step-through (FR-3). */
    views?: SavedView[];
    /** Private-mode round (FR-15): while `active` and not `revealed`, each client
     *  hides OTHER participants' contributions created since `startedAt`. Cooperative
     *  (nodes still sync; peers filter them at render), gated to the facilitator;
     *  `startedAt` (server-synced) keys each round so a new round recaptures the
     *  baseline. A determined client could read the raw CRDT, so this is an
     *  anti-groupthink affordance, not a hard secrecy boundary. */
    privateMode?: {
        active: boolean;
        revealed: boolean;
        startedAt: number;
    };
}
/** Start (or resume) the timer at `now`. No-op shape change if already running. */
export declare function startTimer(s: TimerState, now: number): TimerState;
/** Pause the timer at `now`, folding the running segment into elapsedBeforeMs. */
export declare function pauseTimer(s: TimerState, now: number): TimerState;
/** Reset to a stopped timer with zero elapsed, preserving duration. */
export declare function resetTimer(s: TimerState): TimerState;
/** Total elapsed milliseconds as of `now`. */
export declare function timerElapsedMs(s: TimerState, now: number): number;
/** Remaining milliseconds, clamped to >= 0. */
export declare function timerRemainingMs(s: TimerState, now: number): number;
/** Remaining vote budget for a user (never negative). */
export declare function remainingBudget(session: VoteSession, userId: string): number;
/**
 * Cast (or toggle off) a vote. Returns a new session.
 *  - If the session is closed, the session is returned unchanged.
 *  - If the same (nodeId,userId) vote already exists, it is removed (toggle).
 *  - Otherwise the vote is added unless the user is over budget, in which case
 *    the session is returned unchanged.
 */
export declare function castVote(session: VoteSession, nodeId: string, userId: string): VoteSession;
/** Tally votes per node id. */
export declare function tallyVotes(session: VoteSession): Record<string, number>;
/** Add a saved view, returning a new array (input untouched). Re-saving under an
 *  existing id replaces that entry IN PLACE (keeping its position); a new id is
 *  appended. */
export declare function addSavedView(views: SavedView[] | undefined, view: SavedView): SavedView[];
/** Remove a saved view by id, returning a new array. */
export declare function removeSavedView(views: SavedView[] | undefined, id: string): SavedView[];
/** True while a private round should hide other participants' new contributions
 *  (FR-15): active and not yet revealed. */
export declare function privateModeHiding(pm: WhiteboardMeta["privateMode"]): boolean;
/** The saved view following `currentId` in order, wrapping around; the first view
 *  when `currentId` is unknown/absent. Returns null when there are no views. Used
 *  to step a saved-view agenda forward (`dir` 1) or backward (-1). */
export declare function stepSavedView(views: SavedView[] | undefined, currentId: string | null, dir: 1 | -1): SavedView | null;
