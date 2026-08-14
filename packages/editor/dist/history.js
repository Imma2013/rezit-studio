"use strict";
// In-session undo/redo history. A transaction groups one or
// more SceneOps into a single atomic, reversible step. The history applies each
// op forward in order and, on undo, applies each op's inverse in reverse order.
//
// This is the LOCAL, ephemeral stack and is never serialized into the design
// file (durable history is persistence snapshots). Under collaboration this
// stack is replaced/wrapped by the Yjs origin-scoped UndoManager so undo affects
// only the local user's changes (FR-8); that integration lands with realtime
// collaboration.
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
exports.applyTransaction = applyTransaction;
exports.revertTransaction = revertTransaction;
const commands_1 = require("./commands");
/** Apply every op of a transaction forward, in order. Mutates the file. */
function applyTransaction(file, txn) {
    for (const op of txn.ops)
        (0, commands_1.applyCommand)(file, op);
}
/** Reverse a transaction: apply each op's inverse, in reverse order. */
function revertTransaction(file, txn) {
    for (let i = txn.ops.length - 1; i >= 0; i--) {
        (0, commands_1.applyCommand)(file, (0, commands_1.invertCommand)(txn.ops[i]));
    }
}
/**
 * A bounded local undo/redo stack over an editable DesignFile. Committing a new
 * transaction clears the redo stack (standard linear-history semantics).
 */
class History {
    constructor(file, limit = 200) {
        this.file = file;
        this.limit = limit;
        this.undoStack = [];
        this.redoStack = [];
    }
    /** Apply a transaction and push it onto the undo stack. */
    commit(txn) {
        applyTransaction(this.file, txn);
        this.undoStack.push(txn);
        if (this.undoStack.length > this.limit)
            this.undoStack.shift();
        this.redoStack = [];
    }
    /** Record an already-applied transaction without re-applying it. */
    record(txn) {
        this.undoStack.push(txn);
        if (this.undoStack.length > this.limit)
            this.undoStack.shift();
        this.redoStack = [];
    }
    /**
     * Apply a transaction and coalesce it into the previous step when they share
     * `key` and fall within `windowMs` of each other (by `ts`); otherwise push a
     * new step. This collapses rapid same-target edits - a slider drag, repeated
     * nudges - into a single undo step (coalescing, FR-7). Pass a stable
     * `key` per continuous gesture and a monotonic `txn.ts`.
     */
    commitCoalescing(txn, key, windowMs = 400) {
        applyTransaction(this.file, txn);
        const top = this.undoStack[this.undoStack.length - 1];
        const within = top?.ts != null && txn.ts != null && txn.ts - top.ts <= windowMs;
        if (top && top.id === key && within) {
            top.ops.push(...txn.ops);
            top.ts = txn.ts;
            this.redoStack = [];
            return;
        }
        this.record({ ...txn, id: key });
    }
    canUndo() {
        return this.undoStack.length > 0;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    /** Revert the most recent transaction; returns it (for history UI) or null. */
    undo() {
        const txn = this.undoStack.pop();
        if (!txn)
            return null;
        revertTransaction(this.file, txn);
        this.redoStack.push(txn);
        return txn;
    }
    /** Re-apply the most recently undone transaction; returns it or null. */
    redo() {
        const txn = this.redoStack.pop();
        if (!txn)
            return null;
        applyTransaction(this.file, txn);
        this.undoStack.push(txn);
        return txn;
    }
    /** Labels of the undo stack, oldest first (for an in-session history panel). */
    labels() {
        return this.undoStack.map((t) => t.label);
    }
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
exports.History = History;
