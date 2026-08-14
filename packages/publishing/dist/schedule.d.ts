import type { PostStatus } from "./types";
/** Lifecycle events that drive a post between statuses. */
export type PostEvent = "schedule" | "publishStart" | "publishOk" | "publishFail" | "cancel" | "requeue";
/**
 * A post is editable until publishing actually starts. Drafts and scheduled
 * posts can be edited; once publishing/published/failed/canceled it is not.
 * Failed posts are re-queued (which returns them to scheduled) before editing.
 */
export declare function canEdit(status: PostStatus): boolean;
/** A post can be canceled until publishing starts. */
export declare function canCancel(status: PostStatus): boolean;
/**
 * Advance the state machine. Throws on an illegal transition so callers cannot
 * silently corrupt a post's lifecycle.
 */
export declare function nextTransition(status: PostStatus, event: PostEvent): PostStatus;
/**
 * Resolve the absolute epoch-ms instant a post is due, from an ISO local
 * wall-clock time and the target timezone's UTC offset in minutes.
 *
 * Offset-based by design (no tz database): the caller resolves the IANA tz to
 * an offset for the relevant instant (handling DST) and passes it here. A
 * positive offset means ahead of UTC (e.g. UTC+5:30 => 330).
 *
 * The ISO string is interpreted as a *local* wall-clock time. Any trailing
 * "Z" or explicit offset in the string is ignored in favor of the supplied
 * offset, so "9:00 local" stays anchored to the supplied offset.
 */
export declare function dueAt(scheduledAtIso: string, timezoneOffsetMinutes: number): number;
/** A minimal due-able shape: a resolved epoch-ms due time. */
export interface DueablePost {
    dueMs?: number;
    status: PostStatus;
}
/**
 * Is this post due to fire at `nowMs`? Only scheduled posts with a due time at
 * or before now are due.
 */
export declare function isDue(post: DueablePost, nowMs: number): boolean;
export interface BackoffOptions {
    baseMs?: number;
    factor?: number;
    maxMs?: number;
    jitter?: number;
}
/**
 * Exponential backoff delay for retry `attempt` (0-based: attempt 0 is the
 * first retry). Capped at maxMs. Jitter is a caller-supplied 0..1 multiplier
 * (NOT random here, so the function stays deterministic): the computed delay is
 * scaled down by up to that fraction, giving a result in
 * `[capped * (1 - jitter), capped]`. jitter=0 returns the full delay; jitter=1
 * returns 0. The result never exceeds the cap.
 */
export declare function backoffDelayMs(attempt: number, opts?: BackoffOptions): number;
