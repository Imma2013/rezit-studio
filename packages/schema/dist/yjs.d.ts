import * as Y from "yjs";
import type { DesignFile } from "./schema";
/** Root Y.Map key holding the serialized design inside a Y.Doc. */
export declare const DESIGN_ROOT_KEY = "design";
type Json = unknown;
/**
 * Convert a plain JSON value into the equivalent Yjs shared type: objects become
 * Y.Map, arrays become Y.Array, primitives are returned as-is. Exported so the
 * realtime reconciler (`@hc/realtime`) can materialize new subtrees inside a
 * live Y.Doc using exactly the same mapping the snapshot bridge uses.
 */
export declare function toY(value: Json): unknown;
/**
 * Project a Yjs shared type back to a plain JSON value (the inverse of
 * {@link toY}). Exported so consumers can read a subtree of a live Y.Doc without
 * round-tripping the whole document.
 */
export declare function fromY(value: unknown): Json;
/** Build a Yjs document from a `DesignFile` (the inverse of `toDesignFile`). */
export declare function fromDesignFile(file: DesignFile): Y.Doc;
/** Project a Yjs document back to a plain `DesignFile`. Pure and lossless. */
export declare function toDesignFile(doc: Y.Doc): DesignFile;
export {};
