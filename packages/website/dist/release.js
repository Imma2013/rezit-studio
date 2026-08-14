"use strict";
// Immutable-release / rollback helpers (FR-13). Pure, storage-free: the actual
// bundle upload and `current_release_id` repoint live in the backend; these
// compute version numbers and resolve which release is current.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextVersion = nextVersion;
exports.currentRelease = currentRelease;
exports.makeRelease = makeRelease;
exports.releaseById = releaseById;
/** The next monotonic version number given the existing releases (1-based). */
function nextVersion(releases) {
    let max = 0;
    for (const r of releases) {
        if (r.version > max)
            max = r.version;
    }
    return max + 1;
}
/** The site's current live release, resolved from `currentReleaseId`. Falls back
 *  to the highest-version release when the pointer is unset, and to null when
 *  there are no releases at all. */
function currentRelease(site, releases) {
    if (site.currentReleaseId) {
        const byId = releases.find((r) => r.id === site.currentReleaseId);
        if (byId)
            return byId;
    }
    if (releases.length === 0)
        return null;
    return releases.reduce((a, b) => (b.version > a.version ? b : a));
}
/** Build a release record for a new publish (does not persist). */
function makeRelease(site, releases, fields) {
    return {
        id: fields.id,
        siteId: site.id ?? "",
        version: nextVersion(releases),
        bundleKey: fields.bundleKey,
        publishedBy: fields.publishedBy,
        publishedAt: fields.publishedAt,
    };
}
/** Resolve the release to roll back to, by id. Returns null when not found. */
function releaseById(releases, releaseId) {
    return releases.find((r) => r.id === releaseId) ?? null;
}
