import { type DesignFile } from "./schema";
export type ValidationResult = {
    ok: true;
} | {
    ok: false;
    pointer: string;
    message: string;
};
/** RFC 6901 JSON-pointer encoding of a path; `~` and `/` are escaped. */
export declare function pathToPointer(path: Array<string | number>): string;
/**
 * Validate a value as a `DesignFile`. Returns `{ ok: true }` or the JSON pointer
 * and message of the first violation. Unknown (newer-client) node types are
 * accepted as long as their base fields are valid, never silently dropped (FR-3).
 */
export declare function validate(file: unknown): ValidationResult;
/** Throwing variant for call sites that prefer exceptions. */
export declare function assertValid(file: unknown): asserts file is DesignFile;
