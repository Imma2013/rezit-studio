import { type DesignFile, type Node } from "@hc/schema";
import type { Scene } from "./types";
/** Maximum outward bleed (in local px) a node's effects add to its bounds. */
export declare function effectBleed(node: Node): number;
/** Build an in-memory scene from a design file (FR-1). */
export declare function createScene(file: DesignFile, pageIndex?: number): Scene;
