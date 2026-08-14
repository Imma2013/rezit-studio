import { type DesignFile, type Node, type Page } from "@hc/schema";
import { type Mat2D, type Rect } from "@hc/engine";
export interface NodeLocation {
    node: Node;
    /** The containing group/frame/grid, or null when the node is a direct page child. */
    parent: Node | null;
    /** The children array the node lives in (page.children or container.children). */
    siblings: Node[];
    index: number;
    page: Page;
}
/** Find a node anywhere in the document, with its parent, siblings, and index. */
export declare function locate(file: DesignFile, id: string): NodeLocation | null;
/** Map of every node id to the node, across all pages. */
export declare function nodeMap(file: DesignFile): Map<string, Node>;
/** Local->world matrix for a node, composing the chain from the page root. */
export declare function worldMatrix(file: DesignFile, id: string): Mat2D | null;
/** Axis-aligned page-space bounds of a node (its box under the world matrix). */
export declare function worldAABB(file: DesignFile, id: string): Rect | null;
/** The page-space AABB enclosing several nodes. */
export declare function unionAABB(file: DesignFile, ids: string[]): Rect | null;
/**
 * Convert a page-space drag delta into the node's PARENT space, so move/resize
 * track the cursor even when the node lives inside a rotated/scaled group. For
 * a top-level node the parent is the page (identity), so the delta is returned
 * unchanged.
 */
export declare function parentSpaceDelta(file: DesignFile, id: string, dx: number, dy: number): {
    dx: number;
    dy: number;
};
/** Children array a node belongs to is mutated in place by these helpers. */
export declare function removeNode(file: DesignFile, id: string): NodeLocation | null;
