import * as Y from "yjs";
/** Origin tag stamped on the corrective transaction. Distinct from the local
 *  (reconcile) and remote (applied client update) origins so the gateway can
 *  tell a server correction apart and never echoes it back to its author as a
 *  fresh remote edit. */
export declare const SERVER_ORIGIN = "server";
/** A protected node's serialized state captured before an update is applied.
 *  `null` means the node was absent at snapshot time. */
export type NodeSnapshot = Map<string, Record<string, unknown> | null>;
/**
 * Locate the Y.Map for a node id by walking the design's pages and their
 * children recursively (so nodes nested in groups/frames are found). Returns the
 * Y.Map, or null when no node with that id exists in the doc. Pure read; no
 * mutation.
 */
export declare function findNodeMap(ydoc: Y.Doc, nodeId: string): Y.Map<unknown> | null;
/**
 * Serialize each id's current node to plain JSON (reusing {@link yToJson} on its
 * Y.Map), returning a Map<id, json|null>. A `null` entry records that the id had
 * no node at snapshot time (so a later re-appearance can be detected). Only the
 * protected ids are walked, so this stays cheap.
 */
export declare function snapshotNodes(ydoc: Y.Doc, ids: Iterable<string>): NodeSnapshot;
/**
 * Restore protected nodes to a prior snapshot inside a single SERVER-origin
 * transaction, returning the ids actually corrected. For each snapshotted id:
 *
 *  - If the node is PRESENT and its current serialized state differs from the
 *    snapshot, the snapshot value is reconciled back into its Y.Map (minimal
 *    ops, scoped to that node), reverting any property/transform mutation while
 *    leaving the rest of the doc untouched.
 *  - If the snapshot recorded the node as ABSENT (null) but it is now present,
 *    the (unauthorized) freshly inserted node is removed by reconciling its
 *    parent's children list without it.
 *  - DELETED-NODE CAVEAT: if the snapshot HAD the node but it is now GONE
 *    (the update deleted a locked node), re-inserting it is best-effort and only
 *    works when the node still has a live parent children Y.Array to splice into;
 *    Yjs forbids re-integrating a tombstoned shared type, so a deleted top-level
 *    node cannot be cleanly resurrected here. Such an id is reported as corrected
 *    only when re-insertion succeeds; otherwise it is skipped (the property-
 *    mutation guard above still protects every node that remains present). The
 *    gateway pairs this with the client lock UI, which prevents deleting a locked
 *    node in the first place.
 *
 * The whole pass is one transaction tagged {@link SERVER_ORIGIN} so the gateway
 * can broadcast exactly the corrective delta and never treat it as a new remote
 * edit (no echo loop).
 */
export declare function restoreNodes(ydoc: Y.Doc, snapshot: NodeSnapshot): string[];
