import { type DesignFile } from "@hc/schema";
export type A11ySeverity = "error" | "warning";
export type A11yKind = "contrast" | "alt-text" | "small-text" | "touch-target" | "slide-title" | "reading-order";
export interface A11yIssue {
    nodeId: string;
    nodeName?: string;
    pageIndex: number;
    kind: A11yKind;
    severity: A11ySeverity;
    /** English, always present: this package is framework-agnostic and its
     *  callers include logs and tests. A UI should prefer `messageCode`. */
    message: string;
    /** Catalog key for the same message, translated at the display boundary
     *  (the same split `CodedError` uses for thrown errors). `messageParams`
     *  carries the numbers the sentence interpolates. */
    messageCode: string;
    messageParams?: Record<string, string | number>;
    /** Contrast issues: the measured ratio and the WCAG AA minimum it missed. */
    ratio?: number;
    required?: number;
}
/** Text below this point size is flagged as hard to read. */
export declare const MIN_READABLE_FONT = 12;
/** WCAG 2.2 (2.5.8) minimum target size for interactive elements, in CSS px. */
export declare const MIN_TOUCH_TARGET = 24;
/** Audit a design file. Returns one issue per problem, in page/visit order. */
export declare function checkAccessibility(doc: DesignFile): A11yIssue[];
export interface A11ySummary {
    total: number;
    errors: number;
    warnings: number;
    byKind: Record<A11yKind, number>;
    /** True when there are no error-severity issues (warnings allowed). */
    passes: boolean;
}
/** Roll up an issue list into counts for the accessibility panel/score. */
export declare function summarizeAccessibility(issues: A11yIssue[]): A11ySummary;
