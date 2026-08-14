/**
 * Snap a frame to the nearest beat marker within `toleranceFrames`. If no beat
 * is within tolerance, the original frame is returned unchanged. `beatsFrames`
 * need not be sorted. A tolerance of 0 snaps only when the frame is exactly on a
 * beat.
 */
export declare function snapFrameToBeats(frame: number, beatsFrames: number[], toleranceFrames: number): number;
