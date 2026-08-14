export interface GifFrame {
    /** RGBA pixels, length = width * height * 4. */
    rgba: Uint8Array;
    /** Frame display time in milliseconds. */
    delayMs: number;
}
export interface GifOptions {
    width: number;
    height: number;
    /** Loop count; 0 = infinite (default). */
    loops?: number;
    /** Maximum palette size, 2..256 (default 256). */
    maxColors?: number;
    /** Pixels with alpha below this become transparent; 0 disables (default 128). */
    transparentAlpha?: number;
}
/** Encode RGBA frames into a single animated GIF89a. */
export declare function encodeGif(frames: GifFrame[], opts: GifOptions): Uint8Array;
