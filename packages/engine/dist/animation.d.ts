import type { AnimationClip, Easing, EntrancePreset, ExitPreset, EmphasisPreset, KeyframeTrack } from "@hc/schema";
/** A transform/opacity offset applied over a node's static transform. All
 *  fields are deltas/multipliers relative to the resting node, so a value of
 *  the identity ({ dx:0, dy:0, scale:1, rotate:0, opacityMul:1 }) is a no-op. */
export interface AnimPatch {
    dx: number;
    dy: number;
    scale: number;
    rotate: number;
    opacityMul: number;
}
export declare const IDENTITY_PATCH: Readonly<AnimPatch>;
/**
 * Evaluate a named easing curve at normalized progress t in [0,1], returning the
 * eased progress (also normalized for non-spring curves). The "spring" curve is a
 * critically-ish damped settle baked deterministically from a closed form so the
 * browser and a headless render agree exactly. It can overshoot
 * past 1 before settling, which reads as a springy pop.
 */
export declare function evalEasing(easing: Easing, t: number): number;
/** Evaluate a CSS-style cubic-bezier easing [x1,y1,x2,y2] at progress x in [0,1].
 *  Solves x(t)=x for t (Newton + bisection fallback), then returns y(t). */
export declare function cubicBezierEase(x: number, x1: number, y1: number, x2: number, y2: number): number;
/** Eased progress for a clip, using its custom cubic-bezier when present, else
 *  its named easing curve. Single source of truth for clip timing. */
export declare function clipEase(clip: {
    easing: Easing;
    bezier?: [number, number, number, number];
}, t: number): number;
/** Entrance patch: animates FROM an off pose TO the resting pose (eased 0->1). */
export declare function entrancePatch(clip: AnimationClip<EntrancePreset>, tMs: number): AnimPatch;
/** Eased entrance progress in [0,1] (0 before the clip's delay, 1 after it ends).
 *  Used by text reveal ("typewriter") to decide how many characters are shown. */
export declare function entranceProgress(clip: AnimationClip<EntrancePreset>, tMs: number): number;
/** Exit patch: animates FROM the resting pose TO an off pose (eased 0->1). At
 *  e=0 it is the identity; at e=1 the element is fully gone. */
export declare function exitPatch(clip: AnimationClip<ExitPreset>, tMs: number): AnimPatch;
/**
 * Emphasis patch: a LOOPING idle animation. `tMs` is wrapped by the clip period
 * (delay + duration) so it cycles forever; the returned patch oscillates around
 * the identity and is the identity at the loop boundaries.
 */
export declare function emphasisPatch(clip: AnimationClip<EmphasisPreset>, tMs: number): AnimPatch;
/** Total ms a clip occupies (delay + duration); 0 when absent. */
export declare function clipEnd(clip: AnimationClip | undefined): number;
/** Evaluate a custom keyframe timeline (F25 FR-3) at time t (ms since the track
 *  started), returning the interpolated AnimPatch. Before the first / after the
 *  last keyframe it holds that keyframe's pose; looping wraps t by the duration.
 *  Each keyframe's `easing` shapes the segment to the next. Pure. */
export declare function customPatch(track: KeyframeTrack, tMs: number): AnimPatch;
/** The end time (ms) of a custom track, for sequencing/total-duration math. */
export declare function customTrackEnd(track: KeyframeTrack | undefined): number;
/**
 * Apply a patch's opacity multiplier to a node's resting opacity, clamped to
 * [0,1]. A spring easing can carry `opacityMul` past 1 mid-curve, but the
 * resting opacity is the contract ceiling, so the displayed opacity never
 * exceeds it (transform overshoot is intentional and left untouched).
 */
export declare function appliedOpacity(baseOpacity: number, opacityMul: number): number;
/**
 * Normalized, eased progress (0..1) of a page transition `durationMs` long at
 * elapsed time `tMs`, shared by present mode's slide-to-slide cross effects so
 * the math lives next to the rest of the playback engine. A zero/absent duration
 * snaps straight to 1 (an instant switch). Transitions use a soft ease-in-out.
 */
export declare function transitionProgress(tMs: number, durationMs: number): number;
/**
 * Ken Burns / parallax photo-motion patch for an image at present time `tMs`.
 * Returns a slow looping zoom+pan whose magnitude scales with `intensity` (0..1).
 * `periodMs` controls the loop length (defaults to a slow 12s drift). Parallax is
 * a gentler pan than ken-burns and zooms less.
 */
export declare function imageMotionPatch(motion: {
    kind: "kenburns" | "parallax";
    intensity: number;
}, tMs: number, periodMs?: number): AnimPatch;
