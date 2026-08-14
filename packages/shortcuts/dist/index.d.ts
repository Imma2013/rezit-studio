export interface KeyBinding {
    commandId: string;
    chord: string;
    when?: string;
}
export interface ShortcutScheme {
    id: string;
    name: string;
    bindings: KeyBinding[];
}
/** The subset of a keyboard event needed to resolve a chord (DOM-free). */
export interface KeyEvent {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}
/**
 * Normalize a chord string to a canonical form: modifiers first in a fixed
 * order, then the single main key, lowercased, joined by "+".
 * Throws on an empty chord or one with no non-modifier key.
 */
export declare function normalizeChord(chord: string): string;
/**
 * Build the normalized chord a keyboard event represents. `mod` maps to the
 * platform accelerator: Cmd (metaKey) on macOS, Ctrl elsewhere.
 */
export declare function chordFromEvent(ev: KeyEvent, platform?: "mac" | "other"): string;
/** Resolve an event to the first matching binding in the scheme, or null. */
export declare function resolveChord(ev: KeyEvent, scheme: ShortcutScheme, platform?: "mac" | "other"): KeyBinding | null;
export interface Conflict {
    chord: string;
    when?: string;
    commandIds: string[];
}
/**
 * Detect bindings that collide: the same normalized chord under the same `when`
 * guard bound to more than one command (FR-9 live conflict detection).
 */
export declare function detectConflicts(scheme: ShortcutScheme): Conflict[];
/** The shipped default scheme (FR-9). Chords are normalized at definition time. */
export declare const DEFAULT_SCHEME: ShortcutScheme;
