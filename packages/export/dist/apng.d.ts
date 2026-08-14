export interface ApngFrame {
    png: Uint8Array;
    /** Frame display time in milliseconds. */
    delayMs: number;
}
export interface ApngOptions {
    /** Loop count; 0 = infinite (default). */
    loops?: number;
}
/** Encode PNG frames into a single animated PNG (APNG). */
export declare function encodeApng(frames: ApngFrame[], opts?: ApngOptions): Uint8Array;
