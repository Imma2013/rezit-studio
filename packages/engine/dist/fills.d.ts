import type { Color, Fill } from "@hc/schema";
import type { CanvasGradientLike, CanvasLike } from "./types";
/** A fillStyle/strokeStyle value for a fill over a node box of size w x h. */
export declare function resolveFill(ctx: CanvasLike, fill: Fill, w: number, h: number): string | CanvasGradientLike;
export type { Color };
