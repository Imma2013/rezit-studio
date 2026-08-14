import type { DesignFile } from "@hc/schema";
import { type SceneOp } from "./commands";
export interface Transaction {
    id: string;
    label: string;
    ops: SceneOp[];
    authorId?: string;
    ts?: number;
}
/** Apply every op of a transaction forward, in order. Mutates the file. */
export declare function applyTransaction(file: DesignFile, txn: Transaction): void;
/** Reverse a transaction: apply each op's inverse, in reverse order. */
export declare function revertTransaction(file: DesignFile, txn: Transaction): void;
/**
 * A bounded local undo/redo stack over an editable DesignFile. Committing a new
 * transaction clears the redo stack (standard linear-history semantics).
 */
export declare class History {
    private readonly file;
    private readonly limit;
    private undoStack;
    private redoStack;
    constructor(file: DesignFile, limit?: number);
    /** Apply a transaction and push it onto the undo stack. */
    commit(txn: Transaction): void;
    /** Record an already-applied transaction without re-applying it. */
    record(txn: Transaction): void;
    /**
     * Apply a transaction and coalesce it into the previous step when they share
     * `key` and fall within `windowMs` of each other (by `ts`); otherwise push a
     * new step. This collapses rapid same-target edits - a slider drag, repeated
     * nudges - into a single undo step (coalescing, FR-7). Pass a stable
     * `key` per continuous gesture and a monotonic `txn.ts`.
     */
    commitCoalescing(txn: Transaction, key: string, windowMs?: number): void;
    canUndo(): boolean;
    canRedo(): boolean;
    /** Revert the most recent transaction; returns it (for history UI) or null. */
    undo(): Transaction | null;
    /** Re-apply the most recently undone transaction; returns it or null. */
    redo(): Transaction | null;
    /** Labels of the undo stack, oldest first (for an in-session history panel). */
    labels(): string[];
    clear(): void;
}
