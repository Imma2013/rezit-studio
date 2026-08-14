import type { Page } from "@hc/schema";
import type { Site } from "./types";
export interface MetaContext {
    /** Resolve an asset id (favicon / OG image) to a URL; absent -> omit the tag. */
    resolveAssetUrl?: (assetId: string) => string | undefined;
    /** Base URL for absolute canonical/OG tags, e.g. https://slug.hycanvas.site. */
    baseUrl?: string;
}
/** Build the <head> meta tags for one page, merging per-page SEO overrides over
 *  the site defaults and emitting Open Graph + Twitter + favicon tags. */
export declare function metaTags(site: Site, page: Page, ctx?: MetaContext): string;
/** schema.org JSON-LD structured data (WebSite + WebPage) for richer search
 *  results (FR-7). Returns a ready-to-embed <script type="application/ld+json">
 *  block, or "" when there is nothing meaningful to describe. */
export declare function jsonLd(site: Site, page: Page, ctx?: MetaContext): string;
/** Generate a sitemap.xml listing every visible page at its absolute URL. */
export declare function sitemapXml(site: Site, pages: Page[], baseUrl: string): string;
/** Generate robots.txt. Disallows everything when SEO robots is "noindex";
 *  otherwise allows all and points at the sitemap. */
export declare function robotsTxt(site: Site, baseUrl: string): string;
