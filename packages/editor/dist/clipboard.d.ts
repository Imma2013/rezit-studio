import { type BlendMode, type DesignFile, type Effect, type Fill, type Node, type Stroke } from "@hc/schema";
import type { SceneOp } from "./commands";
export declare const CLIPBOARD_SCHEMA_VERSION = 1;
export declare const DEFAULT_PASTE_OFFSET = 16;
export interface ClipboardPayload {
    format: "hycanvas.clipboard";
    schemaVersion: number;
    source: {
        designId: string;
        pageId: string;
    };
    nodes: Node[];
    assetIds: string[];
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface StyleClip {
    fills?: Fill[];
    stroke?: Stroke;
    effects?: Effect[];
    opacity?: number;
    blendMode?: BlendMode;
}
/** Asset ids referenced by a fragment (image sources, pattern/image fills). */
export declare function collectAssetIds(nodes: Node[]): string[];
/**
 * The selection "roots": ids that are not a descendant of another selected id.
 * Operations like copy/duplicate/delete act on roots so a container and one of
 * its own descendants are not processed twice.
 */
export declare function selectionRoots(file: DesignFile, selection: string[]): string[];
/**
 * Serialize the top-level selection into a native clipboard payload (FR-2).
 * Descendants of a selected container are carried within it, not duplicated as
 * top-level entries.
 */
export declare function serializeSelection(file: DesignFile, selection: string[], source: {
    designId: string;
    pageId: string;
}): ClipboardPayload | null;
/** Default fresh-id generator; pass a custom one in tests for determinism. */
export declare function defaultIdGen(): string;
/**
 * Clone a fragment with fresh ids, rewriting internal references (connector
 * endpoint attachments) so a paste is self-consistent. Returns the new nodes
 * and the old->new id map.
 */
export declare function remapIds(nodes: Node[], idGen?: () => string): {
    nodes: Node[];
    idMap: Map<string, string>;
};
export interface PasteOptions {
    /** "normal" centers the fragment on `at` and cascades; "in-place" keeps coords. */
    mode: "normal" | "in-place";
    /** Page-space point to center the fragment's bounding box on (viewport center). */
    at?: {
        x: number;
        y: number;
    };
    /** Repeat index for the cascade offset (0 for the first paste). */
    cascadeIndex?: number;
    idGen?: () => string;
}
export interface PasteResult {
    ops: SceneOp[];
    nodeIds: string[];
    nodes: Node[];
}
/**
 * Produce the insert ops for pasting a payload into the first page (FR-3).
 * Fresh ids are assigned; normal paste centers the fragment's bounding box on
 * `at` (the viewport center) with a cascade offset, in-place paste keeps the
 * original coordinates. Always targets page 0 (the editor core is page-0
 * scoped; cross-page paste lands with multi-page support).
 */
export declare function pasteOps(file: DesignFile, payload: ClipboardPayload, opts: PasteOptions): PasteResult;
export interface DuplicateResult {
    ops: SceneOp[];
    nodeIds: string[];
}
/**
 * Duplicate the selection roots with a fresh id each, offset by (offset) and
 * appended after their original parent's children (FR-5). The same `offset`
 * passed to a subsequent duplicate implements power-duplicate. Selection is
 * reduced to roots so a container and its own descendant are not cloned twice.
 */
export declare function duplicateOps(file: DesignFile, selection: string[], offset?: {
    x: number;
    y: number;
}, idGen?: () => string): DuplicateResult;
/**
 * Produce remove ops for the selection roots, ordered so undo restores them to
 * their original positions (FR-7). This is the engine behind delete and the
 * removal half of cut. Removes are emitted in descending document index so that
 * their inverse inserts (applied in reverse) re-create ascending indices.
 */
export declare function removeSelectionOps(file: DesignFile, selection: string[]): SceneOp[];
export interface CutResult {
    payload: ClipboardPayload | null;
    ops: SceneOp[];
}
/** Cut = copy the selection to a payload, then remove it (FR, AC-1 path). */
export declare function cut(file: DesignFile, selection: string[], source: {
    designId: string;
    pageId: string;
}): CutResult;
/** Capture style-only properties from a node (FR-6). */
export declare function captureStyle(file: DesignFile, nodeId: string): StyleClip | null;
export interface PasteStyleResult {
    ops: SceneOp[];
    /** Which style fields were applied to each target node id. */
    applied: Record<string, string[]>;
}
/**
 * Apply a captured style to the selection, adapting per node type and reporting
 * what was applied (FR-6, AC-4). Fills/strokes are skipped on node types that
 * do not support them (for example, text fills live per run).
 */
export declare function pasteStyleOps(file: DesignFile, selection: string[], clip: StyleClip): PasteStyleResult;
