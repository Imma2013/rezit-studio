export type QrEcLevel = "L" | "M" | "Q" | "H";
export interface QrMatrix {
    size: number;
    modules: boolean[][];
    version: number;
    ecLevel: QrEcLevel;
}
/**
 * Encode `text` into a QR module matrix at the given EC level (default M).
 * Byte mode; the smallest fitting version (1..40) is chosen automatically and
 * the lowest-penalty data mask is selected per spec.
 */
export declare function encodeQr(text: string, ecLevel?: QrEcLevel): QrMatrix;
export interface QrSvgOptions {
    fg?: string;
    bg?: string;
    moduleSize?: number;
    quietZone?: number;
    logo?: {
        href: string;
        sizeRatio?: number;
    };
}
/**
 * Render a QR matrix to an SVG string. Dark modules are emitted as <rect>
 * elements; the background is a single rect honoring `bg`. An optional center
 * logo is composited via an <image> element sized as a fraction of the code.
 */
export declare function qrToSvg(matrix: QrMatrix, opts?: QrSvgOptions): string;
