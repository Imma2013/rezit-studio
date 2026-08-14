import type { AuthIdentity, User } from "./types";
export interface IncomingIdentity {
    provider: AuthIdentity["provider"];
    providerSubject: string;
    email: string;
    emailVerified: boolean;
}
export type IdentityResolution = {
    action: "login";
    userId: string;
    identityId: string;
} | {
    action: "link";
    userId: string;
} | {
    action: "verify-required";
    userId: string;
} | {
    action: "create";
};
/**
 * Resolve how an incoming auth identity maps to accounts:
 * - exact (provider, subject) hit -> login;
 * - else a user with the same VERIFIED email -> link (if incoming is verified too);
 * - else a same-email collision where either side is unverified -> verify-required;
 * - else -> create.
 */
export declare function resolveIdentity(identities: AuthIdentity[], users: User[], incoming: IncomingIdentity): IdentityResolution;
