import { type VectorPath } from "@hc/geometry";
import type { BooleanNode } from "@hc/schema";
/**
 * The geometry a boolean node should draw, in the node's local space, derived
 * from its operands. Returns null when it cannot be derived (no operands, an
 * operand shape with no parametric form such as `custom`, or an empty clip
 * result), so the caller can keep its existing fallback for those cases rather
 * than drawing nothing.
 */
export declare function booleanGeometry(node: BooleanNode): VectorPath | null;
