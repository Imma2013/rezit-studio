import type { AudioMaster, Clip, Track } from "@hc/timeline";
/** Convert decibels to a linear amplitude gain. 0 dB -> 1.0. */
export declare function dbToGain(db: number): number;
/**
 * Convert a linear amplitude gain to decibels. A gain of 0 (or negative) maps to
 * -Infinity dB (silence). 1.0 -> 0 dB.
 */
export declare function gainToDb(gain: number): number;
/**
 * Multiply any number of linear gains together, floored at 0. Used to combine
 * independent stages (clip x track x master x fade) into one factor. Values
 * ABOVE 1 pass through: positive dB boosts must be audible in the preview
 * exactly as the server export applies them (WebAudio handles >1 gains).
 */
export declare function mixGains(...gains: number[]): number;
/** True if ANY track has solo enabled (and is not hidden). */
export declare function soloActive(tracks: Track[]): boolean;
/**
 * Whether a track should be heard in the mix. A track is audible when it is not
 * muted, and when solo is active anywhere it must itself be soloed. Hidden tracks
 * (visual property) do not affect audibility on their own; only `muted`/`solo`
 * gate audio.
 */
export declare function isAudible(track: Track, tracks: Track[]): boolean;
/**
 * Combine a clip's audio gain, its track gain, and the master gain into a single
 * linear gain factor, honoring mute/solo via {@link isAudible}. A muted (or
 * non-soloed while solo is active) track yields 0. Fades are applied separately
 * by {@link gainAtFrame} and can be folded in by the caller via {@link mixGains}.
 */
export declare function effectiveClipGain(clip: Clip, track: Track, master: AudioMaster, allTracks?: Track[]): number;
