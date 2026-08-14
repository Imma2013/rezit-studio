import type { DesignFile } from "@hc/schema";
import type { CanvasLike, Viewport } from "./types";
/** A CanvasLike that does nothing: every draw call is a no-op and every state
 *  setter is ignored. Lets the benchmark exercise the full render traversal and
 *  call dispatch without a real rasterizer. */
export declare function createNullContext(): CanvasLike;
export interface BenchResult {
    /** Number of top-level nodes on the benchmarked page. */
    nodeCount: number;
    /** Frames timed (after warmup). */
    frames: number;
    /** Mean frame time in milliseconds. */
    avgMs: number;
    /** Fastest / slowest frame (ms). */
    minMs: number;
    maxMs: number;
    /** Frames-per-second implied by the mean frame time. */
    fps: number;
}
export interface BenchOptions {
    viewport?: Partial<Viewport>;
    /** Timed frames (default 60). */
    frames?: number;
    /** Untimed warmup frames to prime caches/JIT (default 5). */
    warmup?: number;
    /** Which page to render (default 0). The editor paints one page per frame. */
    pageIndex?: number;
    /** Monotonic clock; defaults to performance.now / Date.now. */
    now?: () => number;
}
/** Scene-build (load) cost for a multi-page design: builds every page's scene
 *  graph once and reports the total + per-page mean. This is the SCALE/load
 *  number (a 50-page design materializes every page into the one Y.Doc today, no
 *  subdocuments), distinct from the per-frame render cost which only touches the
 *  open page. Like benchmarkRender it measures CPU only (no rasterizer). */
export declare function benchmarkSceneBuild(file: DesignFile, opts?: {
    now?: () => number;
}): {
    pages: number;
    totalMs: number;
    perPageMs: number;
};
/** Render `file` repeatedly against a null context and report frame timings.
 *  Benches the page at `opts.pageIndex` (default 0); the editor only paints the
 *  current page per frame, so this is the 60fps-relevant per-frame cost. */
export declare function benchmarkRender(file: DesignFile, opts?: BenchOptions): BenchResult;
