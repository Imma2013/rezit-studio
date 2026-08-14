import type { DesignFile } from "@hc/schema";
export interface LottieOptions {
    /** Frame rate of the exported animation (default 30). */
    fps?: number;
    /** Override the animation length in ms (default: the page's animated duration). */
    durationMs?: number;
}
export interface LottieDocument {
    v: string;
    fr: number;
    ip: number;
    op: number;
    w: number;
    h: number;
    nm: string;
    ddd: 0;
    assets: [];
    layers: LottieLayer[];
}
interface Keyed {
    a: 0 | 1;
    k: number | number[] | LottieKeyframe[];
}
interface LottieKeyframe {
    t: number;
    s: number[];
    i?: {
        x: number[];
        y: number[];
    };
    o?: {
        x: number[];
        y: number[];
    };
}
interface LottieLayer {
    ddd: 0;
    ind: number;
    ty: 4;
    nm: string;
    sr: 1;
    ks: {
        o: Keyed;
        r: Keyed;
        p: Keyed;
        a: Keyed;
        s: Keyed;
    };
    shapes: object[];
    ip: number;
    op: number;
    st: 0;
    bm: 0;
}
/** Convert one design page into a Lottie animation document. Static (un-animated)
 *  nodes are still emitted as layers with constant transforms, so the exported
 *  Lottie is a faithful, self-contained render of the page. */
export declare function designPageToLottie(file: DesignFile, pageIndex: number, opts?: LottieOptions): LottieDocument;
export {};
