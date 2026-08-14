import { type DesignFile } from "./schema";
/** A pure, idempotent step upgrading a file from version `v` to `v + 1`. */
export type Migration = (file: any) => any;
/**
 * Migration steps keyed by their SOURCE version. `migrations[n]` upgrades a
 * version-`n` file to version `n + 1`.
 */
export declare const migrations: Record<number, Migration>;
export declare class MigrationError extends Error {
    readonly from: number;
    readonly to: number;
    constructor(message: string, from: number, to: number);
}
/**
 * Forward-migrate a file to `toVersion` (default: current). Throws a structured
 * `MigrationError` rather than partially upgrading if a step is missing or a
 * downgrade is requested (FR-10). Running on an already-current file is a no-op
 * and never mutates the input.
 */
export declare function migrate(file: DesignFile, toVersion?: number): DesignFile;
/** True when the file needs a forward migration before it can be hydrated. */
export declare function needsMigration(file: Pick<DesignFile, "schemaVersion">, toVersion?: number): boolean;
