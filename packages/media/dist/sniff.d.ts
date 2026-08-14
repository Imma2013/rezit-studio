import type { AssetKind } from "./types";
export interface SniffResult {
    mime: string;
    kind: AssetKind;
}
type Bytes = Uint8Array | number[];
/**
 * Identify a file from its leading bytes. Recognizes the formats HyCanvas
 * ingests. ZIP-based Office formats (PPTX/DOCX) cannot be
 * distinguished from a bare ZIP by magic bytes alone, so they report a generic
 * zip document; the caller refines via the central-directory entry names.
 */
export declare function sniffType(bytes: Bytes): SniffResult | null;
/** Result of validating an upload's bytes against the accepted-type policy. */
export interface AcceptResult {
    ok: boolean;
    mime?: string;
    kind?: AssetKind;
    reason?: string;
}
/**
 * Validate an upload by sniffing its content (FR-3). When `declaredExt` is
 * given and contradicts the sniffed type, the file is accepted as the sniffed
 * type (extension is never trusted) but the mismatch is noted.
 */
export declare function acceptUpload(bytes: Bytes, _declaredExt?: string): AcceptResult;
export {};
