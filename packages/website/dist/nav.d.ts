import type { ElementLink, Page } from "@hc/schema";
import type { NavItem, Site } from "./types";
/** Kebab-case a string for use as a URL slug: lowercased, non-alphanumeric runs
 *  collapsed to single hyphens, trimmed of leading/trailing hyphens. */
export declare function kebab(s: string): string;
/** Slug for a page: kebab of its name, or `page-N` (1-based) when unnamed. */
export declare function pageSlug(page: Page, index: number): string;
/** Resolve the href for a page given a slug. The home page maps to "/", any
 *  other page to "/<slug>/". A trailing slash keeps relative anchors stable. */
export declare function pageHref(slug: string, isHome: boolean): string;
/** Context the nav/link resolvers need: a slug per page id, plus the home id. */
export interface NavContext {
    /** Maps a page id to its slug (already computed, see `pageSlug`). */
    slugForPage: (pageId: string) => string | undefined;
    homePageId?: string;
}
/** Resolve a NavItem to an href string. */
export declare function resolveNavHref(item: NavItem, ctx: NavContext): string;
/** A flattened nav entry ready to emit as a menu link, with nested children. */
export interface ResolvedNavItem {
    label: string;
    href: string;
    children: ResolvedNavItem[];
}
/** Build the resolved nav tree for a site. Hidden items are dropped; a nav item
 *  whose page is hidden from nav simply does not appear in `site.nav`. */
export declare function buildNav(site: Site, pages: Page[]): ResolvedNavItem[];
/** Compute the slug for every page in site order, with a fallback to file order.
 *  Slugs are de-duplicated by appending `-N` so two same-named pages stay
 *  distinct (slug collisions are a hard error in hosting; here we just keep them
 *  stable and unique within the bundle). */
export declare function pageSlugMap(site: Site, pages: Page[]): Map<string, string>;
/** Resolve a scene-element link (F25 ElementLink) to an href on the published
 *  site. `page` targets a page id, `anchor` an in-page element id, `url` an
 *  external URL, `email` a mailto. Falls back to "#" for a broken target. */
export declare function resolveElementLink(link: ElementLink, ctx: NavContext): string;
