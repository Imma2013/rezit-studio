import { type Node, type UnknownNode } from "./schema";
/** True when a node's `type` has no concrete schema in this client. */
export declare function isUnknownNode(node: Node): node is UnknownNode;
/**
 * Wrap a raw node of an unrecognized type into an `UnknownNode`: known base
 * fields are surfaced for generic operations (select/move/lock/reorder) while
 * the complete original is preserved in `raw` for lossless round-trips.
 * Idempotent: a node that already carries `raw` is returned unchanged.
 */
export declare function wrapUnknownNode(node: Record<string, unknown>): UnknownNode;
/** Recover the original node object preserved inside an `UnknownNode`. */
export declare function unwrapUnknownNode(node: UnknownNode): Record<string, unknown>;
