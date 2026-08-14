import { type DesignFile } from "@hc/schema";
import type { FillableField } from "./types";
/** One field's value in a fill row. A text field uses `text`; an image field
 *  uses `imageUrl` (resolved to an ImageSource on the node). Absent/empty means
 *  "leave the node's existing default". */
export interface FillValue {
    text?: string;
    imageUrl?: string;
}
/** A fill row, keyed by fillable-field `nodeId`. */
export type FillValues = Record<string, FillValue>;
export interface ApplyFillResult {
    /** The filled design (a deep clone; the input is never mutated). */
    file: DesignFile;
    /** Field node ids that received a value. */
    filled: string[];
    /** Field node ids whose value was provided but whose node was missing. */
    missing: string[];
}
/**
 * Substitute a row of values into a COPY of `file` (FR-8, FR-9). Each entry is
 * keyed by a fillable field's `nodeId`: a `text` value sets the node's text, an
 * `imageUrl` sets its image source. Fields with no value (or an empty string)
 * keep the design's existing default. The source design is never mutated; ids
 * are preserved (a single autofill stays the same design). Pure.
 *
 * Bulk create deep-copies (fresh ids) first, then applies a row's values to the
 * copy; pass the already-copied file here so this stays a focused substitution.
 */
export declare function applyFill(file: DesignFile, values: FillValues): ApplyFillResult;
/**
 * Validate a whole fill row against the fields' constraints (FR-8 mapping
 * validation). Returns the first problem found, or ok. Image aspect/required
 * presence beyond a non-empty URL is not knowable here (dimensions are fetched
 * at ingest), so only text constraints and required-presence are enforced.
 */
export declare function validateFillRow(fields: FillableField[], values: FillValues): {
    ok: boolean;
    reason?: string;
};
