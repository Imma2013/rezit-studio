import type { Node } from "@hc/schema";
/** Allowed project frame rates. */
export type Fps = 24 | 25 | 30 | 50 | 60;
/** A rectangle in node-local coordinates (clip crop region). */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Easing identifier passed through to the engine; opaque to the timeline model. */
export type Easing = string;
export interface ClipTransition {
    type: "crossDissolve" | "fade" | "wipe" | "slide" | "dipToColor";
    /** Length of the transition in integer frames; always >= 1. */
    durationFrames: number;
    /** dipToColor target color. */
    color?: string;
    easing?: Easing;
    /** Direction for slide/wipe (P4.7). The clip enters from this edge and, for
     *  slide, exits back to it. Absent = the legacy left/horizontal behavior, so
     *  older projects render unchanged (additive). Ignored by other types. */
    direction?: "left" | "right" | "up" | "down";
}
export interface ChromaKey {
    keyColor: string;
    /** 0..1 */
    tolerance: number;
    /** 0..1 */
    spill: number;
    /** edge feather in px */
    edgeFeather: number;
}
/** Per-clip color adjustments. All fields optional and additive; an absent
 *  object (or neutral values) means the media draws untouched. */
export interface ColorAdjust {
    /** Multiplier, 1 = neutral (typical range 0.5..1.5). */
    brightness?: number;
    /** Multiplier, 1 = neutral. */
    contrast?: number;
    /** Multiplier, 1 = neutral; 0 = grayscale. */
    saturation?: number;
    /** -1 (cool) .. 1 (warm); 0 = neutral. */
    temperature?: number;
    /** Name of the filter preset these values came from (display only). */
    preset?: string;
}
/**
 * A single keyframe track for one animated property. The interpolation
 * primitives live in the animation work; here we only carry the data
 * so timeline edits (split/move/ripple) can be made to preserve keyframes later.
 */
/** A text card rendered by a clip on a "text" track (titles, lower thirds).
 *  Additive: clips without it draw nothing, older projects are unaffected. */
