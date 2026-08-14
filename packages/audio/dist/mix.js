"use strict";
// @hc/audio - linear/decibel gain math and the per-clip mixing chain
//. Pure math only; no DSP, no decoding.
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbToGain = dbToGain;
exports.gainToDb = gainToDb;
exports.mixGains = mixGains;
exports.soloActive = soloActive;
exports.isAudible = isAudible;
exports.effectiveClipGain = effectiveClipGain;
/** Convert decibels to a linear amplitude gain. 0 dB -> 1.0. */
function dbToGain(db) {
    return Math.pow(10, db / 20);
}
/**
 * Convert a linear amplitude gain to decibels. A gain of 0 (or negative) maps to
 * -Infinity dB (silence). 1.0 -> 0 dB.
 */
function gainToDb(gain) {
    if (gain <= 0)
        return -Infinity;
    return 20 * Math.log10(gain);
}
/**
 * Multiply any number of linear gains together, floored at 0. Used to combine
 * independent stages (clip x track x master x fade) into one factor. Values
 * ABOVE 1 pass through: positive dB boosts must be audible in the preview
 * exactly as the server export applies them (WebAudio handles >1 gains).
 */
function mixGains(...gains) {
    let product = 1;
    for (const g of gains)
        product *= g;
    if (product < 0)
        product = 0;
    return product;
}
/** True if ANY track has solo enabled (and is not hidden). */
function soloActive(tracks) {
    return tracks.some((t) => t.solo === true);
}
/**
 * Whether a track should be heard in the mix. A track is audible when it is not
 * muted, and when solo is active anywhere it must itself be soloed. Hidden tracks
 * (visual property) do not affect audibility on their own; only `muted`/`solo`
 * gate audio.
 */
function isAudible(track, tracks) {
    if (track.muted === true)
        return false;
    if (soloActive(tracks))
        return track.solo === true;
    return true;
}
/**
 * Combine a clip's audio gain, its track gain, and the master gain into a single
 * linear gain factor, honoring mute/solo via {@link isAudible}. A muted (or
 * non-soloed while solo is active) track yields 0. Fades are applied separately
 * by {@link gainAtFrame} and can be folded in by the caller via {@link mixGains}.
 */
function effectiveClipGain(clip, track, master, allTracks = [track]) {
    if (!isAudible(track, allTracks))
        return 0;
    const clipGain = dbToGain(clip.audioGainDb ?? 0);
    const trackGain = dbToGain(track.gainDb ?? 0);
    const masterGain = dbToGain(master.gainDb ?? 0);
    return mixGains(clipGain, trackGain, masterGain);
}
