import type { DesignFile } from "@hc/schema";
import type { SceneOp } from "./commands";
import { History, type Transaction } from "./history";
export interface CommandContext {
    designId?: string;
    pageId?: string;
    selection: string[];
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    };
}
export interface Command<P = void> {
    id: string;
    label: string;
    keywords?: string[];
    category: string;
    /** When false the command is greyed in menus and ignored from shortcuts. */
    enabled?(ctx: CommandContext, file: DesignFile): boolean;
    /** A short reason shown when the command is disabled (FR-11). */
    disabledReason?(ctx: CommandContext, file: DesignFile): string | undefined;
    /** Produce the forward ops to apply; an empty array is a no-op. */
    run(ctx: CommandContext, file: DesignFile, payload: P): SceneOp[];
}
/** A registry of all commands, keyed by id. Last registration wins for an id. */
export declare class CommandRegistry {
    private commands;
    register<P>(cmd: Command<P>): void;
    unregister(id: string): void;
    get(id: string): Command<never> | undefined;
    all(): Command<never>[];
    /** A command is runnable when present and (if it declares one) enabled. */
    isEnabled(id: string, ctx: CommandContext, file: DesignFile): boolean;
}
/**
 * Run a registered command: check it is enabled, produce its forward ops, wrap
 * them in a single transaction, and commit it to history (one undoable step,
 * FR-7/AC-5). Returns the committed transaction, or null if the command is
 * absent, disabled, or produced no ops.
 */
export declare function runCommand<P>(registry: CommandRegistry, id: string, ctx: CommandContext, file: DesignFile, history: History, payload: P, authorId?: string): Transaction | null;
