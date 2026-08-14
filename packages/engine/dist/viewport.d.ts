import type { Point, Rect } from "./math";
import type { Size } from "@hc/schema";
import type { Viewport } from "./types";
export declare function defaultViewport(width: number, height: number, dpr?: number): Viewport;
export declare function pageToScreen(vp: Viewport, p: Point): Point;
export declare function screenToPage(vp: Viewport, p: Point): Point;
/** The page-space rectangle currently visible in the viewport. */
export declare function visiblePageRect(vp: Viewport): Rect;
export type FitMode = "fit" | "fill" | "1:1" | number;
/** Frame the page per `mode`. `fit` leaves a small margin; `fill` covers the
 *  viewport; `1:1` maps one page px to one CSS px; a number sets explicit zoom. */
export declare function fit(vp: Viewport, pageSize: Size, mode: FitMode): Viewport;
/**
 * Change zoom while keeping the page point under `focalScreen` fixed on screen
 * (focal-point-preserving zoom). `focalScreen` defaults to the viewport center.
 */
export declare function zoomTo(vp: Viewport, newZoom: number, focalScreen?: Point): Viewport;
/** Pan by a screen-space delta (e.g. a drag), preserving zoom. */
export declare function panBy(vp: Viewport, dxScreen: number, dyScreen: number): Viewport;