export interface TitleCard {
    text: string;
    /** Font size as a fraction of stage height (default 0.07). */
    sizePct?: number;
    /** CSS text color (default white). */
    color?: string;
    /** CSS color drawn as a band behind each line; empty/undefined = none. */
    background?: string;
    position?: "top" | "center" | "lower-third";
    /** Free positioning nudge from the preset position, as fractions of the
     *  stage size (additive; set by dragging the title on the stage). */
    offsetX?: number;
    offsetY?: number;
    weight?: "normal" | "bold";
    /** Entrance animation (additive; absent = the card just appears). */
    animIn?: "fade" | "slide-up" | "type-on";
    /** Exit animation (additive). */
    animOut?: "fade" | "slide-down";
    /** Length of each animation edge in timeline frames (default 12). */
    animFrames?: number;
}
export interface KeyframeTrack {
    property: string;
    keyframes: {
        frame: number;
        value: unknown;
        easing?: Easing;
    }[];
}
export interface Clip {
    id: string;
    /** User-facing display name (additive; defaults to the asset filename). */
    name?: string;
    /** Link group (additive): clips sharing a groupId move together (e.g. a
     *  video clip and its detached audio). */
    groupId?: string;
    /** Disabled clips keep their slot but render/play nothing (additive). */
    disabled?: boolean;
    /** Per-clip lock: no edits, no drags (additive; track lock still wins). */
    locked?: boolean;
    /** Display color label (CSS color) overriding the track-kind chip color. */
    colorLabel?: string;
    /** scene-graph node this clip renders (video/text/overlay). */
    nodeId?: string;
    /** Embedded footage-free design element (image/shape/text/group) this clip
     *  renders onto the stage, authored in stage coordinates. Rendered via the
     *  shared engine node renderer (browser + server), so it composites like any
     *  other clip (opacity/transition/pose apply). Additive; older clips omit it. */
    element?: Node;
    /** source media asset (video/audio). */
    assetId?: string;
    /** nested sequence reference (another VideoProject). */
    sequenceId?: string;
    /** Design-video "scene" (page) this element clip belongs to. Clips sharing a
     *  sceneId form one timed page composed of layered elements; scenes are laid
     *  out as contiguous blocks (see listScenes/packScenes). Additive. */
    sceneId?: string;
    /** position of the clip on its track, in timeline frames. */
    startFrame: number;
    /** source in-point, in source frames. */
    inFrame: number;
    /** source out-point, in source frames (exclusive of `inFrame` span). */
    outFrame: number;
    /** 1 = normal; >1 faster; <1 slower; negative = reverse. Never 0. */
    speed: number;
    crop?: Rect;
    /** How the media fills the stage: cover (scale-crop, default) or contain
     *  (letterbox). Additive. */
    fit?: "cover" | "contain";
    /** Static opacity 0..1 (additive; multiplies any keyframed opacity). */
    opacity?: number;
    /** Static rotation in degrees about the clip center (additive). */
    rotationDeg?: number;
    /** Color adjustments / filter (additive). */
    color?: ColorAdjust;
    transitionIn?: ClipTransition;
    transitionOut?: ClipTransition;
    chromaKey?: ChromaKey;
    /** Text card for clips on "text" tracks. */
    title?: TitleCard;
    keyframes?: KeyframeTrack[];
    /** audio */
    fadeInFrames?: number;
    fadeOutFrames?: number;
    audioGainDb?: number;
}
export interface Track {
    id: string;
    kind: "video" | "audio" | "text" | "effects" | "overlay";
    name?: string;
    locked?: boolean;
    muted?: boolean;
    solo?: boolean;
    hidden?: boolean;
    /** audio tracks */
    gainDb?: number;
    /** -1..1, audio tracks */
    pan?: number;
    /** ordered by startFrame */
    clips: Clip[];
}
export interface AudioMaster {
    gainDb: number;
    ducking?: {
        musicTrackId: string;
        voiceTrackId: string;
        amountDb: number;
        attackMs: number;
        releaseMs: number;
    };
}
export interface CaptionTrack {
    id: string;
    /** BCP-47 */
    lang: string;
    source: "auto" | "manual" | "translated";
    style: unknown;
    cues: {
        id: string;
        startFrame: number;
        endFrame: number;
        text: string;
    }[];
}
export interface VideoProject {
    stage: {
        width: number;
        height: number;
    };
    /** Stage background color behind all clips (additive; default black). */
    background?: string;
    fps: Fps;
    /** computed extent of the timeline, in frames. */
    durationFrames: number;
    /** User-set duration floor (additive): the timeline never reports shorter
     *  than this, so trailing space can hold black/audio after the last clip. */
    minDurationFrames?: number;
    tracks: Track[];
    master: AudioMaster;
    /** Subtitle tracks (additive; older projects simply omit it). */
    captions?: CaptionTrack[];
    /** Ruler markers, in timeline frames (additive). */
    markers?: number[];
    /** Export/preview range (in/out marks), in timeline frames (additive). */
    range?: {
        startFrame: number;
        endFrame: number;
    };
}
/**
 * Deterministic-enough unique id for new structures. Not cryptographic; the
 * timeline only needs uniqueness within a project document.
 */
export declare function genId(prefix?: string): string;
export interface NewProjectOpts {
    stage?: {
        width: number;
        height: number;
    };
    fps?: Fps;
    tracks?: Track[];
    master?: AudioMaster;
    durationFrames?: number;
}
/** Construct a fresh, empty video project with sane defaults. */
export declare function newProject(opts?: NewProjectOpts): VideoProject;
/** Construct a fresh empty track of the given kind. */
export declare function newTrack(kind: Track["kind"], name?: string): Track;
/**
 * Number of source frames covered by a clip's in/out window. Always >= 0.
 * Independent of speed.
 */
export declare function clipSourceSpan(clip: Clip): number;
/**
 * Number of TIMELINE frames a clip occupies. The source window
 * (outFrame - inFrame) is stretched/compressed by |speed|. Always >= 1 for a
 * non-empty source window.
 */
export declare function clipDurationFrames(clip: Clip): number;
/** The exclusive end frame of a clip on its track: startFrame + duration. */
export declare function clipEndFrame(clip: Clip): number;
/** The largest clipEndFrame on the track, i.e. the track's used extent. */
export declare function trackDurationFrames(track: Track): number;
/** The largest track extent across the whole project. */
export declare function projectDurationFrames(project: VideoProject): number;
/** True if two clips overlap on a track (half-open [start, end) ranges). */
export declare function clipsOverlap(a: Clip, b: Clip): boolean;
/**
 * The clip occupying a given timeline frame on a track, or null. Uses half-open
 * ranges: a clip covers [startFrame, clipEndFrame). If clips overlap, the first
 * matching clip in track order is returned.
 */
export declare function clipAtFrame(track: Track, frame: number): Clip | null;
/** Find a clip by id within a track. */
export declare function findClip(track: Track, clipId: string): Clip | null;
/** Return a track's clips sorted by startFrame (stable). */
export declare function sortClips(clips: Clip[]): Clip[];
