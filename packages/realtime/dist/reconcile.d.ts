import * as Y from "yjs";
import { type DesignFile } from "@hc/schema";
/** Origin tag stamped on the transaction wrapping a local reconcile. The client
 *  binding observes for updates whose origin is NOT this, to apply remote edits
 *  without echoing them back. */
export declare const LOCAL_ORIGIN = "local";
type JsonObject = Record<string, unknown>;
/**
 * Project a live Y value back to plain JSON (objects from Y.Map, arrays from
 * Y.Array, primitives as-is). Mirrors @hc/schema's `fromY`/`toDesignFile`, but
 * kept local so the `instanceof Y.Map` checks run against THIS package's `Y`
 * instance. Used both for diff equality checks and by {@link fromDoc}.
 */
export declare function yToJson(value: unknown): unknown;
/**
 * Idempotently sync a plain JS `DesignFile` into a Y.Doc's nested shared types
 * under DESIGN_ROOT_KEY, producing minimal Yjs ops. Runs inside one
 * `ydoc.transact(..., LOCAL_ORIGIN)` so the whole reconcile is a single,
 * locally-originated update the binding can tell apart from remote updates.
 *
 * After `reconcile(doc, ydoc)`, `fromY(ydoc)` (a.k.a. `toDesignFile(ydoc)`)
 * deep-equals `doc`.
 */
export declare function reconcile(doc: DesignFile, ydoc: Y.Doc): void;
/**
 * Project a Y.Doc's design state back to a plain `DesignFile` (the inverse of
 * {@link reconcile}). Equivalent to @hc/schema's `toDesignFile`, but uses this
 * package's `Y` so it works on docs whose shared types were created here even
 * when a bundler hands the two packages distinct yjs module instances.
 */
export declare function fromDoc(ydoc: Y.Doc): DesignFile;
/**
 * fromDoc with PAGE-GRANULAR reuse (doc 16 FR-2/FR-7 incremental apply at
 * scale). Projecting a large multi-page document on every remote update is the
 * client's scale bottleneck: a peer's one-shape move re-serializes all 50
 * pages. This variant projects only pages absent from `reusable`; for the rest
 * it emits the caller's existing JS page objects untouched (the caller
 * guarantees they are in sync with the Y state - i.e. it tracked which pages a
 * transaction actually changed). Page ORDER always comes from the live __ord
 * ranks, so reordering works even against fully reused bodies. Everything
 * outside `pages` projects normally.
 */
export declare function fromDocWithPageReuse(ydoc: Y.Doc, reusable: ReadonlyMap<string, unknown>): DesignFile;
/**
 * Reconcile a single node's plain-JSON state into an existing Y.Map with minimal
 * ops (the same structural diff `reconcile` applies to the whole tree, scoped to
 * one node). Used by the server-side lock enforcement (`enforce.ts`) to revert a
 * protected node to its prior snapshot without touching sibling nodes. The
 * caller wraps this in its own (server-origin) transaction.
 */
export declare function reconcileNodeMap(target: Y.Map<unknown>, source: JsonObject): void;
export {};
