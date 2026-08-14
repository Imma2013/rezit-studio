"use strict";
// @hc/sdk - typed client for the HyCanvas REST API (served under /api/v1).
// Used by the web app (cookie auth, credentials: "include") and by third-party
// integrators (bearer token). See docs 15/04/11/36.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyCanvasClient = exports.ApiError = void 0;
/** The X-Captcha-Token header the auth endpoints check, or {} when no token. */
function captchaHeaders(token) {
    return token ? { headers: { "x-captcha-token": token } } : undefined;
}
/** Thrown on a non-2xx response; carries the status and parsed problem body. */
class ApiError extends Error {
    constructor(status, path, body) {
        super(`HyCanvas API ${status} on ${path}`);
        this.status = status;
        this.path = path;
        this.body = body;
        this.name = "ApiError";
    }
}
exports.ApiError = ApiError;
class HyCanvasClient {
    constructor(opts) {
        // De-duped in-flight refresh: concurrent 401s share one refresh, then retry.
        this.refreshing = null;
        this.baseUrl = opts.baseUrl.replace(/\/$/, "");
        this.token = opts.token;
        this.credentials = opts.credentials ?? "same-origin";
        // Wrap fetch so the global is always called as a bare function, never as a
        // method of this client. Browsers brand-check fetch's receiver and throw
        // "TypeError: Illegal invocation" if `this` isn't the Window/Worker global,
        // which would surface as a thrown error with no request ever sent. (Node's
        // fetch has no such check, so this only bit in the browser.)
        const impl = opts.fetch ?? fetch;
        this.fetchImpl = (input, init) => impl(input, init);
    }
    /** Set/clear the bearer token (no-op for cookie auth). */
    setToken(token) {
        this.token = token;
    }
    async request(method, path, body, opts, retried = false) {
        const headers = {};
        if (body !== undefined)
            headers["content-type"] = "application/json";
        if (this.token)
            headers.authorization = `Bearer ${this.token}`;
        if (opts?.headers)
            Object.assign(headers, opts.headers);
        const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers,
            credentials: this.credentials,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        // Cookie-auth sessions: the short-lived access token expires well before the
        // refresh token. On a 401, transparently refresh once (using the refresh
        // cookie) and retry the original request, so callers never see a spurious
        // auth failure mid-session. Auth endpoints are excluded to avoid loops (a
        // 401 from login/refresh is a real failure).
        if (res.status === 401 && !retried && !path.startsWith("/v1/auth/")) {
            if (await this.tryRefresh())
                return this.request(method, path, body, opts, true);
        }
        if (!res.ok) {
            let parsed = undefined;
            try {
                parsed = await res.json();
            }
            catch {
                /* non-JSON error body */
            }
            throw new ApiError(res.status, path, parsed);
        }
        if (res.status === 204)
            return undefined;
        const text = await res.text();
        return (text ? JSON.parse(text) : undefined);
    }
    /** Refresh the session once, de-duping concurrent callers. Resolves true when
     *  a new access cookie was minted (caller may retry). */
    tryRefresh() {
        if (!this.refreshing) {
            this.refreshing = this.fetchImpl(`${this.baseUrl}/v1/auth/refresh`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: this.credentials,
                body: "{}",
            })
                .then((r) => r.ok)
                .catch(() => false)
                .finally(() => {
                this.refreshing = null;
            });
        }
        return this.refreshing;
    }
    // --- health --------------------------------------------------------------
    health() {
        return this.request("GET", "/healthz");
    }
    // --- auth -------------------------------------------------------
    signup(input, captchaToken) {
        return this.request("POST", "/v1/auth/signup", input, captchaHeaders(captchaToken));
    }
    /**
     * Sign in with email + password. If the account has MFA enabled the server
     * returns `{ mfaRequired: true, mfaToken }` and sets no session cookie; the
     * client must then call `verifyMfa(mfaToken, code)` to finish signing in.
     * `captchaToken` is required when the instance has a CAPTCHA on the auth forms.
     */
    login(input, captchaToken) {
        return this.request("POST", "/v1/auth/login", input, captchaHeaders(captchaToken));
    }
    // --- MFA: TOTP + recovery codes ----------------------------
    /** Begin TOTP enrollment; returns the otpauth URL (for a QR) and raw secret. */
    enrollMfa() {
        return this.request("POST", "/v1/auth/mfa/enroll", {});
    }
    /** Confirm enrollment with a code; returns the one-time recovery codes. */
    confirmMfa(code) {
        return this.request("POST", "/v1/auth/mfa/confirm", { code });
    }
    /** Disable MFA after proving a current TOTP code or an unused recovery code. */
    disableMfa(code) {
        return this.request("POST", "/v1/auth/mfa/disable", { code });
    }
    /** Finish an MFA-gated login; sets the session cookies like login. */
    verifyMfa(mfaToken, code) {
        return this.request("POST", "/v1/auth/mfa/verify", { mfaToken, code });
    }
    /** Refresh the session, sharing the same de-duped in-flight refresh as the
     *  automatic 401 retry. Parallel refresh POSTs carrying the same cookie race
     *  the server-side rotation and can strand the browser on a dead token, so
     *  every caller (401 interceptor, bootstrap, tabs) must funnel through one
     *  request. Resolves { ok: false } instead of throwing on failure. */
    async refresh() {
        return { ok: await this.tryRefresh() };
    }
    logout(all = false) {
        return this.request("POST", "/v1/auth/logout", { all });
    }
    /** Update the signed-in user's profile: name, avatar, locale, and the regional
     *  preferences (timezone, timeFormat, weekStart). Pass `avatarUrl: ""` to clear
     *  the avatar. Omitted fields are left unchanged. Returns the refreshed user. */
    updateProfile(input) {
        return this.request("PATCH", "/v1/me", input);
    }
    me() {
        return this.request("GET", "/v1/me");
    }
    sessions() {
        return this.request("GET", "/v1/auth/sessions");
    }
    // --- account data portability -----------------------------
    /** Download a full export of the user's data (profile, workspaces, designs). */
    exportAccount() {
        return this.request("GET", "/v1/account/export");
    }
    /**
     * Permanently delete the account after re-authentication. Always requires the
     * current password; `code` is a TOTP or recovery code when MFA is enabled.
     */
    deleteAccount(input) {
        return this.request("DELETE", "/v1/account", input);
    }
    // --- email flows -------------------------------------------
    /** Request (or re-send) an email-verification link. Always resolves. */
    requestEmailVerification(email) {
        return this.request("POST", "/v1/auth/verify-email/request", { email });
    }
    /** Verify an email with the token from the link; returns the updated user. */
    verifyEmail(token) {
        return this.request("POST", "/v1/auth/verify-email", { token });
    }
    /** Request a password-reset link. Always resolves (no account enumeration). */
    requestPasswordReset(email, captchaToken) {
        return this.request("POST", "/v1/auth/password-reset/request", { email }, captchaHeaders(captchaToken));
    }
    /** Set a new password using the token from the reset link. */
    resetPassword(token, password) {
        return this.request("POST", "/v1/auth/password-reset", { token, password });
    }
    /** Request a passwordless sign-in link. Always resolves (no enumeration). */
    requestMagicLink(email, captchaToken) {
        return this.request("POST", "/v1/auth/magic-link/request", { email }, captchaHeaders(captchaToken));
    }
    /** Complete a magic-link sign-in; sets the session cookies like login. */
    magicLink(token) {
        return this.request("POST", "/v1/auth/magic-link", { token });
    }
    /** Enabled social sign-in providers (empty unless configured server-side).
     *  The login UI renders a button per entry; start the flow by navigating the
     *  browser to `${baseUrl}/v1/auth/{id}/start`. */
    authProviders() {
        return this.authConfig().then((r) => r.providers);
    }
    /** The instance's auth configuration: the SSO providers plus which sign-in
     *  methods and account-creation paths are enabled (AUTH_*_ENABLED). The sign-in
     *  page renders only the methods the policy allows. */
    authConfig() {
        return this.request("GET", "/v1/auth/providers");
    }
    /** SSO status for the signed-in user: whether an OIDC identity is linked and
     *  whether SSO is configured at all (so the UI can hide the card when it isn't).
     *  Start the connect flow by navigating to `${baseUrl}/v1/auth/oidc/link`. */
    oidcIdentity() {
        return this.request("GET", "/v1/auth/oidc/identity");
    }
    /** Disconnect the caller's SSO identity. Refused (409) if SSO is their only
     *  way to sign in (no password set), to avoid locking them out. */
    disconnectOidc() {
        return this.request("DELETE", "/v1/auth/oidc/identity");
    }
    /** Dev-only: read the in-memory mail outbox (404/403 in production). */
    devOutbox() {
        return this.request("GET", "/v1/auth/dev/outbox");
    }
    // --- workspaces -------------------------------------------------
    listWorkspaces() {
        return this.request("GET", "/v1/workspaces");
    }
    createWorkspace(input) {
        return this.request("POST", "/v1/workspaces", input);
    }
    /** Permanently delete a team/org/classroom workspace and everything in it
     *  (owner only; personal workspaces cannot be deleted). */
    deleteWorkspace(workspaceId) {
        return this.request("DELETE", `/v1/workspaces/${workspaceId}`);
    }
    workspaceMembers(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/members`);
    }
    invite(workspaceId, input) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/invitations`, input);
    }
    acceptInvitation(token) {
        return this.request("POST", `/v1/invitations/${encodeURIComponent(token)}/accept`, {});
    }
    /** The signed-in user's own pending invitations (for the in-app accept/decline surface). */
    myInvitations() {
        return this.request("GET", "/v1/invitations/mine");
    }
    /** Accept (true) or decline (false) one of the caller's invitations by id. */
    respondToInvitation(invitationId, accept) {
        return this.request("POST", `/v1/invitations/${invitationId}/respond`, { accept });
    }
    workspaceInvitations(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/invitations`);
    }
    revokeInvitation(workspaceId, invitationId) {
        return this.request("DELETE", `/v1/workspaces/${workspaceId}/invitations/${invitationId}`);
    }
    changeMemberRole(workspaceId, userId, role) {
        return this.request("PATCH", `/v1/workspaces/${workspaceId}/members/${userId}`, { role });
    }
    removeMember(workspaceId, userId) {
        return this.request("DELETE", `/v1/workspaces/${workspaceId}/members/${userId}`);
    }
    // --- home + search ----------------------------------------------
    home(workspaceId, section = "recent") {
        return this.request("GET", `/v1/workspaces/${workspaceId}/home?section=${section}`);
    }
    search(workspaceId, q, type) {
        const params = new URLSearchParams({ workspaceId });
        if (q)
            params.set("q", q);
        if (type)
            params.set("type", Array.isArray(type) ? type.join(",") : type);
        return this.request("GET", `/v1/search?${params.toString()}`);
    }
    /** Star/unstar a design for the current user; returns the resulting state. */
    toggleFavorite(designId, on) {
        return this.request(on ? "POST" : "DELETE", `/v1/designs/${designId}/favorite`);
    }
    // --- designs ----------------------------------------------------
    createDesign(input) {
        return this.request("POST", "/v1/designs", input);
    }
    getDesign(id) {
        return this.request("GET", `/v1/designs/${id}`);
    }
    renameDesign(id, title) {
        return this.request("PATCH", `/v1/designs/${id}`, { title });
    }
    /** Fetch the design's current file. `trashed: true` lets workspace members
     *  read a design that sits in the trash (Trash-view preview thumbnails). */
    getDesignFile(id, opts) {
        return this.request("GET", `/v1/designs/${id}/file${opts?.trashed ? "?trashed=1" : ""}`);
    }
    saveSnapshot(id, input) {
        return this.request("POST", `/v1/designs/${id}/snapshots`, input);
    }
    /** A page of a design's version history, newest first. Each
     *  entry carries its resolved author, kind, label, and timestamp. Pass the
     *  returned `nextCursor` to lazy-load older pages. */
    listVersions(id, cursor) {
        return this.request("GET", `/v1/designs/${id}/versions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
    }
    /** A historical version's DesignFile for READ-ONLY preview. Does
     *  not mutate the live design; the time machine loads it into the canvas under
     *  a preview banner. */
    versionFile(id, versionId) {
        return this.request("GET", `/v1/designs/${id}/versions/${versionId}/file`);
    }
    /** The append-only CRDT update log in ascending seq order (FR-9): the raw
     *  y-protocols frames the client folds into an ephemeral Y.Doc to scrub
     *  history. Pass the returned `nextSeq` as `afterSeq` to page forward.
     *  `branch` selects an in-CRDT branch's lineage (FR-10): the parent prefix up
     *  to the fork plus the branch's own rows, one ascending seq stream. */
    designUpdates(id, afterSeq, limit, branch) {
        const q = new URLSearchParams();
        if (afterSeq)
            q.set("afterSeq", String(afterSeq));
        if (limit)
            q.set("limit", String(limit));
        if (branch)
            q.set("branch", branch);
        const qs = q.toString();
        return this.request("GET", `/v1/designs/${id}/updates${qs ? `?${qs}` : ""}`);
    }
    /** Journal a CRDT full-state checkpoint and compact the update log (FR-11):
     *  older rows are deleted server-side, so the log stays bounded. `update` is a
     *  base64 y-protocols update frame from the live Y.Doc (encodeStateAsUpdate).
     *  `branch` scopes the checkpoint (and its compaction) to that in-CRDT
     *  branch's own lineage. */
    checkpointDesign(id, update, branch) {
        const qs = branch ? `?branch=${encodeURIComponent(branch)}` : "";
        return this.request("POST", `/v1/designs/${id}/updates/checkpoint${qs}`, { update });
    }
    /** The design's in-CRDT named branches (FR-10), oldest first. Distinct from
     *  {@link listBranches}, the fork model (new designs copied from a version). */
    listCrdtBranches(id) {
        return this.request("GET", `/v1/designs/${id}/crdt-branches`);
    }
    /** Fork a named in-CRDT branch at a history point (FR-10). `forkedFromSeq` is
     *  a seq of the parent lineage (0 = the empty beginning); `parentBranchId`
     *  nests a branch under another branch (default: the main lineage). Purely
     *  additive: existing history is never touched. */
    createCrdtBranch(id, input) {
        return this.request("POST", `/v1/designs/${id}/crdt-branches`, input);
    }
    /** Restore a prior version as a NEW snapshot (kind 'restore'), making it the
     *  current state without discarding anything. Distinct from
     *  {@link restoreDesign}, which un-trashes a soft-deleted design. */
    restoreVersion(id, versionId) {
        return this.request("POST", `/v1/designs/${id}/versions/${versionId}/restore`, {});
    }
    /** Create a new design branched from a history point.
     *  Returns the new design; the source is left untouched. */
    branchFromVersion(id, versionId, name) {
        return this.request("POST", `/v1/designs/${id}/versions/${versionId}/branch`, name ? { title: name } : {});
    }
    /** Designs branched off this design, for the branch switcher. */
    listBranches(id) {
        return this.request("GET", `/v1/designs/${id}/branches`);
    }
    deleteDesign(id, purge = false) {
        return this.request("DELETE", `/v1/designs/${id}${purge ? "?purge=true" : ""}`);
    }
    restoreDesign(id) {
        return this.request("POST", `/v1/designs/${id}/restore`, {});
    }
    listTrash(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/trash`);
    }
    // --- sharing + permissions --------------------------------------
    /** The caller's resolved access (mode + capabilities) to a design (FR-7). */
    designAccess(designId) {
        return this.request("GET", `/v1/designs/${designId}/access`);
    }
    /** The full Share dialog payload: the caller's access plus grants, links, and
     *  in-scope custom roles (FR-5). */
    designSharing(designId) {
        return this.request("GET", `/v1/designs/${designId}/sharing`);
    }
    /** Grant a member (by user id) or invitee (by email) access at a mode (FR-5). */
    addGrant(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/grants`, input);
    }
    updateGrant(grantId, patch) {
        return this.request("PATCH", `/v1/grants/${grantId}`, patch);
    }
    removeGrant(grantId) {
        return this.request("DELETE", `/v1/grants/${grantId}`);
    }
    /** Create a share link at an access mode, optionally password-protected and/or
     *  expiring (FR-5, FR-6). */
    createShareLink(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/links`, input);
    }
    updateShareLink(linkId, patch) {
        return this.request("PATCH", `/v1/links/${linkId}`, patch);
    }
    /** Rotate a link's token: the old URL stops working (FR-6). */
    rotateShareLink(linkId) {
        return this.request("POST", `/v1/links/${linkId}/rotate`, {});
    }
    /** Permanently delete a share link; its URL stops resolving (FR-6). */
    deleteShareLink(linkId) {
        return this.request("DELETE", `/v1/links/${linkId}`);
    }
    /** PUBLIC: resolve a share link by token (FR-6, FR-15). No account needed for a
     *  view/comment link. Throws ApiError 404 (missing/disabled), 410 (expired), or
     *  403 (wrong password / sign-in required). */
    resolveShareLink(token, password) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/resolve`, password ? { password } : {});
    }
    /** PUBLIC: resolve a link and fetch the design file for a read-only open
     *  (FR-15). Backs anonymous view/comment landing. Same denial semantics as
     *  resolveShareLink. */
    resolveShareLinkFile(token, password) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/file`, password ? { password } : {});
    }
    /** List the workspace's custom roles (requires manage-roles, FR-8). */
    listCustomRoles(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/roles`);
    }
    createCustomRole(workspaceId, input) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/roles`, input);
    }
    updateCustomRole(roleId, patch) {
        return this.request("PATCH", `/v1/roles/${roleId}`, patch);
    }
    deleteCustomRole(roleId) {
        return this.request("DELETE", `/v1/roles/${roleId}`);
    }
    /** Assign a custom role to a member on a design at a mode floor (FR-8). */
    assignCustomRole(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/role-assignments`, input);
    }
    /** Request access to a design the caller cannot open; notifies its
     *  owners/admins. Throws ApiError 400 if the caller already has that access. */
    requestAccess(designId, input = {}) {
        return this.request("POST", `/v1/designs/${designId}/access-requests`, input);
    }
    /** List pending access requests for a design (requires the `share` capability). */
    listAccessRequests(designId) {
        return this.request("GET", `/v1/designs/${designId}/access-requests`);
    }
    /** Approve a pending access request, creating a grant (optionally at a chosen mode). */
    approveAccessRequest(requestId, mode) {
        return this.request("POST", `/v1/access-requests/${requestId}/approve`, mode ? { mode } : {});
    }
    /** Deny a pending access request. */
    denyAccessRequest(requestId) {
        return this.request("POST", `/v1/access-requests/${requestId}/deny`, {});
    }
    // --- comments + tasks -----------------------------------
    /** Comment threads for a design (roots with replies, reactions, task info).
     *  Requires the `view` capability; filter narrows open/resolved/mine/assigned. */
    listComments(designId, filter = "all") {
        return this.request("GET", `/v1/designs/${designId}/comments?filter=${filter}`);
    }
    /** People who can be @mentioned or assigned on a design (FR-3, FR-4). */
    mentionablePeople(designId) {
        return this.request("GET", `/v1/designs/${designId}/mentionable`);
    }
    /** Create a comment at an anchor, optionally @mentioning people (FR-1, FR-3).
     *  Requires the `comment` capability (a view/comment user can comment). */
    createComment(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/comments`, input);
    }
    /** Reply to a thread root (FR-2). */
    replyComment(commentId, input) {
        return this.request("POST", `/v1/comments/${commentId}/replies`, input);
    }
    /** Edit a comment's body (author or admin override, FR-2). */
    editComment(commentId, input) {
        return this.request("PATCH", `/v1/comments/${commentId}`, input);
    }
    /** Resolve or reopen a thread (FR-2). */
    resolveComment(commentId, resolved) {
        return this.request("POST", `/v1/comments/${commentId}/resolve`, { resolved });
    }
    /** Delete a comment (author or `delete` capability, FR-2). */
    deleteComment(commentId) {
        return this.request("DELETE", `/v1/comments/${commentId}`);
    }
    /** Toggle an emoji reaction for the current user on a comment (FR-2). */
    reactComment(commentId, emoji) {
        return this.request("POST", `/v1/comments/${commentId}/reactions`, { emoji });
    }
    /** Convert a comment to a task or update its task fields (FR-4). Pass status
     *  null with no assignee to clear the task. */
    setCommentTask(commentId, input) {
        return this.request("PUT", `/v1/comments/${commentId}/task`, input);
    }
    /** Tasks assigned to the current user across their designs (FR-4). */
    myTasks(status) {
        return this.request("GET", `/v1/me/tasks${status ? `?status=${status}` : ""}`);
    }
    /** Comments that @mention the current user across their designs (FR-3). */
    myMentions() {
        return this.request("GET", "/v1/me/mentions");
    }
    // --- approval workflows ---------------------------------
    /** The design's current approval state + the caller's allowed actions (FR-10,
     *  FR-11). `locked` reflects whether the design is approval-locked. */
    designApproval(designId) {
        return this.request("GET", `/v1/designs/${designId}/approval`);
    }
    /** Request approval from one or more approvers under an any/all policy (FR-10).
     *  Requires the `share` or `edit` capability; rejects if one is already active. */
    requestApproval(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/approvals`, input);
    }
    /** Record this approver's decision (FR-10). On grant the design locks (FR-11).
     *  Requires the `approve` capability and being a selected approver. */
    decideApproval(approvalId, input) {
        return this.request("POST", `/v1/approvals/${approvalId}/decide`, input);
    }
    /** Reopen an approved+locked design (FR-11): clears the lock, restores edit.
     *  By owner/admin or a selected approver. */
    reopenApproval(approvalId) {
        return this.request("POST", `/v1/approvals/${approvalId}/reopen`, {});
    }
    // --- whiteboard server-authoritative voting (F30 FR-19/FR-20) -------------
    /** Open a dot-vote round on a board (facilitator/edit only). */
    openVoteSession(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/whiteboard/sessions`, input);
    }
    /** Close/reopen and/or reveal a vote session (facilitator/edit only). */
    setVoteSessionState(designId, sessionId, input) {
        return this.request("POST", `/v1/designs/${designId}/whiteboard/sessions/${sessionId}/state`, input);
    }
    /** Current standings for a session (view level; anonymity/reveal enforced server-side). */
    getVoteTally(designId, sessionId) {
        return this.request("GET", `/v1/designs/${designId}/whiteboard/sessions/${sessionId}`);
    }
    /** Toggle the caller's dot-vote on a node (comment level). 409 when closed or
     *  over budget. Returns the refreshed tally for the caller. */
    castVote(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/whiteboard/votes`, input);
    }
    // --- activity log --------------------------------
    /** The merged, newest-first activity feed for a design (edits folded in from
     *  version history). `type` narrows to one activity type; `cursor` pages. */
    designActivity(designId, opts = {}) {
        const params = new URLSearchParams();
        if (opts.type)
            params.set("type", opts.type);
        if (opts.cursor)
            params.set("cursor", opts.cursor);
        const qs = params.toString();
        return this.request("GET", `/v1/designs/${designId}/activity${qs ? `?${qs}` : ""}`);
    }
    // --- notifications center ------------------------
    /** The caller's notifications, newest-first, paginated. */
    notifications(opts = {}) {
        const params = new URLSearchParams();
        if (opts.unread)
            params.set("unread", "true");
        if (opts.cursor)
            params.set("cursor", opts.cursor);
        const qs = params.toString();
        return this.request("GET", `/v1/notifications${qs ? `?${qs}` : ""}`);
    }
    /** The caller's unread notification count (for the bell badge). */
    unreadNotificationCount() {
        return this.request("GET", "/v1/notifications/unread-count");
    }
    markNotificationRead(id) {
        return this.request("POST", `/v1/notifications/${id}/read`, {});
    }
    markAllNotificationsRead() {
        return this.request("POST", "/v1/notifications/read-all", {});
    }
    /** The caller's notification channel preferences: email + web push (FR-13). */
    notificationPrefs() {
        return this.request("GET", "/v1/me/notification-prefs");
    }
    /** Update the email and/or web-push notification type sets (FR-13). Pass only
     *  the channel(s) you are changing; an omitted channel is left untouched. The
     *  back-compat string-array overload updates the email channel. */
    setNotificationPrefs(input) {
        const body = Array.isArray(input) ? { emailTypes: input } : input;
        return this.request("PUT", "/v1/me/notification-prefs", body);
    }
    // --- web push ---------------------------------------------
    /** The public VAPID key to subscribe with, or null when web push is not
     *  configured server-side (the device toggle is hidden then). */
    pushVapidPublicKey() {
        return this.request("GET", "/v1/push/vapid-public-key");
    }
    /** Register this device's browser push subscription for the current user. */
    pushSubscribe(input) {
        return this.request("POST", "/v1/push/subscribe", input);
    }
    /** Remove a device's push subscription by endpoint. */
    pushUnsubscribe(endpoint) {
        return this.request("POST", "/v1/push/unsubscribe", { endpoint });
    }
    // --- engagement insights -------------------------
    /** Record a view-session heartbeat for an authenticated viewer (FR-14). */
    viewBeat(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/view-beat`, input);
    }
    /** PUBLIC: record an anonymous (share-link) view-session heartbeat (FR-14,
     *  FR-15). Validated by the link token; no account needed. */
    sharedViewBeat(token, input) {
        return this.request("POST", `/v1/shared/${encodeURIComponent(token)}/view-beat`, input);
    }
    /** Aggregated engagement insights for a design (FR-14), member/owner only. */
    designInsights(designId) {
        return this.request("GET", `/v1/designs/${designId}/insights`);
    }
    // --- templates --------------------------------------------------
    /** List templates. Accepts a keyword string (back-compat) or a filter. */
    listTemplates(filter) {
        const f = typeof filter === "string" ? { q: filter } : filter ?? {};
        const params = new URLSearchParams();
        if (f.q)
            params.set("q", f.q);
        if (f.category)
            params.set("category", f.category);
        if (f.collection)
            params.set("collection", f.collection);
        if (f.workspaceId)
            params.set("workspaceId", f.workspaceId);
        const qs = params.toString();
        return this.request("GET", `/v1/templates${qs ? `?${qs}` : ""}`);
    }
    getTemplateFile(id) {
        return this.request("GET", `/v1/templates/${id}/file`);
    }
    /** A template's declared fillable fields, for the bulk-create mapping UI. */
    templateFillableFields(id) {
        return this.request("GET", `/v1/templates/${id}/fillable-fields`);
    }
    /** A design's declared fillable fields. */
    designFillableFields(id) {
        return this.request("GET", `/v1/designs/${id}/fillable-fields`);
    }
    /** Data merge / bulk create: one design per dataset row from a template or
     *  base design. Synchronous + batched; the result reports the
     *  created designs, a truncated flag (when the dataset exceeded the cap), and
     *  any rows skipped for failing field validation. */
    bulkCreate(input) {
        return this.request("POST", "/v1/designs/bulk-create", input);
    }
    /** Poll a background job (export, video render, bulk create, ...) by id. Only
     *  visible to the user that enqueued it (job-status contract). */
    getJob(jobId) {
        return this.request("GET", `/v1/jobs/${jobId}`);
    }
    /** Enqueue an MP4 render of a design's video timeline. Poll the
     *  returned jobId via getJob, then download from videoExportDownloadUrl. */
    /** Start a server video export. For video documents this renders the full
     *  timeline (ffmpeg); opts tune the output (scale multiplier, x264 CRF). */
    startVideoExport(designId, opts = {}) {
        return this.request("POST", `/v1/designs/${designId}/export/video`, opts);
    }
    /** The authenticated download URL for a completed video export (cookie auth). */
    videoExportDownloadUrl(designId, jobId) {
        return `${this.baseUrl}/v1/designs/${encodeURIComponent(designId)}/export/video/${encodeURIComponent(jobId)}/download`;
    }
    /** Enqueue a DOCX or PDF render of a doc design. Poll via getJob,
     *  then download from docExportDownloadUrl. */
    startDocExport(designId, format) {
        return this.request("POST", `/v1/designs/${designId}/export/doc`, { format });
    }
    /** The authenticated download URL for a completed doc export (cookie auth). */
    docExportDownloadUrl(designId, jobId) {
        return `${this.baseUrl}/v1/designs/${encodeURIComponent(designId)}/export/doc/${encodeURIComponent(jobId)}/download`;
    }
    /** The authenticated URL for an accessibility-tagged PDF of the whole deck,
     *  rendered by the Go encoder (doc 28 FR-22). It serves the design as last
     *  saved, and its text is real text: selectable, searchable, and readable by
     *  assistive technology in the author's reading order. */
    taggedPdfUrl(designId) {
        return `${this.baseUrl}/v1/designs/${encodeURIComponent(designId)}/render.pdf?page=all`;
    }
    /** Convert a whiteboard design into a presentation deck. Poll via
     *  getJob; the result carries the new design id to open. */
    convertWhiteboardToDeck(designId) {
        return this.request("POST", `/v1/designs/${designId}/convert/whiteboard-to-deck`);
    }
    /** Autofill a single existing design from one row of values. */
    autofillDesign(id, values) {
        return this.request("POST", `/v1/designs/${id}/autofill`, { values });
    }
    applyTemplate(id, workspaceId) {
        return this.request("POST", `/v1/templates/${id}/apply`, { workspaceId });
    }
    /** Save the current design (by id or inline file) as a template (FR-9). */
    saveAsTemplate(input) {
        return this.request("POST", "/v1/templates", input);
    }
    assignTemplateCollection(id, collectionId) {
        return this.request("POST", `/v1/templates/${id}/collection`, { collectionId });
    }
    // Collections.
    listTemplateCollections(workspaceId) {
        return this.request("GET", `/v1/templates/collections?workspaceId=${encodeURIComponent(workspaceId)}`);
    }
    createTemplateCollection(workspaceId, name) {
        return this.request("POST", "/v1/templates/collections", { workspaceId, name });
    }
    deleteTemplateCollection(id) {
        return this.request("DELETE", `/v1/templates/collections/${id}`);
    }
    // --- stock catalog ----------------------------------------------
    stockSearch(q, kind, opts = {}) {
        const params = new URLSearchParams();
        if (q)
            params.set("q", q);
        if (kind)
            params.set("kind", kind);
        if (opts.category)
            params.set("category", opts.category);
        if (opts.style)
            params.set("style", opts.style);
        if (opts.orientation)
            params.set("orientation", opts.orientation);
        if (opts.collection)
            params.set("collection", opts.collection);
        if (opts.limit)
            params.set("limit", String(opts.limit));
        if (opts.offset)
            params.set("offset", String(opts.offset));
        const qs = params.toString();
        return this.request("GET", `/v1/stock/search${qs ? `?${qs}` : ""}`);
    }
    /** The curated stock collections. */
    stockCollections() {
        return this.request("GET", "/v1/stock/collections");
    }
    /** The catalog's filterable facets (categories, styles, orientations) per kind. */
    stockFilters() {
        return this.request("GET", "/v1/stock/filters");
    }
    /** The current user's favorited stock assets (newest first). */
    stockFavorites() {
        return this.request("GET", "/v1/stock/favorites");
    }
    /** Toggle the current user's favorite on a stock asset; returns the new state. */
    toggleStockFavorite(stockId) {
        return this.request("POST", `/v1/stock/favorites/${stockId}`);
    }
    /** The current user's recently-used stock assets (most recent first). */
    stockRecent() {
        return this.request("GET", "/v1/stock/recent");
    }
    /** Record a stock asset as recently used (called when it is placed). 204, no body. */
    recordStockRecent(stockId) {
        return this.request("POST", `/v1/stock/recent/${stockId}`);
    }
    /** The built-in mini apps + their granted scopes. */
    listApps() {
        return this.request("GET", "/v1/apps");
    }
    // --- AI (bring-your-own key) -------------------------------------
    getAiConfig(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/ai-config`);
    }
    setAiConfig(workspaceId, input) {
        return this.request("PUT", `/v1/workspaces/${workspaceId}/ai-config`, input);
    }
    getAiPolicy(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/ai-policy`);
    }
    setAiPolicy(workspaceId, input) {
        return this.request("PUT", `/v1/workspaces/${workspaceId}/ai-policy`, input);
    }
    getAiUsage(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/ai-usage`);
    }
    // --- live audience (doc 28): share-link viewers <-> presenter -------------
    /** Audience state (visible questions + polls), personalized by voterKey.
     *  POST so a link password never rides a URL. */
    audienceState(token, input) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/audience/state`, input);
    }
    audienceAsk(token, input) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/audience/questions`, input);
    }
    audienceVoteQuestion(token, questionId, input) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/audience/questions/${encodeURIComponent(questionId)}/vote`, input);
    }
    audienceVotePoll(token, pollId, input) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/audience/polls/${encodeURIComponent(pollId)}/vote`, input);
    }
    audienceReact(token, input) {
        return this.request("POST", `/v1/links/${encodeURIComponent(token)}/audience/react`, input);
    }
    /** Presenter: full audience state incl. dismissed questions. */
    presenterAudienceState(designId) {
        return this.request("GET", `/v1/designs/${designId}/audience/state`);
    }
    presenterModerateQuestion(designId, questionId, input) {
        return this.request("POST", `/v1/designs/${designId}/audience/questions/${encodeURIComponent(questionId)}/moderate`, input);
    }
    presenterCreatePoll(designId, input) {
        return this.request("POST", `/v1/designs/${designId}/audience/polls`, input);
    }
    presenterSetPollOpen(designId, pollId, open) {
        return this.request("POST", `/v1/designs/${designId}/audience/polls/${encodeURIComponent(pollId)}/open`, { open });
    }
    presenterClearAudience(designId) {
        return this.request("POST", `/v1/designs/${designId}/audience/clear`, {});
    }
    /** Presenter: publish the current slide for audience slide-follow (-1 ends). */
    presenterSetLiveSlide(designId, slide) {
        return this.request("POST", `/v1/designs/${designId}/audience/live`, { slide });
    }
    /** Server-side data-source proxy (doc 28 / F27 live bindings): fetches a
     *  remote CSV/TSV/JSON URL past CORS, behind the same SSRF gate. */
    dataFetch(input) {
        return this.request("POST", "/v1/data/fetch", input);
    }
    /** Server-side URL-to-text extraction (doc 28 FR-23): fetches a public web
     *  page (SSRF-guarded) and returns its readable text for deck grounding. */
    aiExtractUrl(input) {
        return this.request("POST", "/v1/ai/extract-url", input);
    }
    aiText(input) {
        return this.request("POST", "/v1/ai/text", input);
    }
    aiImage(input) {
        return this.request("POST", "/v1/ai/image", input);
    }
    /** Describe an image in words for accessibility alt text (F22 FR-12).
     *  `imageBase64` is a base64 PNG/JPEG (a leading data: prefix is allowed).
     *  Needs a vision-capable model; throws ApiError 502 otherwise. */
    aiDescribeImage(input) {
        return this.request("POST", "/v1/ai/describe-image", input);
    }
    /** Edit an image by prompt, or outpaint it (Magic Expand) when `maskBase64` is
     *  supplied. `imageBase64`/`maskBase64` are base64 PNGs (a leading data: prefix
     *  is allowed). Returns the result image as a data URL (or remote URL). */
    aiEditImage(input) {
        return this.request("POST", "/v1/ai/image/edit", input);
    }
    // --- AI Creative Studio (F39): server-side orchestration -----------
    // These call the AI proxy server-side with schema validation + retry, so the
    // client gets clean, typed objects (FR-12). The deterministic layout still
    // happens client-side from the returned outline/specs.
    /** Generate + validate a multi-page design outline (FR-2). */
    aiOutline(input) {
        return this.request("POST", "/v1/ai/outline", input);
    }
    /** Generate a polished design as a job (outline + per-page copy). Poll getJob;
     *  the result is an AiDesignOutline to lay out (FR-1/FR-25). */
    aiGenerateDesign(input) {
        return this.request("POST", "/v1/ai/generate-design", input);
    }
    /** Generate N distinct outline options as a job (FR-4). Result: {variations}. */
    aiVariations(input) {
        return this.request("POST", "/v1/ai/variations", input);
    }
    /** Validate a chart spec from a data description (FR-21). */
    aiChart(input) {
        return this.request("POST", "/v1/ai/chart", input);
    }
    /** Run one agentic assistant turn: a validated plan or a clarifying question
     *  (FR-6/7/10). The client executes the plan and re-validates arg types. */
    aiAssistant(input) {
        return this.request("POST", "/v1/ai/assistant", input);
    }
    /** Extract a style profile from a reference for style transfer (FR-18). */
    aiStyleProfile(input) {
        return this.request("POST", "/v1/ai/style-profile", input);
    }
    /** AI design-critique suggestions for a posted design summary (FR-15). */
    aiCritique(input) {
        return this.request("POST", "/v1/ai/critique", input);
    }
    // Session history (FR-9 / FR-27).
    listAiSessions(designId) {
        return this.request("GET", `/v1/designs/${designId}/ai-sessions`);
    }
    createAiSession(designId) {
        return this.request("POST", `/v1/designs/${designId}/ai-sessions`);
    }
    listAiTurns(designId, sessionId) {
        return this.request("GET", `/v1/designs/${designId}/ai-sessions/${sessionId}/turns`);
    }
    appendAiTurn(designId, sessionId, turn) {
        return this.request("POST", `/v1/designs/${designId}/ai-sessions/${sessionId}/turns`, turn);
    }
    // --- uploads + asset organization -------------------------------
    listAssets(workspaceId, filter = {}) {
        const params = new URLSearchParams();
        if (filter.folderId !== undefined)
            params.set("folderId", filter.folderId ?? "root");
        if (filter.tag)
            params.set("tag", filter.tag);
        if (filter.q)
            params.set("q", filter.q);
        const qs = params.toString();
        return this.request("GET", `/v1/workspaces/${workspaceId}/assets${qs ? `?${qs}` : ""}`);
    }
    uploadAsset(workspaceId, input) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/assets`, input);
    }
    /**
     * Import an image from a remote URL. The server validates the host (SSRF) and
     * re-checks the resolved IP (anti-DNS-rebinding) before fetching, then stores
     * it as an asset. Returns the created asset.
     */
    importAssetFromUrl(workspaceId, url, folderId) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/assets/from-url`, { url, folderId });
    }
    /** Rename, move-to-folder, and/or set tags on an asset. */
    updateAsset(id, patch) {
        return this.request("PATCH", `/v1/assets/${id}`, patch);
    }
    deleteAsset(id) {
        return this.request("DELETE", `/v1/assets/${id}`);
    }
    /** Current storage usage + cap for the workspace (FR-11). */
    assetUsage(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/assets/usage`);
    }
    // Asset folders.
    listAssetFolders(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/asset-folders`);
    }
    createAssetFolder(workspaceId, input) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/asset-folders`, input);
    }
    renameAssetFolder(id, name) {
        return this.request("PATCH", `/v1/asset-folders/${id}`, { name });
    }
    deleteAssetFolder(id) {
        return this.request("DELETE", `/v1/asset-folders/${id}`);
    }
    // --- brand kits + controls --------------------------------------
    /** The workspace's brand kits, default first (FR-1). Membership-gated. */
    listBrandKits(workspaceId) {
        return this.request("GET", `/v1/workspaces/${workspaceId}/brand-kits`);
    }
    /** Create a brand kit (FR-1); needs manage-brand. First kit becomes default. */
    createBrandKit(workspaceId, input = {}) {
        return this.request("POST", `/v1/workspaces/${workspaceId}/brand-kits`, input);
    }
    getBrandKit(kitId) {
        return this.request("GET", `/v1/brand-kits/${kitId}`);
    }
    /** Update a kit's metadata, contents, and controls (FR-1, FR-4, FR-5);
     *  needs manage-brand. */
    updateBrandKit(kitId, patch) {
        return this.request("PATCH", `/v1/brand-kits/${kitId}`, patch);
    }
    deleteBrandKit(kitId) {
        return this.request("DELETE", `/v1/brand-kits/${kitId}`);
    }
    /** Set a kit as the workspace default (FR-2); needs manage-brand. */
    setDefaultBrandKit(kitId) {
        return this.request("POST", `/v1/brand-kits/${kitId}/default`, {});
    }
    /** The design's active resolved brand + the caller's manage flag (FR-11). */
    getDesignBrand(designId) {
        return this.request("GET", `/v1/designs/${designId}/brand`);
    }
    /** Assign (or clear, with null) a design's active brand kit (FR-2); needs
     *  manage-brand. Writes DesignFile.meta.brandKitId server-side. */
    assignDesignBrand(designId, brandKitId) {
        return this.request("POST", `/v1/designs/${designId}/brand`, { brandKitId });
    }
    // --- brand versioning --------------------------------------
    /** A kit's version history, newest first (FR-9); needs manage-brand. */
    listBrandKitVersions(kitId) {
        return this.request("GET", `/v1/brand-kits/${kitId}/versions`);
    }
    /** Restore a kit to a prior version (FR-9); needs manage-brand. The prior
     *  snapshot is written back as a NEW version (history is never destroyed). */
    restoreBrandKitVersion(kitId, version) {
        return this.request("POST", `/v1/brand-kits/${kitId}/restore`, { version });
    }
    // --- brand linting -----------------------------------
    /** Lint a design against its active brand kit (FR-7). Membership-gated.
     *  Returns every violation found, each with an applyable fix where safe. */
    brandLint(designId) {
        return this.request("GET", `/v1/designs/${designId}/brand-lint`);
    }
    /** The pre-export/publish brand gate for a design (FR-8). `blocked` is true
     *  under lintPolicy 'block' with any non-info violation, so the export refuses. */
    brandLintGate(designId) {
        return this.request("GET", `/v1/designs/${designId}/brand-lint/gate`);
    }
    // --- pin / track ------------------------------------------
    /** Whether the tracked kit advanced past what the design reflects (FR-10),
     *  with a change summary, so the editor can prompt to review the update. */
    brandUpdates(designId) {
        return this.request("GET", `/v1/designs/${designId}/brand-updates`);
    }
    /** Pin a design to a specific kit version, or track latest with null (FR-10);
     *  needs manage-brand. Never mutates the scene graph. */
    setDesignBrandVersion(designId, version) {
        return this.request("POST", `/v1/designs/${designId}/brand-version`, { version });
    }
    /** Record the tracked kit's current version as reviewed (FR-10); needs
     *  manage-brand. Clears the "Brand updated - review" banner until the kit
     *  advances again. Writes `meta.brandReviewedVersion`; never mutates the scene
     *  graph. Returns the design's resolved brand. */
    markBrandReviewed(designId) {
        return this.request("POST", `/v1/designs/${designId}/brand-reviewed`, {});
    }
    // --- locked regions + editable fields ----------------
    /** Mark (or replace, an empty array clears) a design's brand locked-region
     *  node ids and, optionally, its editable fields (FR-6); needs manage-brand.
     *  Pass `editableFields` to record which nodes a filler may populate (omit to
     *  leave them untouched, `[]` to clear). Returns the design's resolved brand
     *  with the new locked-region + editable-field lists. */
    setDesignLockedRegions(designId, lockedRegions, editableFields) {
        return this.request("POST", `/v1/designs/${designId}/brand-locked-regions`, {
            lockedRegions,
            ...(editableFields !== undefined ? { editableFields } : {}),
        });
    }
}
exports.HyCanvasClient = HyCanvasClient;
