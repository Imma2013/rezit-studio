"use strict";
// Navigation and link resolution (FR-3/FR-4). Pure mapping from the site nav
// model and per-element links (F25 ElementLink) to published-output hrefs.
Object.defineProperty(exports, "__esModule", { value: true });
exports.kebab = kebab;
exports.pageSlug = pageSlug;
exports.pageHref = pageHref;
exports.resolveNavHref = resolveNavHref;
exports.buildNav = buildNav;
exports.pageSlugMap = pageSlugMap;
exports.resolveElementLink = resolveElementLink;
const html_1 = require("./html");
/** Kebab-case a string for use as a URL slug: lowercased, non-alphanumeric runs
 *  collapsed to single hyphens, trimmed of leading/trailing hyphens. */
function kebab(s) {
    return s
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
/** Slug for a page: kebab of its name, or `page-N` (1-based) when unnamed. */
function pageSlug(page, index) {
    const fromName = page.name ? kebab(page.name) : "";
    return fromName || `page-${index + 1}`;
}
/** Resolve the href for a page given a slug. The home page maps to "/", any
 *  other page to "/<slug>/". A trailing slash keeps relative anchors stable. */
function pageHref(slug, isHome) {
    return isHome ? "/" : `/${slug}/`;
}
/** Resolve a NavItem to an href string. */
function resolveNavHref(item, ctx) {
    const t = item.target;
    switch (t.kind) {
        case "page": {
            const slug = ctx.slugForPage(t.pageId);
            if (slug === undefined)
                return "#";
            return pageHref(slug, t.pageId === ctx.homePageId);
        }
        case "anchor": {
            const anchor = t.anchor ?? "";
            if (t.pageId && t.pageId !== ctx.homePageId) {
                const slug = ctx.slugForPage(t.pageId);
                if (slug !== undefined)
                    return `${pageHref(slug, false)}#${anchor}`;
            }
            return `#${anchor}`;
        }
        case "external":
            return (0, html_1.safeUrl)(t.url);
        default:
            return "#";
    }
}
/** Build the resolved nav tree for a site. Hidden items are dropped; a nav item
 *  whose page is hidden from nav simply does not appear in `site.nav`. */
function buildNav(site, pages) {
    const slugByPage = pageSlugMap(site, pages);
    const ctx = {
        slugForPage: (id) => slugByPage.get(id),
        homePageId: site.homePageId,
    };
    const walk = (items) => items
        .filter((it) => it.visible !== false)
        .map((it) => ({
        label: it.label,
        href: resolveNavHref(it, ctx),
        children: it.children ? walk(it.children) : [],
    }));
    return walk(site.nav ?? []);
}
/** Compute the slug for every page in site order, with a fallback to file order.
 *  Slugs are de-duplicated by appending `-N` so two same-named pages stay
 *  distinct (slug collisions are a hard error in hosting; here we just keep them
 *  stable and unique within the bundle). */
function pageSlugMap(site, pages) {
    const byId = new Map(pages.map((p) => [p.id, p]));
    const order = site.pageOrder && site.pageOrder.length > 0 ? site.pageOrder : pages.map((p) => p.id);
    const out = new Map();
    const used = new Set();
    let i = 0;
    for (const id of order) {
        const page = byId.get(id);
        if (!page)
            continue;
        let slug = pageSlug(page, i);
        if (used.has(slug)) {
            let n = 2;
            while (used.has(`${slug}-${n}`))
                n++;
            slug = `${slug}-${n}`;
        }
        used.add(slug);
        out.set(id, slug);
        i++;
    }
    return out;
}
/** Resolve a scene-element link (F25 ElementLink) to an href on the published
 *  site. `page` targets a page id, `anchor` an in-page element id, `url` an
 *  external URL, `email` a mailto. Falls back to "#" for a broken target. */
function resolveElementLink(link, ctx) {
    switch (link.kind) {
        case "page": {
            const slug = ctx.slugForPage(link.target);
            if (slug === undefined)
                return "#";
            return pageHref(slug, link.target === ctx.homePageId);
        }
        case "anchor":
            return `#${link.target}`;
        case "email":
            return link.target.startsWith("mailto:") ? link.target : `mailto:${link.target}`;
        case "url":
            return (0, html_1.safeUrl)(link.target);
        default:
            return "#";
    }
}
