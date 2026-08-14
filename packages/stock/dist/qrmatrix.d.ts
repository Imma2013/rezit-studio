import type { QrEcLevel } from "./qr";
/** Encode `value` into a scannable QR module matrix (true = dark). Throws if the
 *  value is too long for versions 1..6 at the requested EC level. */
export declare function encodeQrMatrix(value: string, ecLevel?: QrEcLevel): boolean[][];
