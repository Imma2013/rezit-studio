import { type BlendMode, type DesignFile, type Effect, type Fill, type GroupNode, type Node, type Size, type Stroke, type Transform } from "@hc/schema";
export type NodeId = string;
export type ParentRef = NodeId | "page";
export type EditCommand = {
    kind: "transform";
    nodes: NodeId[];
    before: Transform[];
    after: Transform[];
    beforeSizes?: Size[];
    afterSizes?: Size[];
} | {
    kind: "reorder";
    node: NodeId;
    fromIndex: number;
    toIndex: number;
    parent: ParentRef;
} | {
    kind: "reparent";
    node: NodeId;
    fromParent: ParentRef;
    toParent: ParentRef;
    fromIndex: number;
    toIndex: number;
    beforeTransform: Transform;
    afterTransform: Transform;
} | {
    kind: "group";
    groupId: NodeId;
    members: NodeId[];
    parent: ParentRef;
} | {
    kind: "ungroup";
    groupId: NodeId;
    members: NodeId[];
    parent: ParentRef;
} | {
    kind: "setFlag";
    node: NodeId;
    flag: "locked" | "hidden";
    before: boolean;
    after: boolean;
} | {
    kind: "setOpacity";
    node: NodeId;
    before: number;
    after: number;
} | {
    kind: "setBlend";
    node: NodeId;
    before: BlendMode;
    after: BlendMode;
} | {
    kind: "setFills";
    node: NodeId;
    before?: Fill[];
    after?: Fill[];
} | {
    kind: "setStroke";
    node: NodeId;
    before?: Stroke;
    after?: Stroke;
} | {
    kind: "setEffects";
    node: NodeId;
    before?: Effect[];
    after?: Effect[];
} | {
    kind: "insert";
    parent: ParentRef;
    index: number;
    node: Node;
} | {
    kind: "remove";
    parent: ParentRef;
    index: number;
    node: Node;
} | {
    kind: "rename";
    node: NodeId;
    before?: string;
    after?: string;
};
/** A scene operation: the invertible op vocabulary every Command emits (FR-1).
 *  The history/transaction layer applies and reverses these. */
export type SceneOp = EditCommand;
export interface CommandRecord {
    id: string;
    command: EditCommand;
    ts: number;
    authorId?: string;
}
/** The inverse command, such that applying a command then its inverse is a no-op. */
export declare function invertCommand(cmd: EditCommand): EditCommand;
/** Apply a command to the editable document, mutating it in place. */
export declare function applyCommand(file: DesignFile, cmd: EditCommand): void;
/** Collect members under a new identity-positioned group; visuals are preserved
 *  because the group is a pure translation to the members' bounding origin. */
export declare function applyGroup(file: DesignFile, groupId: NodeId, members: NodeId[], parent: ParentRef): GroupNode | null;
/** Dissolve a group, baking its transform into each child to preserve visuals. */
export declare function applyUngroup(file: DesignFile, groupId: NodeId): NodeId[];
