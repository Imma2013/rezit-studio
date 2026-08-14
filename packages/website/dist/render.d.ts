import type { Node, Page, Transform } from "@hc/schema";
import { type NavContext } from "./nav";
import type { FormBlock } from "./types";
/** A per-breakpoint override on a node (read from an optional `responsive`
 *  field on the scene node; round-trips in the open file format). */
export interface ResponsiveOverride {
    transform?: Partial<Transform>;
    size?: {
        width?: number;
        height?: number;
    };
    hidden?: boolean;
}
export type Breakpoint = "tablet" | "mobile";
export interface Breakpoints {
    desktop: number;
    tablet: number;
    mobile: number;
}
export declare const DEFAULT_BREAKPOINTS: Breakpoints;
export interface RenderContext {
    /** Resolve an asset id (or a direct url) to a servable URL. */
    resolveAssetUrl: (assetIdOrUrl: string) => string;
    /** Resolve a scene element link to an href (page/anchor/external/email). */
    navContext?: NavContext;
    breakpoints?: Breakpoints;
    /** Form blocks keyed by node id, when forms live outside the scene graph. */
    formsByNodeId?: Record<string, FormBlock>;
}
/** Render one node as a positioned element with inline CSS. */
export declare function renderNode(node: Node, ctx: RenderContext): string;
/** Render a page's scene to a positioned HTML fragment (the page wrapper). */
export declare function renderPageHtml(page: Page, ctx: RenderContext): string;
/** Base + media-query CSS for one page's responsive behavior. When nodes carry
 *  per-breakpoint overrides we emit those; otherwise the page scales
 *  proportionally to the viewport width within each breakpoint. */
export declare function renderResponsiveCss(page: Page, ctx: RenderContext): string;
/** A file in the rendered static bundle. */
export interface RenderedFile {
    path: string;
    contentType: string;
    body: string;
}
export interface RenderSiteResult {
    files: RenderedFile[];
}
import { pageHref } from "./nav";
import type { Site } from "./types";
/** Render an entire site to a static bundle: one HTML file per page (home at
 *  index.html), a shared site.css, sitemap.xml, robots.txt, and runtime.js. */
export declare function renderSite(site: Site, pages: Page[], ctx: RenderContext): RenderSiteResult;
export { pageHref };
