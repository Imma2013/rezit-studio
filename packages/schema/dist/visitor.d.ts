import type { Node, GroupNode, FrameNode, GridNode } from "./schema";
export type ContainerNode = GroupNode | FrameNode | GridNode;
/** A container node carries an ordered `children: Node[]` (FR-4). */
export declare function isContainer(node: Node): node is ContainerNode;
/** Children of a node, or an empty array for leaf nodes.
 *
 *  This is specifically the `children` ARRAY accessor. For "every node nested
 *  below this one, wherever it is stored", use `childNodesOf`. */
export declare function childrenOf(node: Node): Node[];
/** Where a node type stores nested nodes outside `children`, and under which
 *  key, so a traversal can report an accurate path rather than guessing. */
type NestedSlot = {
    key: string;
    nodes: Node[];
    indexed: boolean;
};
/**
 * Every node nested below this one, INCLUDING the ones stored outside
 * `children`.
 *
 * A mask keeps its single subject in `child` and a boolean keeps its inputs in
 * `operands`, so a walker that only ever reads `children` cannot see them. That
 * is not a cosmetic gap: it made a masked node invisible to id-uniqueness
 * validation, to comment anchoring, to version diffs, and to the scene build
 * itself, which is why masks did not render at all.
 *
 * The backend's write boundary (`persistence/validate.go`) already descends
 * into both slots, so ids nested there have always shared the one global
 * namespace. This makes the client agree with the server rather than widening
 * anything.
 */
export declare function nestedSlotsOf(node: Node): NestedSlot[];
/** Every nested node, flattened. Order is `children`, then `child`/`operands`. */
export declare function childNodesOf(node: Node): Node[];
export interface VisitInfo {
    /** JSON-pointer-style path segments from the page to this node. */
    path: Array<string | number>;
    /** Container nesting depth; top-level page children are depth 0. */
    depth: number;
    parent: Node | null;
}
export type Visitor = (node: Node, info: VisitInfo) => void;
/**
 * Depth-first, pre-order walk over a list of nodes (a page's `children`).
 * `basePath` is prepended to every reported path so callers can anchor the
 * pointer at, for example, `["pages", 0, "children"]`.
 */
export declare function walkNodes(nodes: Node[], visit: Visitor, basePath?: Array<string | number>): void;
/** Collect every node id in document order. */
export declare function collectIds(nodes: Node[]): string[];
/** The deepest container nesting level present (0 for a flat list). */
export declare function maxDepth(nodes: Node[]): number;
export {};
