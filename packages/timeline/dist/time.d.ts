import type { Clip, Fps } from "./model";
/**
 * Map a TIMELINE frame to the SOURCE frame it should read from, honoring speed
 * and reverse. Returns null if `timelineFrame` is outside the clip's on-timeline
 * window [startFrame, startFrame + duration).
 *
 * Forward (speed > 0): source = inFrame + round(localFrame * speed).
 * Reverse (speed < 0): source counts down from the out-point, so the first
 *   on-timeline frame reads the last source frame.
 *
 * The result is clamped into [inFrame, outFrame - 1] so it always references a
 * real source frame within the clip window.
 */
export declare function sourceFrameAt(clip: Clip, timelineFrame: number): number | null;
/**
 * Convert a frame index from one frame rate to another, rounding to the nearest
 * integer frame. Used to conform clips authored at a different source fps to the
 * project fps. Frame 0 always maps to frame 0.
 */
export declare function remapFps(frame: number, fromFps: Fps | number, toFps: Fps | number): number;
