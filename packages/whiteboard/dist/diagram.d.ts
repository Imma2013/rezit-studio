export interface DiagramNode {
    id: string;
    label: string;
}
export interface DiagramEdge {
    from: string;
    to: string;
    label?: string;
}
export interface DiagramSpec {
    kind: "flowchart" | "mindmap";
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    direction?: "down" | "right";
}
/**
 * Validate and clamp an untrusted spec (an AI reply or user paste) into a safe
 * DiagramSpec: unique non-empty ids, labels capped, edges only between known
 * distinct nodes, node/edge counts bounded. Null when unusable.
 */
export declare function normalizeDiagramSpec(raw: unknown): DiagramSpec | null;
/** Serialize a spec to Mermaid source (flowchart TD/LR, or a mindmap). */
export declare function diagramToMermaid(spec: DiagramSpec): string;
/**
 * Parse basic Mermaid flowchart source (`graph`/`flowchart` with `TD`/`LR`
 * etc., `A[Label] --> B`, edge labels via `-->|label|`) into a DiagramSpec.
 * Null when nothing parseable - the caller falls back to treating the text as
 * a plain AI prompt. Subgraphs/styles/classes are skipped, not fatal.
 */
export declare function mermaidToDiagram(source: string): DiagramSpec | null;
