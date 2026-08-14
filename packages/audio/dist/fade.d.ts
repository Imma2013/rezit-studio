import type { Clip } from "@hc/timeline";
/**
 * Linear fade gain at a position WITHIN a clip, expressed in clip-local frames
 * [0, clipDurationFrames). A fade-in ramps 0 -> 1 over `fadeInFrames`; a fade-out
 * ramps 1 -> 0 over the last `fadeOutFrames`. With no fades configured the gain
 * is 1 everywhere inside the clip. Outside [0, duration) the gain is 0.
 *
 * If fade-in and fade-out regions overlap (very short clip), the lower of the two
 * ramps wins so the envelope never exceeds either ramp.
 */
export declare function gainAtFrame(clip: Clip, localFrame: number, clipDurationFrames: number): number;
