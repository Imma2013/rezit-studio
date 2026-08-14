"use strict";
// Facilitation session accounting: countdown timer (FR-7) and dot voting
// (FR-8). Pure value transforms only: no network, no Date.now. Callers pass an
// explicit `now` (epoch ms) so timer math is deterministic and testable. All
// helpers return new objects and never mutate their inputs.
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimer = startTimer;
exports.pauseTimer = pauseTimer;
exports.resetTimer = resetTimer;
exports.timerElapsedMs = timerElapsedMs;
exports.timerRemainingMs = timerRemainingMs;
exports.remainingBudget = remainingBudget;
exports.castVote = castVote;
exports.tallyVotes = tallyVotes;
exports.addSavedView = addSavedView;
exports.removeSavedView = removeSavedView;
exports.privateModeHiding = privateModeHiding;
exports.stepSavedView = stepSavedView;
// --- timer (FR-7) -----------------------------------------------------------
/** Start (or resume) the timer at `now`. No-op shape change if already running. */
function startTimer(s, now) {
    if (s.running)
        return { ...s };
    return {
        ...s,
        running: true,
        startedAt: now,
        elapsedBeforeMs: s.elapsedBeforeMs ?? 0,
    };
}
/** Pause the timer at `now`, folding the running segment into elapsedBeforeMs. */
function pauseTimer(s, now) {
    if (!s.running)
        return { ...s };
    const segment = s.startedAt !== undefined ? Math.max(0, now - s.startedAt) : 0;
    return {
        ...s,
        running: false,
        startedAt: undefined,
        elapsedBeforeMs: (s.elapsedBeforeMs ?? 0) + segment,
    };
}
/** Reset to a stopped timer with zero elapsed, preserving duration. */
function resetTimer(s) {
    return {
        running: false,
        durationMs: s.durationMs,
        startedAt: undefined,
        elapsedBeforeMs: 0,
    };
}
/** Total elapsed milliseconds as of `now`. */
function timerElapsedMs(s, now) {
    const before = s.elapsedBeforeMs ?? 0;
    if (s.running && s.startedAt !== undefined) {
        return before + Math.max(0, now - s.startedAt);
    }
    return before;
}
/** Remaining milliseconds, clamped to >= 0. */
function timerRemainingMs(s, now) {
    return Math.max(0, s.durationMs - timerElapsedMs(s, now));
}
// --- voting (FR-8) ----------------------------------------------------------
/** How many votes a user has spent in this session. */
function votesByUser(session, userId) {
    let count = 0;
    for (const v of session.votes)
        if (v.userId === userId)
            count++;
    return count;
}
/** Remaining vote budget for a user (never negative). */
function remainingBudget(session, userId) {
    return Math.max(0, session.budgetPerUser - votesByUser(session, userId));
}
/**
 * Cast (or toggle off) a vote. Returns a new session.
 *  - If the session is closed, the session is returned unchanged.
 *  - If the same (nodeId,userId) vote already exists, it is removed (toggle).
 *  - Otherwise the vote is added unless the user is over budget, in which case
 *    the session is returned unchanged.
 */
function castVote(session, nodeId, userId) {
    if (!session.open)
        return { ...session, votes: [...session.votes] };
    const existingIdx = session.votes.findIndex((v) => v.nodeId === nodeId && v.userId === userId);
    if (existingIdx >= 0) {
        const votes = session.votes.filter((_, i) => i !== existingIdx);
        return { ...session, votes };
    }
    if (remainingBudget(session, userId) <= 0) {
        return { ...session, votes: [...session.votes] };
    }
    return { ...session, votes: [...session.votes, { nodeId, userId }] };
}
/** Tally votes per node id. */
function tallyVotes(session) {
    const tally = {};
    for (const v of session.votes) {
        tally[v.nodeId] = (tally[v.nodeId] ?? 0) + 1;
    }
    return tally;
}
// --- saved views (FR-3) -----------------------------------------------------
/** Add a saved view, returning a new array (input untouched). Re-saving under an
 *  existing id replaces that entry IN PLACE (keeping its position); a new id is
 *  appended. */
function addSavedView(views, view) {
    const list = views ?? [];
    if (list.some((v) => v.id === view.id)) {
        return list.map((v) => (v.id === view.id ? view : v));
    }
    return [...list, view];
}
/** Remove a saved view by id, returning a new array. */
function removeSavedView(views, id) {
    return (views ?? []).filter((v) => v.id !== id);
}
/** True while a private round should hide other participants' new contributions
 *  (FR-15): active and not yet revealed. */
function privateModeHiding(pm) {
    return !!pm && pm.active && !pm.revealed;
}
/** The saved view following `currentId` in order, wrapping around; the first view
 *  when `currentId` is unknown/absent. Returns null when there are no views. Used
 *  to step a saved-view agenda forward (`dir` 1) or backward (-1). */
function stepSavedView(views, currentId, dir) {
    const list = views ?? [];
    if (list.length === 0)
        return null;
    const idx = list.findIndex((v) => v.id === currentId);
    if (idx < 0)
        return dir === 1 ? list[0] : list[list.length - 1];
    const next = (idx + dir + list.length) % list.length;
    return list[next];
}
