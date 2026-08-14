"use strict";
// Command framework. Every state-changing editor
// action is a registered Command with a stable id, label, category, an optional
// `enabled` predicate, and a `run` that returns the forward SceneOps to apply.
// Commands never mutate scene state directly: they emit ops, which the history
// layer applies inside a transaction so undo/redo and (later) CRDT sync are
// uniform. This is the single funnel the text, shapes, image, and color features
// (and later ones) plug into.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
exports.runCommand = runCommand;
/** A registry of all commands, keyed by id. Last registration wins for an id. */
class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }
    register(cmd) {
        this.commands.set(cmd.id, cmd);
    }
    unregister(id) {
        this.commands.delete(id);
    }
    get(id) {
        return this.commands.get(id);
    }
    all() {
        return [...this.commands.values()];
    }
    /** A command is runnable when present and (if it declares one) enabled. */
    isEnabled(id, ctx, file) {
        const cmd = this.commands.get(id);
        if (!cmd)
            return false;
        return cmd.enabled ? cmd.enabled(ctx, file) : true;
    }
}
exports.CommandRegistry = CommandRegistry;
let txnCounter = 0;
/**
 * Run a registered command: check it is enabled, produce its forward ops, wrap
 * them in a single transaction, and commit it to history (one undoable step,
 * FR-7/AC-5). Returns the committed transaction, or null if the command is
 * absent, disabled, or produced no ops.
 */
function runCommand(registry, id, ctx, file, history, payload, authorId) {
    const cmd = registry.get(id);
    if (!cmd)
        return null;
    if (cmd.enabled && !cmd.enabled(ctx, file))
        return null;
    const ops = cmd.run(ctx, file, payload);
    if (ops.length === 0)
        return null;
    const txn = {
        id: `txn-${++txnCounter}`,
        label: cmd.label,
        ops,
        authorId,
        ts: 0,
    };
    history.commit(txn);
    return txn;
}
