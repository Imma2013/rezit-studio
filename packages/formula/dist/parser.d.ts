export type Node = {
    kind: "number";
    value: number;
} | {
    kind: "string";
    value: string;
} | {
    kind: "boolean";
    value: boolean;
} | {
    kind: "ref";
    ref: string;
} | {
    kind: "range";
    range: string;
} | {
    kind: "unary";
    op: string;
    operand: Node;
} | {
    kind: "binary";
    op: string;
    left: Node;
    right: Node;
} | {
    kind: "call";
    name: string;
    args: Node[];
};
/** Strip a leading "=" if present and parse the formula body into an AST. */
export declare function parse(source: string): Node;
