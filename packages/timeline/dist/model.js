"use strict";
// @hc/timeline - core timeline model.
//
// A video project lives in a Design whose `meta.kind === "video"`. The timeline
// model defined here is NOT part of the scene graph: clips reference scene nodes
// and assets by id, OR embed a footage-free design element (Clip.element). All
// times are INTEGER frames at the project frame rate; there is no floating-point
// timecode anywhere in the model.
Object.defineProperty(exports, "__esModule", { value: true });
exports.genId = genId;
exports.newProject = newProject;
exports.newTrack = newTrack;
exports.clipSourceSpan = clipSourceSpan;
exports.clipDurationFrames = clipDurationFrames;
exports.clipEndFrame = clipEndFrame;
exports.trackDurationFrames = trackDurationFrames;
exports.projectDurationFrames = projectDurationFrames;
exports.clipsOverlap = clipsOverlap;
exports.clipAtFrame = clipAtFrame;
exports.findClip = findClip;
exports.sortClips = sortClips;
// ---------------------------------------------------------------------------
// id generation
// ---------------------------------------------------------------------------
let __idCounter = 0;
/**
 * Deterministic-enough unique id for new structures. Not cryptographic; the
 * timeline only needs uniqueness within a project document.
 */
function genId(prefix = "id") {
    __idCounter += 1;
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}_${Date.now().toString(36)}_${__idCounter.toString(36)}${rand}`;
}
/** Construct a fresh, empty video project with sane defaults. */
function newProject(opts = {}) {
    const tracks = opts.tracks ?? [];
    const project = {
        stage: opts.stage ?? { width: 1920, height: 1080 },
        fps: opts.fps ?? 30,
        durationFrames: 0,
        tracks,
        master: opts.master ?? { gainDb: 0 },
    };
    project.durationFrames = opts.durationFrames ?? projectDurationFrames(project);
    return project;
}
/** Construct a fresh empty track of the given kind. */
function newTrack(kind, name) {
    const track = { id: genId("track"), kind, clips: [] };
    if (name !== undefined)
        track.name = name;
    return track;
}
// ---------------------------------------------------------------------------
// duration helpers
// ---------------------------------------------------------------------------
/**
 * Number of source frames covered by a clip's in/out window. Always >= 0.
 * Independent of speed.
 */
function clipSourceSpan(clip) {
    return Math.max(0, clip.outFrame - clip.inFrame);
}
/**
 * Number of TIMELINE frames a clip occupies. The source window
 * (outFrame - inFrame) is stretched/compressed by |speed|. Always >= 1 for a
 * non-empty source window.
 */
function clipDurationFrames(clip) {
    const span = clipSourceSpan(clip);
    if (span <= 0)
        return 0;
    return Math.max(1, Math.ceil(span / Math.abs(clip.speed)));
}
/** The exclusive end frame of a clip on its track: startFrame + duration. */
function clipEndFrame(clip) {
    return clip.startFrame + clipDurationFrames(clip);
}
/** The largest clipEndFrame on the track, i.e. the track's used extent. */
function trackDurationFrames(track) {
    let end = 0;
    for (const clip of track.clips) {
        const e = clipEndFrame(clip);
        if (e > end)
            end = e;
    }
    return end;
}
/** The largest track extent across the whole project. */
function projectDurationFrames(project) {
    let end = 0;
    for (const track of project.tracks) {
        const e = trackDurationFrames(track);
        if (e > end)
            end = e;
    }
    return end;
}
/** True if two clips overlap on a track (half-open [start, end) ranges). */
function clipsOverlap(a, b) {
    const aStart = a.startFrame;
    const aEnd = clipEndFrame(a);
    const bStart = b.startFrame;
    const bEnd = clipEndFrame(b);
    return aStart < bEnd && bStart < aEnd;
}
/**
 * The clip occupying a given timeline frame on a track, or null. Uses half-open
 * ranges: a clip covers [startFrame, clipEndFrame). If clips overlap, the first
 * matching clip in track order is returned.
 */
function clipAtFrame(track, frame) {
    for (const clip of track.clips) {
        if (frame >= clip.startFrame && frame < clipEndFrame(clip))
            return clip;
    }
    return null;
}
/** Find a clip by id within a track. */
function findClip(track, clipId) {
    return track.clips.find((c) => c.id === clipId) ?? null;
}
/** Return a track's clips sorted by startFrame (stable). */
function sortClips(clips) {
    return [...clips].sort((a, b) => a.startFrame - b.startFrame);
}
