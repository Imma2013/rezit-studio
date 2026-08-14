import type { Fill, Node } from "@hc/schema";
export type QualityIssueKind = "contrast" | "overflow" | "overlap";
export interface QualityIssue {
    kind: QualityIssueKind;
    nodeId: string;
    message: string;
    /** Measured contrast ratio for "contrast" issues. */
    ratio?: number;
}
export interface QualityReport {
    ok: boolean;
    issues: QualityIssue[];
}
export interface PageInput {
    background: Fill;
    nodes: Node[];
    size: {
        width: number;
        height: number;
    };
}
export declare function qualityCheck(page: PageInput): QualityReport;
