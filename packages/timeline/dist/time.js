"use strict";
// @hc/timeline - source-time mapping and frame-rate conversion.
// All math is integer-frame; speed/reverse are honored exactly.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceFrameAt = sourceFrameAt;
exports.remapFps = remapFps;
const model_1 = require("./model");
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
function sourceFrameAt(clip, timelineFrame) {
    const duration = (0, model_1.clipDurationFrames)(clip);
    if (duration <= 0)
        return null;
    const local = timelineFrame - clip.startFrame;
    if (local < 0 || local >= duration)
        return null;
    const speedMag = Math.abs(clip.speed);
    const lastSource = clip.outFrame - 1; // inclusive last source frame
    if (clip.speed < 0) {
        // Reverse: local 0 -> lastSource, increasing local walks back toward inFrame.
        const src = lastSource - Math.round(local * speedMag);
        return clamp(src, clip.inFrame, lastSource);
    }
    const src = clip.inFrame + Math.round(local * speedMag);
    return clamp(src, clip.inFrame, lastSource);
}
function clamp(v, lo, hi) {
    if (hi < lo)
        return lo;
    return v < lo ? lo : v > hi ? hi : v;
}
/**
 * Convert a frame index from one frame rate to another, rounding to the nearest
 * integer frame. Used to conform clips authored at a different source fps to the
 * project fps. Frame 0 always maps to frame 0.
 */
function remapFps(frame, fromFps, toFps) {
    if (fromFps === toFps)
        return frame;
    return Math.round((frame * toFps) / fromFps);
}
