import type { Clip, ClipTransition, Track } from "./model";
/**
 * Clamp a transition's duration so it cannot exceed the clip's timeline length
 * (and is at least 1 frame). Returns a new ClipTransition.
 */
export declare function clampTransition(t: ClipTransition, clip: Clip): ClipTransition;
/**
 * Attach a transition to the "in" or "out" edge of a clip. The transition is
 * clamped to the clip length. Pure: returns a new Track.
 */
export declare function addTransition(track: Track, clipId: string, edge: "in" | "out", t: ClipTransition): Track;
/**
 * Given two clips that are adjacent on a track (a before b in time), return the
 * frame range [start, end) on the timeline where a cross-clip transition between
 * them overlaps. The overlap is the shorter of a.transitionOut / b.transitionIn,
 * bounded by the actual gap or overlap between the clips.
 *
 * Returns null if no transition is configured on the touching edges or if the
 * clips are not arranged a-then-b.
 */
export declare function transitionOverlapRegion(a: Clip, b: Clip): {
    startFrame: number;
    endFrame: number;
} | null;
