import type { AudioMaster, Fps } from "@hc/timeline";
export interface VoiceWindow {
    startFrame: number;
    endFrame: number;
}
export interface DuckingPoint {
    frame: number;
    musicGainDb: number;
}
/** Convert a duration in milliseconds to whole frames at the given fps. */
export declare function msToFrames(ms: number, fps: Fps | number): number;
/**
 * Derive voice-activity windows from caption/cue ranges. Overlapping or touching
 * cues are merged into contiguous windows. Cues need not be sorted.
 */
export declare function voiceActivityFromCues(cues: {
    startFrame: number;
    endFrame: number;
}[]): VoiceWindow[];
/**
 * Solve the ducking automation curve.
 *
 * For each voice window the curve attacks from the current rest level (0 dB) down
 * to `amountDb`, holds at `amountDb` for the duration of the window, then
 * releases back to 0 dB. Attack begins at the window start; release begins at the
 * window end. Adjacent windows that are closer than the release time keep the
 * music ducked between them (the release is interrupted by the next attack).
 *
 * Returns automation points (frame, musicGainDb). If there is no ducking config
 * or no voice activity, a single flat point at frame 0 (0 dB) is returned so the
 * caller always has a defined curve.
 */
export declare function solveDucking(master: AudioMaster, voiceActivity: VoiceWindow[], totalFrames: number, fps: Fps | number): DuckingPoint[];
