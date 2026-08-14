import { type DesignFile, type Node, type NodeType } from "./schema";
/** Fresh UUID v4 for node and file ids (FR-11). */
export declare function newId(): string;
/**
 * Create a valid default instance of any concrete node type. `init` shallow-
 * overrides the defaults (including `id`). The reserved `model3d` type has no
 * concrete shape yet and is not constructable here.
 */
export declare function createNode<T extends Exclude<NodeType, "model3d">>(type: T, init?: Partial<Node>): Extract<Node, {
    type: T;
}>;
/** Create a blank, valid single-page design. */
export declare function createBlankDesign(init?: Partial<Pick<DesignFile, "id" | "title" | "unit" | "dpi">> & {
    width?: number;
    height?: number;
}): DesignFile;
