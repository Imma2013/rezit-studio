import type { Clip, Track } from "./model";
/**
 * Trim one edge of a clip by `deltaFrames` (positive grows the source window in
 * the direction of the edge, negative shrinks it). Trimming the "in" edge also
 * moves the clip's startFrame so the body stays put on the timeline. The source
 * window is clamped so that:
 *   - the window stays within [0, +inf) on the in side,
 *   - the resulting source span is >= 1 frame,
 *   - startFrame never goes negative.
 *
 * Semantics (timeline-editor convention):
 *   edge "in",  +delta  -> trim later: inFrame += delta, startFrame += delta.
 *   edge "in",  -delta  -> extend earlier: inFrame -= |delta|, startFrame -= |delta|.
 *   edge "out", +delta  -> extend later: outFrame += delta.
 *   edge "out", -delta  -> trim earlier: outFrame -= |delta|.
 */
export declare function trim(track: Track, clipId: string, edge: "in" | "out", deltaFrames: number, opts?: {
    /** Total source frames available in the media; the source window is
     *  clamped so a trim can never extend past real footage. */
    maxSourceFrames?: number;
}): Track;
/**
 * Split a clip at a TIMELINE frame into two abutting clips. The left piece keeps
 * the original id and occupies [startFrame, atFrame); the right piece gets a new
 * id and starts exactly at `atFrame`, so the two pieces tile the original span
 * with no gap or overlap. Source in/out points are split at the source frame
 * that the cut maps to, honoring speed.
 *
 * Returns the track unchanged if the clip is missing or the cut is not strictly
 * inside the clip body.
 */
export declare function splitClip(track: Track, clipId: string, atFrame: number): Track;
/**
 * Remove a clip and shift every later clip on the same track LEFT by the removed
 * clip's timeline duration, closing the gap. Clips that start before the removed
 * clip are left untouched.
 */
export declare function rippleDelete(track: Track, clipId: string): Track;
/** Reposition a clip to a new start frame, clamped to >= 0. */
export declare function moveClip(track: Track, clipId: string, toStartFrame: number): Track;
/**
 * Change a clip's playback speed. Valid magnitudes are 0.1..100; negative values
 * mean reverse. The value is clamped into range (preserving sign) and 0 is
 * coerced to 1. Nothing else is recomputed: the timeline duration derives from
 * speed via clipDurationFrames.
 */
export declare function setSpeed(clip: Clip, speed: number): Clip;
/** True if the clip plays its source backward. */
export declare function isReversed(clip: Clip): boolean;
