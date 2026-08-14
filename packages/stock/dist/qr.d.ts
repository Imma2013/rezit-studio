import { type Color, type Node } from "@hc/schema";
export type QrEcLevel = "L" | "M" | "Q" | "H";
export interface QrOptions {
    ecLevel?: QrEcLevel;
    foreground?: Color;
    background?: Color;
    size?: number;
    logoAssetId?: string;
}
/** Create an editable QR node bound to `value` (FR-10). */
export declare function createQrNode(value: string, opts?: QrOptions, id?: string): Node;
/** The value a QR node encodes (its live binding). */
export declare function qrValue(node: Node): string | undefined;
/**
 * Rebind a QR node to a new value (FR-10: the code regenerates when the bound
 * value changes). Returns a new node; the matrix is re-derived at render time.
 */
export declare function rebindQrValue(node: Node, value: string): Node;
