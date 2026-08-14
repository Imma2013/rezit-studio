import type { Site, SiteRelease } from "./types";
/** The next monotonic version number given the existing releases (1-based). */
export declare function nextVersion(releases: SiteRelease[]): number;
/** The site's current live release, resolved from `currentReleaseId`. Falls back
 *  to the highest-version release when the pointer is unset, and to null when
 *  there are no releases at all. */
export declare function currentRelease(site: Site, releases: SiteRelease[]): SiteRelease | null;
/** Build a release record for a new publish (does not persist). */
export declare function makeRelease(site: Site, releases: SiteRelease[], fields: {
    id: string;
    bundleKey?: string;
    publishedBy?: string;
    publishedAt?: string;
}): SiteRelease;
/** Resolve the release to roll back to, by id. Returns null when not found. */
export declare function releaseById(releases: SiteRelease[], releaseId: string): SiteRelease | null;
