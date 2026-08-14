import { type DesignFile, type Node } from "@hc/schema";
import type { Rect, Scene } from "@hc/engine";
/** A node is selectable by click/marquee when it is neither hidden nor locked. */
export declare function isSelectable(node: Node): boolean;
export declare class SelectionModel {
    private ids;
    get(): string[];
    has(id: string): boolean;
    set(ids: string[]): void;
    add(ids: string[]): void;
    remove(ids: string[]): void;
    /** Toggle membership without clearing the rest (Shift/Cmd-click, FR-2). */
    toggle(id: string): void;
    clear(): void;
}
/** All selectable top-level nodes on a page (Cmd/Ctrl+A, FR-4). */
export declare function selectAll(file: DesignFile, pageIndex?: number): string[];
/** All selectable nodes (any depth) sharing the seed node's type (FR-4). */
export declare function selectSameType(file: DesignFile, seedId: string, pageIndex?: number): string[];
/**
 * Marquee selection: hit-test the rectangle via the engine, then keep only
 * selectable (visible, unlocked) nodes (FR-3).
 */
export declare function marqueeSelect(scene: Scene, rect: Rect, mode: "intersect" | "contain"): string[];
