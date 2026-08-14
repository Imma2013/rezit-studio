import type { MockupTemplate } from "./types";
export interface PlacementTransform {
    /** Uniform scale applied to the design's normalized box to fit the surface. */
    scale: number;
    /** Translation (in normalized surface units, 0..1) to centre the design. */
    offsetX: number;
    offsetY: number;
    /** Fit mode: contain so the whole design is visible on the surface. */
    mode: "contain";
}
export interface Placement {
    /** Warp mesh control points from the template (passthrough; identity grid when
     *  the template has none). number[][] of [x,y] pairs in normalized units. */
    warpMesh: number[][];
    /** Mask key identifying the surface cutout in the template. */
    maskKey: string;
    /** Lighting key for the compositing pass, when the template declares one. */
    lightingKey?: string;
    /** The transform that maps the design's box into the surface box. */
    transform: PlacementTransform;
}
/**
 * Place a design (given as an aspect ratio, width/height) onto a mockup
 * template's surface. The design is contained within the surface box (whose
 * aspect comes from `template.surfaceAspect`, default 1), centred, with the
 * warp mesh + mask passed through for the compositing job.
 */
export declare function placeOnTemplate(designAspect: number, template: MockupTemplate): Placement;
/** The output image size (px) of a rendered mockup for `template`. */
export declare function mockupOutputSize(template: MockupTemplate): {
    width: number;
    height: number;
};
