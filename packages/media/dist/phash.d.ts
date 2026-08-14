export interface Bitmap {
    width: number;
    height: number;
    data: Uint8ClampedArray | number[];
}
/** 64-bit average hash as a 16-character lowercase hex string. */
export declare function averageHash(bmp: Bitmap): string;
/** Hamming distance between two equal-length hex hashes (count of differing bits). */
export declare function hammingDistance(a: string, b: string): number;
/** Default near-duplicate threshold: <= 5 differing bits out of 64. */
export declare const NEAR_DUPLICATE_MAX_DISTANCE = 5;
export declare function isNearDuplicate(a: string, b: string, maxDistance?: number): boolean;
