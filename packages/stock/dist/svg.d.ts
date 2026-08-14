import { type GradientFill, type Node } from "@hc/schema";
/** Build an id -> GradientFill map from an SVG's gradient defs. Resolves
 *  xlink:href/href stop inheritance (common in exporters). */
export declare function parseGradients(svg: string): Record<string, GradientFill>;
export interface SvgToNodesResult {
    nodes: Node[];
    assets: {
        assetId: string;
        url: string;
    }[];
    approximated: boolean;
}
export declare function svgToNodes(svg: string, idGen?: () => string, opts?: {
    fallbackFill?: boolean;
    gradients?: Record<string, GradientFill>;
}): SvgToNodesResult;
