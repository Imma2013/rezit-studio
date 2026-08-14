"use strict";
// Identity linking. The same email arriving via
// password and via Google must resolve to one account: identities link by
// VERIFIED email; an unverified collision must verify first before linking.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveIdentity = resolveIdentity;
function norm(email) {
    return email.trim().toLowerCase();
}
/**
 * Resolve how an incoming auth identity maps to accounts:
 * - exact (provider, subject) hit -> login;
 * - else a user with the same VERIFIED email -> link (if incoming is verified too);
 * - else a same-email collision where either side is unverified -> verify-required;
 * - else -> create.
 */
function resolveIdentity(identities, users, incoming) {
    const existing = identities.find((i) => i.provider === incoming.provider && i.providerSubject === incoming.providerSubject);
    if (existing)
        return { action: "login", userId: existing.userId, identityId: existing.id };
    const email = norm(incoming.email);
    const sameEmailUser = users.find((u) => norm(u.email) === email);
    if (sameEmailUser) {
        if (incoming.emailVerified && sameEmailUser.emailVerified) {
            return { action: "link", userId: sameEmailUser.id };
        }
        return { action: "verify-required", userId: sameEmailUser.id };
    }
    return { action: "create" };
}
