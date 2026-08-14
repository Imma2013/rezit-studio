import type { Asset } from "./types";
export type DuplicateKind = "exact" | "near" | "none";
export type DuplicateAction = "use-existing" | "keep-both" | "replace-version";
export interface DuplicateResult {
    kind: DuplicateKind;
    match?: Asset;
    distance?: number;
    /** Resolution choices to offer the user (FR-7). */
    actions: DuplicateAction[];
}
export interface IncomingFingerprint {
    checksum: string;
    perceptualHash?: string;
}
/**
 * Classify an incoming upload against existing library assets. Exact-dupe takes
 * precedence; otherwise the closest perceptual match within threshold is a
 * near-dupe. Trashed assets are ignored as match candidates.
 */
export declare function classifyDuplicate(incoming: IncomingFingerprint, candidates: Asset[], maxDistance?: number): DuplicateResult;
