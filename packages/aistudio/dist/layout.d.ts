import { type Fill, type Node } from "@hc/schema";
import type { AiDesignSpec } from "./spec";
export interface Size {
    width: number;
    height: number;
}
export interface LayoutResult {
    background: Fill;
    nodes: Node[];
}
export declare function layoutDesign(spec: AiDesignSpec, size: Size): LayoutResult;
