import type { Color, DesignFile } from "@hc/schema";
import type { AccessMode, Capability, HomeItem, Membership, TimeFormat, User, WeekStart, Workspace, WorkspaceRole } from "@hc/authz";
import type { BrandLintViolation } from "@hc/brandkit";
export type { DesignFile } from "@hc/schema";
export type { HomeItem, Membership, TimeFormat, User, WeekStart, Workspace, WorkspaceKind, WorkspaceRole } from "@hc/authz";
export type { AccessMode, Capability } from "@hc/authz";
export type { BrandLintViolation, BrandLintFix } from "@hc/brandkit";
/** Owner-safe view of a background job returned by GET /jobs/:id. */
/** Which sign-in methods and account-creation paths an instance allows, mirrored
 *  from the backend AuthPolicy (AUTH_*_ENABLED env). Drives the sign-in UI. */
export interface AuthPolicy {
    passwordLogin: boolean;
    passwordSignup: boolean;
    magicLinkLogin: boolean;
    magicLinkSignup: boolean;
    oidcLogin: boolean;
    oidcSignup: boolean;
}
/** CAPTCHA settings for the sign-in page when one is configured (null otherwise).
 *  `siteKey` is the provider's public key; the secret stays server-side. */
export interface CaptchaSettings {
    provider: "turnstile" | "recaptcha";
    siteKey: string;
}
export interface JobStatusView<R = unknown> {
    id: string;
    name: string;
    status: "queued" | "active" | "completed" | "failed";
    result?: R;
    error?: string;
    attempts: number;
    maxAttempts: number;
    createdAt: string;
    updatedAt: string;
}
/** Result payload of a completed video export job. */
export interface VideoExportResult {
    key: string;
    url: string;
    sizeBytes: number;
    frames: number;
    width: number;
    height: number;
    fps: number;
    hasAudio: boolean;
}
/** Result payload of a completed doc export job. */
export interface DocExportResult {
    key: string;
    url: string;
    sizeBytes: number;
    format: "docx" | "pdf";
}
/** Result payload of a completed whiteboard-to-deck conversion. */
export interface WhiteboardToDeckResult {
    designId: string;
    slides: number;
}
export interface ClientOptions {
    /** Base URL of the API, e.g. "http://localhost:8005/api" or "/api". */
    baseUrl: string;
    /** Optional bearer token for non-browser/programmatic use. */
    token?: string;
    /** Send cookies with requests (web app uses "include" for httpOnly auth). */
    credentials?: RequestCredentials;
    /** Override fetch (Node before global fetch, tests, etc.). */
    fetch?: typeof fetch;
}
export interface WorkspaceWithRole extends Workspace {
    role: WorkspaceRole;
}
/** A workspace member as shown in the roster (richer than authz Membership: it
 *  joins the user's profile so the UI can render names/emails). */
export interface WorkspaceMemberView {
    userId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: WorkspaceRole;
    status: "invited" | "active" | "suspended";
    joinedAt?: string;
}
/** A pending or accepted workspace invitation. `workspaceName` is populated for
 *  the invitee's own view (the in-app accept/decline surface). */
export interface WorkspaceInvitation {
    id: string;
    workspaceId: string;
    workspaceName?: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
    expiresAt: string;
    acceptedAt?: string | null;
    createdAt: string;
}
export interface DesignRecord {
    id: string;
    workspaceId: string;
    title: string;
    schemaVersion: number;
    currentSnapshotId: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    purgeAfter: string | null;
}
/** A version's author, resolved for the history time machine. */
export interface VersionAuthor {
    id: string;
    name: string;
}
export interface VersionEntry {
    id: string;
    designId: string;
    snapshotId: string;
    label: string | null;
    authorId: string | null;
    /** Resolved author (id + display name); null when unknown (FR-9). */
    author?: VersionAuthor | null;
    /** The underlying snapshot kind, so the panel can highlight named checkpoints
     *  and restores. */
    kind?: SnapshotKind;
    createdAt: string;
}
/** One paginated page of a design's version history. */
export interface VersionPage {
    items: VersionEntry[];
    nextCursor?: string;
}
/** One journaled realtime update from the CRDT history log (FR-9): a base64
 *  y-protocols update frame the client folds into an ephemeral Y.Doc to scrub
 *  history, plus its author and timestamp. */
export interface DesignUpdateEntry {
    seq: number;
    authorId?: string | null;
    /** Resolved author display name; empty when unknown. */
    authorName?: string;
    /** base64-encoded y-protocols sync update (message type 2). */
    update: string;
    createdAt: string;
    /** True for a full-state checkpoint row that begins a compacted log: fold from
     *  it as the base, then apply the tail deltas (FR-11). */
    isCheckpoint?: boolean;
}
/** Live audience (doc 28): one viewer question with computed votes. */
export interface AudienceQuestion {
    id: string;
    authorName: string;
    text: string;
    votes: number;
    answered: boolean;
    dismissed?: boolean;
    createdAt: string;
    voted?: boolean;
}
/** Live audience: one presenter poll with computed per-option counts. */
export interface AudiencePoll {
    id: string;
    question: string;
    options: string[];
    counts: number[];
    open: boolean;
    createdAt: string;
    myVote: number;
}
export interface AudienceState {
    questions: AudienceQuestion[];
    polls: AudiencePoll[];
    /** The presenter's live slide position (slide-follow), when one is fresh. */
    live?: {
        slide: number;
        updatedAt: string;
    };
}
/** A named in-CRDT branch of a design (doc 16 FR-10): a fork point inside one
 *  design whose state is the parent lineage up to `forkedFromSeq` plus the
 *  branch's own update rows. */
export interface CrdtBranch {
    id: string;
    designId: string;
    name: string;
    forkedFromSeq: number;
    parentBranchId?: string;
    createdById?: string;
    createdAt: string;
}
/** A forward-paginated, ascending-seq slice of the CRDT update log. */
export interface DesignUpdatePage {
    items: DesignUpdateEntry[];
    /** Pass back as `afterSeq` to fetch the next page; absent when exhausted. */
    nextSeq?: number;
}
/** A design branched from another design's history point. */
export interface BranchEntry {
    id: string;
    title: string;
    sourceDesignId: string | null;
    sourceVersionId: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface SessionInfo {
    id: string;
    device: string | null;
    ip: string | null;
    createdAt: string;
    lastSeenAt: string;
}
/** TOTP enrollment material: the otpauth URL plus the raw secret. */
export interface MfaEnrollment {
    otpauthUrl: string;
    secret: string;
}
/**
 * The result of a password login: either a completed sign-in (`user`), or an
 * MFA challenge (`mfaRequired`) that must be redeemed via `verifyMfa`.
 */
export type LoginResult = {
    user: User;
    mfaRequired?: false;
} | {
    mfaRequired: true;
    mfaToken: string;
};
/** A recorded dev-mail message (returned by the dev-only outbox route). */
export interface OutboxMessage {
    to: string;
    subject: string;
    text: string;
    link?: string;
    sentAt?: string;
}
export type SnapshotKind = "auto" | "checkpoint" | "named" | "restore" | "branch";
/** Kinds a client may save. "branch" is minted by the branch endpoint only;
 *  the snapshot route rejects it with 422. */
export type SavableSnapshotKind = Exclude<SnapshotKind, "branch">;
export interface TemplateSummary {
    id: string;
    title: string;
    categories: string[];
    previewUrls: string[];
    format: {
        width: number;
        height: number;
        unit: string;
    };
}
export type TemplateVisibility = "private" | "workspace" | "public";
export interface TemplateListFilter {
    q?: string;
    category?: string;
    collection?: string;
    workspaceId?: string;
}
export interface SaveAsTemplateInput {
    workspaceId: string;
    /** Provide one of designId or file. */
    designId?: string;
    file?: DesignFile;
    title: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
    visibility?: TemplateVisibility;
    collectionId?: string;
}
/** A fillable field a dataset can map onto. `nodeId` is the stable key; `label`
 *  is the human name used to auto-match dataset columns. */
export interface FillableFieldSummary {
    nodeId: string;
    kind: "text" | "image" | "color";
    label: string;
    hint?: string;
    constraints?: {
        maxChars?: number;
        aspect?: number;
        required?: boolean;
    };
}
/** One row of fill values, keyed by field nodeId. */
export type FillRowValues = Record<string, {
    text?: string;
    imageUrl?: string;
}>;
export interface BulkCreateInput {
    workspaceId: string;
    /** Provide exactly one base source. */
    sourceTemplateId?: string;
    sourceDesignId?: string;
    /** Dataset rows, each a flat map of field nodeId -> string value. */
    rows: Array<Record<string, string>>;
    /** Naming pattern with `{field}` placeholders (label or nodeId). */
    titlePattern?: string;
}
export interface BulkCreateResult {
    created: Array<{
        id: string;
        title: string;
    }>;
    truncated: boolean;
    requestedRows: number;
    skipped: Array<{
        row: number;
        reason: string;
    }>;
}
export interface TemplateCollectionSummary {
    id: string;
    workspaceId: string;
    name: string;
}
export interface StockAssetSummary {
    id: string;
    kind: string;
    title: string;
    previewUrl: string;
    sourceUrl: string;
    format: string;
    width?: number;
    height?: number;
    category?: string;
    collectionIds?: string[];
    /** Whether the current user has favorited this asset. */
    favorited?: boolean;
    /** Inline SVG markup for vector kinds (icons), for editable vector insertion. */
    svg?: string;
    /** Bundled-library pack id (e.g. "twemoji"), when the asset ships with the app. */
    pack?: string;
    /** True for a live upstream-provider asset (Openverse photo, Iconify icon) that
     *  is not in the bundled catalog: favorites/recents don't apply and it is
     *  imported/inlined on placement rather than drag-proxied. */
    live?: boolean;
    /** License metadata; attribution-required assets are stamped with provenance
     *  on insert so credits compile from the design. */
    license?: {
        type?: string;
        holder?: string;
        url?: string;
        attributionRequired?: boolean;
        attributionText?: string;
        attributionUrl?: string;
    };
}
export interface StockCollectionSummary {
    id: string;
    title: string;
    description?: string;
    kind?: string;
    trending?: boolean;
    seasonal?: boolean;
    /** "pack" for a bundled-library source (ManyPixels, Open Doodles, Tabler, ...),
     *  absent for a curated theme. The browse UI shows curated themes as top-level
     *  Collection chips and pack sources as a per-kind Source facet. */
    source?: string;
    /** Curated seed collections list their members; bundled-pack collections
     *  omit this (assets point back via collectionIds instead). */
    assetIds?: string[];
}
/** One value of a filterable stock facet (category/style/orientation), scoped
 *  to an asset kind, with how many bundled assets carry it. */
export interface StockFacetValue {
    id: string;
    kind: string;
    count: number;
}
/** The bundled catalog's filterable facets, aggregated per kind and sorted by
 *  count. Facets apply to the bundled catalog only: a faceted photo search
 *  stays on the bundled catalog instead of the live provider. */
export interface StockFiltersSummary {
    categories: StockFacetValue[];
    styles: StockFacetValue[];
    orientations: StockFacetValue[];
}
export interface MiniAppSummary {
    id: string;
    name: string;
    icon: string;
    builtIn: boolean;
    scopes: string[];
    entry: string;
}
export interface AiConfigView {
    provider: string;
    model: string | null;
    imageModel: string | null;
    baseUrl: string | null;
    hasKey: boolean;
    /** What the configured provider can do (gates image-dependent features). */
    capabilities: {
        text: boolean;
        image: boolean;
        describeImage: boolean;
        editImage: boolean;
    };
}
export type AiStudioDesignType = "deck" | "doc" | "social-set" | "poster";
export interface AiOutlineItem {
    title: string;
    points: string[];
    visualRole: string;
}
export interface AiDesignOutline {
    title: string;
    theme: string;
    pages: AiOutlineItem[];
}
export interface AiChartSpec {
    chartType: string;
    categories: string[];
    series: {
        name: string;
        values: number[];
    }[];
}
export interface AiPlanStep {
    action: string;
    args: Record<string, unknown>;
}
export interface AiAssistantReply {
    reply: string;
    clarify?: string;
    plan: AiPlanStep[];
}
export interface AiStyleProfile {
    palette: string[];
    mood: string;
    typeFeel: string;
    composition: string;
}
export interface AiSessionView {
    id: string;
    workspaceId: string;
    designId: string;
    createdAt: string;
}
export interface AiTurnView {
    id: string;
    sessionId: string;
    role: "user" | "assistant";
    text: string;
    plan?: unknown;
    provenance?: unknown;
    createdAt: string;
}
export interface AiPolicy {
    allowedProviders?: string[];
    blockedProviders?: string[];
    monthlyTokenCap?: number;
}
/**
 * A per-design access grant for a member (by user id) or invitee (by email).
 * For user-kind grants the sharing view also carries the person's display
 * `name`/`email` so the UI can show who they are rather than a raw id.
 */
export interface ShareGrant {
    id: string;
    designId: string;
    principal: {
        kind: "user" | "email";
        id: string;
        name?: string;
        email?: string;
    };
    mode: AccessMode;
    roleId?: string | null;
    invitedBy?: string | null;
    /** Display name of the inviter, when resolvable (attribution). */
    invitedByName?: string;
    createdAt: string;
}
/** A pending (or resolved) request to access a design (FR-5 request access). */
export interface AccessRequestView {
    id: string;
    designId: string;
    requester: {
        kind: "user" | "email";
        id: string;
        name?: string;
        email?: string;
    };
    mode: AccessMode;
    message?: string;
    status: "pending" | "granted" | "denied";
    createdAt: string;
}
/** A share link. `token` is the URL secret; the password is never returned. */
export interface ShareLinkView {
    id: string;
    designId: string;
    token: string;
    mode: AccessMode;
    hasPassword: boolean;
    expiresAt?: string | null;
    disabled: boolean;
    requireSignin: boolean;
    createdAt: string;
}
/** A named capability set assignable at workspace or design scope. */
export interface CustomRoleView {
    id: string;
    workspaceId: string;
    designId?: string | null;
    name: string;
    capabilities: Capability[];
    scope: "workspace" | "design";
    createdAt: string;
}
/** The caller's resolved access to a design (mode + capability set). */
export interface DesignAccessView {
    mode: AccessMode;
    capabilities: Capability[];
}
/** Everything the Share dialog needs: the caller's access plus grants/links/roles. */
export interface DesignSharingView {
    myAccess: DesignAccessView;
    /** The design's creator, for owner attribution (absent if unknown). */
    owner?: {
        kind: "user" | "email";
        id: string;
        name?: string;
        email?: string;
    };
    grants: ShareGrant[];
    links: ShareLinkView[];
    customRoles: CustomRoleView[];
}
/** The result of resolving a share link by token. */
export interface ResolvedLink {
    designId: string;
    mode: AccessMode;
}
/** Where a comment is pinned on a design. `orphaned` is set on read
 *  when an element anchor's node no longer exists (the pin hides, the thread
 *  still lists). */
export interface CommentAnchor {
    kind: "design" | "page" | "element" | "region" | "video";
    pageId?: string;
    nodeId?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    timeMs?: number;
    orphaned?: boolean;
}
export type TaskStatus = "open" | "in_progress" | "done";
/** The task facet of a comment once converted to a task. */
export interface CommentTask {
    assigneeId: string | null;
    status: TaskStatus;
    dueAt: string | null;
}
/** A reaction bucket: an emoji and the user ids who reacted with it. */
export interface CommentReaction {
    emoji: string;
    userIds: string[];
}
/** A single comment (thread root or reply). Replies nest under their root in
 *  {@link CommentThread}. `mentions` are recorded @mention user ids (FR-3). */
export interface Comment {
    id: string;
    designId: string;
    parentId: string | null;
    authorId: string | null;
    authorName: string;
    anchor: CommentAnchor;
    body: string;
    mentions: string[];
    reactions: CommentReaction[];
    resolved: boolean;
    resolvedById?: string | null;
    task?: CommentTask | null;
    editedAt?: string | null;
    createdAt: string;
}
/** A thread: a root comment plus its replies in creation order. */
export interface CommentThread extends Comment {
    replies: Comment[];
}
/** A person who can be @mentioned or assigned on a design. */
export interface MentionablePerson {
    id: string;
    name: string;
    email?: string | null;
}
/** A task in the assignee's "my tasks" view, carrying its design for deep-link. */
export interface MyTask extends Comment {
    designTitle: string;
}
/** Filters for {@link HyCanvasClient.listComments}. */
export type CommentFilter = "open" | "resolved" | "mine" | "assigned" | "all";
/** Whether one approver suffices or all must approve. */
export type ApprovalPolicy = "any" | "all";
/** Lifecycle of an approval; 'approved' locks the design (FR-11). */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "reopened";
export type ApprovalDecisionKind = "approve" | "reject";
/** A requester/approver identity for the banner. */
export interface ApprovalPerson {
    id: string;
    name: string;
}
/** One approver's recorded verdict. */
export interface ApprovalDecisionView {
    approverId: string;
    approverName: string;
    decision: ApprovalDecisionKind;
    note?: string | null;
    decidedAt: string;
}
/** What the calling user may do on the current approval (server-computed). */
export interface ApprovalActions {
    canRequest: boolean;
    canDecide: boolean;
    canReopen: boolean;
}
/** One approval workflow. */
export interface ApprovalView {
    id: string;
    designId: string;
    requester: ApprovalPerson;
    policy: ApprovalPolicy;
    status: ApprovalStatus;
    approvers: ApprovalPerson[];
    decisions: ApprovalDecisionView[];
    approvedCount: number;
    approverCount: number;
    createdAt: string;
    decidedAt?: string | null;
}
/** A design's current approval state + the caller's allowed actions (FR-10,
 *  FR-11), returned by GET /v1/designs/:id/approval. `locked` is the derived
 *  approval-lock state (an active approved approval). */
export interface DesignApprovalView {
    approval: ApprovalView | null;
    locked: boolean;
    actions: ApprovalActions;
}
/** A server-authoritative dot-vote round. */
export interface WhiteboardVoteSession {
    id: string;
    designId: string;
    budgetPerUser: number;
    anonymous: boolean;
    revealed: boolean;
    open: boolean;
}
/** Standings for one viewer. `counts` is per node id; `mine` is the caller's own
 *  picks; `voters` (per node) is present only when revealed and not anonymous. */
export interface WhiteboardVoteTally {
    session: WhiteboardVoteSession;
    counts: Record<string, number>;
    mine: string[];
    remainingBudget: number;
    voters?: Record<string, string[]>;
}
/** Every activity-feed item type. `edit` items are folded in
 *  from the version history at read time; the rest are stored activity events. */
export type ActivityType = "edit" | "comment" | "resolve" | "reply" | "reaction" | "share" | "link_change" | "role_change" | "task_assign" | "task_status" | "approval_request" | "approval_decision" | "reopen";
/** A single attributed feed item with a rendered human summary (FR-12). */
export interface ActivityItem {
    id: string;
    designId: string;
    type: ActivityType;
    actorId: string | null;
    actorName: string | null;
    summary: string;
    payload: Record<string, unknown> | null;
    createdAt: string;
    source: "activity" | "version";
}
/** A page of activity items, newest-first, with an opaque cursor (FR-12). */
export interface ActivityPage {
    items: ActivityItem[];
    nextCursor?: string;
}
/** Notification types the center aggregates. */
export type NotificationType = "mention" | "reply" | "task_assign" | "share" | "approval_request" | "approval_decision" | "access_request" | "access_decision" | "workspace_invite";
/** An in-app notification for the bell/center (FR-13). */
export interface NotificationView {
    id: string;
    type: NotificationType;
    designId: string | null;
    text: string;
    link: string;
    read: boolean;
    createdAt: string;
}
export interface NotificationPage {
    items: NotificationView[];
    nextCursor?: string;
}
/** Per-user notification-channel preference (FR-13). `emailTypes` are delivered
 *  by email and `pushTypes` by web push, each in addition to always-on in-app. */
export interface NotificationPrefView {
    emailTypes: NotificationType[];
    pushTypes: NotificationType[];
}
/** Aggregated engagement insights for a design. */
export interface DesignInsights {
    uniqueViewers: number;
    uniqueAnonViewers: number;
    totalViews: number;
    views: {
        date: string;
        count: number;
    }[];
    avgTimeMs: number;
    perPage: {
        pageId: string;
        engagementMs: number;
    }[];
}
export interface UploadedAsset {
    id: string;
    workspaceId: string;
    kind: string;
    filename: string | null;
    mimeType: string | null;
    byteSize: number | null;
    folderId: string | null;
    tags: string[];
    url: string;
    /** Optional client-generated downscaled preview (data URL); grid falls back to url. */
    thumbnail: string | null;
    createdAt: string;
}
export interface AssetFolder {
    id: string;
    workspaceId: string;
    name: string;
    parentId: string | null;
    createdAt: string;
}
export interface StorageUsageView {
    usedBytes: number;
    quotaBytes: number;
    /** The caller's uploads across ALL workspaces (global account usage). */
    userUsedBytes: number;
    /** Global per-user cap; 0 = unlimited. */
    userQuotaBytes: number;
}
/** Filters for {@link HyCanvasClient.listAssets}. `folderId: null` = root. */
export interface AssetListFilter {
    folderId?: string | null;
    tag?: string;
    q?: string;
}
/** A named brand swatch within a palette; `value` is a canonical sRGB Color. */
export interface BrandSwatch {
    id: string;
    role: string;
    name?: string;
    value: Color;
}
export interface BrandPalette {
    id: string;
    name: string;
    colors: BrandSwatch[];
}
export interface BrandFont {
    id: string;
    role: string;
    fontFamily: string;
    fontAssetId?: string | null;
    defaultStyle?: {
        weight?: number;
        size?: number;
        tracking?: number;
    };
}
export interface BrandLogo {
    id: string;
    label: string;
    assetId: string;
    variants?: {
        dark?: string;
        light?: string;
    };
    clearSpaceRatio?: number;
    minSizePx?: number;
}
export interface BrandVoice {
    tone: string[];
    doSay: string[];
    dontSay: string[];
    sampleCopy?: string;
    modelProfileId?: string;
}
export interface BrandCollection {
    id: string;
    kind: "photos" | "graphics" | "icons";
    assetIds: string[];
}
/** Brand controls: lock colors/fonts, restrict templates (FR-4, FR-5), and the
 *  slice-B pre-export/publish lint strictness (FR-8). `lintPolicy` is 'off'
 *  (never lint), 'warn' (surface violations), or 'block' (gate export). */
export interface BrandControls {
    lockColors: boolean;
    lockFonts: boolean;
    restrictTemplates: boolean;
    lintPolicy: "off" | "warn" | "block";
}
/** A workspace brand kit. `version` is the current version
 *  number, incremented on every write and recorded in {@link BrandKitVersion}. */
export interface BrandKit {
    id: string;
    workspaceId: string;
    name: string;
    /** Current version number (FR-9); incremented on every write. */
    version: number;
    isDefault: boolean;
    palettes: BrandPalette[];
    fonts: BrandFont[];
    logos: BrandLogo[];
    voice: BrandVoice | null;
    collections: BrandCollection[];
    controls: BrandControls;
    createdAt: string;
    updatedAt: string;
}
/** One versioned snapshot of a kit's state. `snapshot` is the full
 *  BrandKit at that version, so restore can rebuild it exactly. */
export interface BrandKitVersion {
    id: string;
    brandKitId: string;
    version: number;
    snapshot: BrandKit;
    authorId: string | null;
    createdAt: string;
}
/** A brand-template editable field descriptor: a node a filler may
 *  populate, with a label and optional fill constraints. Mirrors the @hc/templates
 *  FillableField shape; informational at the brand layer. */
export interface BrandEditableField {
    nodeId: string;
    kind?: "text" | "image" | "color";
    label: string;
    hint?: string;
    constraints?: {
        maxChars?: number;
        aspect?: number;
        required?: boolean;
    };
}
/** The design's active resolved brand + whether the caller may manage it
 *. `kit` is null when no brand is assigned/default. */
export interface ResolvedBrand {
    kit: BrandKit | null;
    canManage: boolean;
    /** The pinned kit version this design references, or null when it tracks the
     *  latest (FR-10). Null + a kit means "track latest". */
    pinnedVersion?: number | null;
    /** Brand-template locked-region node ids the design carries (FR-6, AC-4); the
     *  editor gates structural mutation of these for non-manage-brand users. */
    lockedRegions: string[];
    /** Brand-template editable fields the design carries (FR-6): the nodes a
     *  filler may populate. Informational; empty when none are marked. */
    editableFields?: BrandEditableField[];
}
/** Whether a tracked kit advanced past what a design reflects,
 *  with a summary of what changed, so the editor can prompt "Brand updated -
 *  review" rather than silently mutating the design. */
export interface BrandUpdateSummary {
    /** True when the design TRACKS the kit (not pinned) and the kit advanced. */
    hasUpdate: boolean;
    /** The version the design currently reflects; null when tracking with no record. */
    designVersion: number | null;
    /** The kit's current (latest) version. */
    latestVersion: number;
    /** Whether the design pins a specific version (true) or tracks latest. */
    pinned: boolean;
    /** Human-readable diffs of what changed (palette/font counts, controls). */
    changes: string[];
}
/** The brand gate decision for a design's pre-export/publish check (FR-8). */
export interface BrandLintResult {
    policy: "off" | "warn" | "block";
    blocked: boolean;
    violations: BrandLintViolation[];
}
/** Patch for {@link HyCanvasClient.updateBrandKit}. */
export interface BrandKitPatch {
    name?: string;
    isDefault?: boolean;
    palettes?: BrandPalette[];
    fonts?: BrandFont[];
    logos?: BrandLogo[];
    voice?: BrandVoice | null;
    collections?: BrandCollection[];
    controls?: Partial<BrandControls>;
}
/** Thrown on a non-2xx response; carries the status and parsed problem body. */
export declare class ApiError extends Error {
    status: number;
    path: string;
    body: unknown;
    constructor(status: number, path: string, body: unknown);
}
export declare class HyCanvasClient {
    private readonly baseUrl;
    private token?;
    private readonly credentials;
    private readonly fetchImpl;
    private refreshing;
    constructor(opts: ClientOptions);
    /** Set/clear the bearer token (no-op for cookie auth). */
    setToken(token?: string): void;
    private request;
    /** Refresh the session once, de-duping concurrent callers. Resolves true when
     *  a new access cookie was minted (caller may retry). */
    private tryRefresh;
    health(): Promise<{
        status: string;
    }>;
    signup(input: {
        email: string;
        password: string;
        name?: string;
    }, captchaToken?: string): Promise<{
        user: User;
        workspace: Workspace;
    }>;
    /**
     * Sign in with email + password. If the account has MFA enabled the server
     * returns `{ mfaRequired: true, mfaToken }` and sets no session cookie; the
     * client must then call `verifyMfa(mfaToken, code)` to finish signing in.
     * `captchaToken` is required when the instance has a CAPTCHA on the auth forms.
     */
    login(input: {
        email: string;
        password: string;
    }, captchaToken?: string): Promise<LoginResult>;
    /** Begin TOTP enrollment; returns the otpauth URL (for a QR) and raw secret. */
    enrollMfa(): Promise<MfaEnrollment>;
    /** Confirm enrollment with a code; returns the one-time recovery codes. */
    confirmMfa(code: string): Promise<{
        recoveryCodes: string[];
    }>;
    /** Disable MFA after proving a current TOTP code or an unused recovery code. */
    disableMfa(code: string): Promise<void>;
    /** Finish an MFA-gated login; sets the session cookies like login. */
    verifyMfa(mfaToken: string, code: string): Promise<{
        user: User;
    }>;
    /** Refresh the session, sharing the same de-duped in-flight refresh as the
     *  automatic 401 retry. Parallel refresh POSTs carrying the same cookie race
     *  the server-side rotation and can strand the browser on a dead token, so
     *  every caller (401 interceptor, bootstrap, tabs) must funnel through one
     *  request. Resolves { ok: false } instead of throwing on failure. */
    refresh(): Promise<{
        ok: boolean;
    }>;
    logout(all?: boolean): Promise<void>;
    /** Update the signed-in user's profile: name, avatar, locale, and the regional
     *  preferences (timezone, timeFormat, weekStart). Pass `avatarUrl: ""` to clear
     *  the avatar. Omitted fields are left unchanged. Returns the refreshed user. */
    updateProfile(input: {
        name?: string;
        avatarUrl?: string;
        locale?: string;
        timezone?: string;
        timeFormat?: TimeFormat;
        weekStart?: WeekStart;
    }): Promise<User>;
    me(): Promise<User>;
    sessions(): Promise<SessionInfo[]>;
    /** Download a full export of the user's data (profile, workspaces, designs). */
    exportAccount(): Promise<unknown>;
    /**
     * Permanently delete the account after re-authentication. Always requires the
     * current password; `code` is a TOTP or recovery code when MFA is enabled.
     */
    deleteAccount(input: {
        password: string;
        code?: string;
    }): Promise<void>;
    /** Request (or re-send) an email-verification link. Always resolves. */
    requestEmailVerification(email: string): Promise<void>;
    /** Verify an email with the token from the link; returns the updated user. */
    verifyEmail(token: string): Promise<{
        user: User;
    }>;
    /** Request a password-reset link. Always resolves (no account enumeration). */
    requestPasswordReset(email: string, captchaToken?: string): Promise<void>;
    /** Set a new password using the token from the reset link. */
    resetPassword(token: string, password: string): Promise<void>;
    /** Request a passwordless sign-in link. Always resolves (no enumeration). */
    requestMagicLink(email: string, captchaToken?: string): Promise<void>;
    /** Complete a magic-link sign-in; sets the session cookies like login. */
    magicLink(token: string): Promise<{
        user: User;
    }>;
    /** Enabled social sign-in providers (empty unless configured server-side).
     *  The login UI renders a button per entry; start the flow by navigating the
     *  browser to `${baseUrl}/v1/auth/{id}/start`. */
    authProviders(): Promise<{
        id: string;
        label: string;
    }[]>;
    /** The instance's auth configuration: the SSO providers plus which sign-in
     *  methods and account-creation paths are enabled (AUTH_*_ENABLED). The sign-in
     *  page renders only the methods the policy allows. */
    authConfig(): Promise<{
        providers: {
            id: string;
            label: string;
        }[];
        policy: AuthPolicy;
        captcha: CaptchaSettings | null;
    }>;
    /** SSO status for the signed-in user: whether an OIDC identity is linked and
     *  whether SSO is configured at all (so the UI can hide the card when it isn't).
     *  Start the connect flow by navigating to `${baseUrl}/v1/auth/oidc/link`. */
    oidcIdentity(): Promise<{
        linked: boolean;
        configured: boolean;
    }>;
    /** Disconnect the caller's SSO identity. Refused (409) if SSO is their only
     *  way to sign in (no password set), to avoid locking them out. */
    disconnectOidc(): Promise<void>;
    /** Dev-only: read the in-memory mail outbox (404/403 in production). */
    devOutbox(): Promise<OutboxMessage[]>;
    listWorkspaces(): Promise<WorkspaceWithRole[]>;
    createWorkspace(input: {
        name: string;
        kind?: Workspace["kind"];
    }): Promise<Workspace>;
    /** Permanently delete a team/org/classroom workspace and everything in it
     *  (owner only; personal workspaces cannot be deleted). */
    deleteWorkspace(workspaceId: string): Promise<void>;
    workspaceMembers(workspaceId: string): Promise<WorkspaceMemberView[]>;
    invite(workspaceId: string, input: {
        email: string;
        role?: WorkspaceRole;
    }): Promise<{
        invitation: WorkspaceInvitation;
        token: string;
    }>;
    acceptInvitation(token: string): Promise<Membership>;
    /** The signed-in user's own pending invitations (for the in-app accept/decline surface). */
    myInvitations(): Promise<WorkspaceInvitation[]>;
    /** Accept (true) or decline (false) one of the caller's invitations by id. */
    respondToInvitation(invitationId: string, accept: boolean): Promise<Membership | void>;
    workspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]>;
    revokeInvitation(workspaceId: string, invitationId: string): Promise<void>;
    changeMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void>;
    removeMember(workspaceId: string, userId: string): Promise<void>;
    home(workspaceId: string, section?: "recent" | "favorites" | "shared"): Promise<HomeItem[]>;
    search(workspaceId: string, q?: string, type?: HomeItem["kind"] | HomeItem["kind"][]): Promise<HomeItem[]>;
    /** Star/unstar a design for the current user; returns the resulting state. */
    toggleFavorite(designId: string, on: boolean): Promise<{
        starred: boolean;
    }>;
    createDesign(input: {
        workspaceId: string;
        title?: string;
        from?: DesignFile;
    }): Promise<DesignRecord>;
    getDesign(id: string): Promise<DesignRecord & {
        recovered?: boolean;
    }>;
    renameDesign(id: string, title: string): Promise<DesignRecord>;
    /** Fetch the design's current file. `trashed: true` lets workspace members
     *  read a design that sits in the trash (Trash-view preview thumbnails). */
    getDesignFile(id: string, opts?: {
        trashed?: boolean;
    }): Promise<DesignFile>;
    saveSnapshot(id: string, input: {
        file: DesignFile;
        label?: string;
        kind?: SavableSnapshotKind;
    }): Promise<DesignRecord>;
    /** A page of a design's version history, newest first. Each
     *  entry carries its resolved author, kind, label, and timestamp. Pass the
     *  returned `nextCursor` to lazy-load older pages. */
    listVersions(id: string, cursor?: string): Promise<VersionPage>;
    /** A historical version's DesignFile for READ-ONLY preview. Does
     *  not mutate the live design; the time machine loads it into the canvas under
     *  a preview banner. */
    versionFile(id: string, versionId: string): Promise<DesignFile>;
    /** The append-only CRDT update log in ascending seq order (FR-9): the raw
     *  y-protocols frames the client folds into an ephemeral Y.Doc to scrub
     *  history. Pass the returned `nextSeq` as `afterSeq` to page forward.
     *  `branch` selects an in-CRDT branch's lineage (FR-10): the parent prefix up
     *  to the fork plus the branch's own rows, one ascending seq stream. */
    designUpdates(id: string, afterSeq?: number, limit?: number, branch?: string): Promise<DesignUpdatePage>;
    /** Journal a CRDT full-state checkpoint and compact the update log (FR-11):
     *  older rows are deleted server-side, so the log stays bounded. `update` is a
     *  base64 y-protocols update frame from the live Y.Doc (encodeStateAsUpdate).
     *  `branch` scopes the checkpoint (and its compaction) to that in-CRDT
     *  branch's own lineage. */
    checkpointDesign(id: string, update: string, branch?: string): Promise<void>;
    /** The design's in-CRDT named branches (FR-10), oldest first. Distinct from
     *  {@link listBranches}, the fork model (new designs copied from a version). */
    listCrdtBranches(id: string): Promise<CrdtBranch[]>;
    /** Fork a named in-CRDT branch at a history point (FR-10). `forkedFromSeq` is
     *  a seq of the parent lineage (0 = the empty beginning); `parentBranchId`
     *  nests a branch under another branch (default: the main lineage). Purely
     *  additive: existing history is never touched. */
    createCrdtBranch(id: string, input: {
        name: string;
        forkedFromSeq: number;
        parentBranchId?: string;
    }): Promise<CrdtBranch>;
    /** Restore a prior version as a NEW snapshot (kind 'restore'), making it the
     *  current state without discarding anything. Distinct from
     *  {@link restoreDesign}, which un-trashes a soft-deleted design. */
    restoreVersion(id: string, versionId: string): Promise<VersionEntry>;
    /** Create a new design branched from a history point.
     *  Returns the new design; the source is left untouched. */
    branchFromVersion(id: string, versionId: string, name?: string): Promise<DesignRecord>;
    /** Designs branched off this design, for the branch switcher. */
    listBranches(id: string): Promise<BranchEntry[]>;
    deleteDesign(id: string, purge?: boolean): Promise<void>;
    restoreDesign(id: string): Promise<void>;
    listTrash(workspaceId: string): Promise<DesignRecord[]>;
    /** The caller's resolved access (mode + capabilities) to a design (FR-7). */
    designAccess(designId: string): Promise<DesignAccessView>;
    /** The full Share dialog payload: the caller's access plus grants, links, and
     *  in-scope custom roles (FR-5). */
    designSharing(designId: string): Promise<DesignSharingView>;
    /** Grant a member (by user id) or invitee (by email) access at a mode (FR-5). */
    addGrant(designId: string, input: {
        principal: {
            kind: "user" | "email";
            id: string;
        };
        mode: AccessMode;
        roleId?: string;
    }): Promise<ShareGrant>;
    updateGrant(grantId: string, patch: {
        mode?: AccessMode;
        roleId?: string | null;
    }): Promise<ShareGrant>;
    removeGrant(grantId: string): Promise<void>;
    /** Create a share link at an access mode, optionally password-protected and/or
     *  expiring (FR-5, FR-6). */
    createShareLink(designId: string, input: {
        mode: AccessMode;
        password?: string;
        expiresAt?: string;
        requireSignin?: boolean;
    }): Promise<ShareLinkView>;
    updateShareLink(linkId: string, patch: {
        mode?: AccessMode;
        disabled?: boolean;
        expiresAt?: string | null;
        requireSignin?: boolean;
    }): Promise<ShareLinkView>;
    /** Rotate a link's token: the old URL stops working (FR-6). */
    rotateShareLink(linkId: string): Promise<ShareLinkView>;
    /** Permanently delete a share link; its URL stops resolving (FR-6). */
    deleteShareLink(linkId: string): Promise<void>;
    /** PUBLIC: resolve a share link by token (FR-6, FR-15). No account needed for a
     *  view/comment link. Throws ApiError 404 (missing/disabled), 410 (expired), or
     *  403 (wrong password / sign-in required). */
    resolveShareLink(token: string, password?: string): Promise<ResolvedLink>;
    /** PUBLIC: resolve a link and fetch the design file for a read-only open
     *  (FR-15). Backs anonymous view/comment landing. Same denial semantics as
     *  resolveShareLink. */
    resolveShareLinkFile(token: string, password?: string): Promise<ResolvedLink & {
        file: DesignFile;
    }>;
    /** List the workspace's custom roles (requires manage-roles, FR-8). */
    listCustomRoles(workspaceId: string): Promise<CustomRoleView[]>;
    createCustomRole(workspaceId: string, input: {
        name: string;
        capabilities: Capability[];
        designId?: string;
    }): Promise<CustomRoleView>;
    updateCustomRole(roleId: string, patch: {
        name?: string;
        capabilities?: Capability[];
    }): Promise<CustomRoleView>;
    deleteCustomRole(roleId: string): Promise<void>;
    /** Assign a custom role to a member on a design at a mode floor (FR-8). */
    assignCustomRole(designId: string, input: {
        targetUserId: string;
        roleId: string;
        mode?: AccessMode;
    }): Promise<ShareGrant>;
    /** Request access to a design the caller cannot open; notifies its
     *  owners/admins. Throws ApiError 400 if the caller already has that access. */
    requestAccess(designId: string, input?: {
        mode?: AccessMode;
        message?: string;
    }): Promise<AccessRequestView>;
    /** List pending access requests for a design (requires the `share` capability). */
    listAccessRequests(designId: string): Promise<AccessRequestView[]>;
    /** Approve a pending access request, creating a grant (optionally at a chosen mode). */
    approveAccessRequest(requestId: string, mode?: AccessMode): Promise<AccessRequestView>;
    /** Deny a pending access request. */
    denyAccessRequest(requestId: string): Promise<AccessRequestView>;
    /** Comment threads for a design (roots with replies, reactions, task info).
     *  Requires the `view` capability; filter narrows open/resolved/mine/assigned. */
    listComments(designId: string, filter?: CommentFilter): Promise<CommentThread[]>;
    /** People who can be @mentioned or assigned on a design (FR-3, FR-4). */
    mentionablePeople(designId: string): Promise<MentionablePerson[]>;
    /** Create a comment at an anchor, optionally @mentioning people (FR-1, FR-3).
     *  Requires the `comment` capability (a view/comment user can comment). */
    createComment(designId: string, input: {
        anchor: CommentAnchor;
        body: string;
        mentions?: string[];
    }): Promise<Comment>;
    /** Reply to a thread root (FR-2). */
    replyComment(commentId: string, input: {
        body: string;
        mentions?: string[];
    }): Promise<Comment>;
    /** Edit a comment's body (author or admin override, FR-2). */
    editComment(commentId: string, input: {
        body: string;
        mentions?: string[];
    }): Promise<Comment>;
    /** Resolve or reopen a thread (FR-2). */
    resolveComment(commentId: string, resolved: boolean): Promise<Comment>;
    /** Delete a comment (author or `delete` capability, FR-2). */
    deleteComment(commentId: string): Promise<void>;
    /** Toggle an emoji reaction for the current user on a comment (FR-2). */
    reactComment(commentId: string, emoji: string): Promise<Comment>;
    /** Convert a comment to a task or update its task fields (FR-4). Pass status
     *  null with no assignee to clear the task. */
    setCommentTask(commentId: string, input: {
        assigneeId?: string | null;
        status?: TaskStatus | null;
        dueAt?: string | null;
    }): Promise<Comment>;
    /** Tasks assigned to the current user across their designs (FR-4). */
    myTasks(status?: TaskStatus): Promise<MyTask[]>;
    /** Comments that @mention the current user across their designs (FR-3). */
    myMentions(): Promise<MyTask[]>;
    /** The design's current approval state + the caller's allowed actions (FR-10,
     *  FR-11). `locked` reflects whether the design is approval-locked. */
    designApproval(designId: string): Promise<DesignApprovalView>;
    /** Request approval from one or more approvers under an any/all policy (FR-10).
     *  Requires the `share` or `edit` capability; rejects if one is already active. */
    requestApproval(designId: string, input: {
        approverIds: string[];
        policy: ApprovalPolicy;
    }): Promise<DesignApprovalView>;
    /** Record this approver's decision (FR-10). On grant the design locks (FR-11).
     *  Requires the `approve` capability and being a selected approver. */
    decideApproval(approvalId: string, input: {
        decision: ApprovalDecisionKind;
        note?: string;
    }): Promise<DesignApprovalView>;
    /** Reopen an approved+locked design (FR-11): clears the lock, restores edit.
     *  By owner/admin or a selected approver. */
    reopenApproval(approvalId: string): Promise<DesignApprovalView>;
    /** Open a dot-vote round on a board (facilitator/edit only). */
    openVoteSession(designId: string, input: {
        budgetPerUser: number;
        anonymous: boolean;
    }): Promise<WhiteboardVoteSession>;
    /** Close/reopen and/or reveal a vote session (facilitator/edit only). */
    setVoteSessionState(designId: string, sessionId: string, input: {
        open: boolean;
        revealed: boolean;
    }): Promise<WhiteboardVoteSession>;
    /** Current standings for a session (view level; anonymity/reveal enforced server-side). */
    getVoteTally(designId: string, sessionId: string): Promise<WhiteboardVoteTally>;
    /** Toggle the caller's dot-vote on a node (comment level). 409 when closed or
     *  over budget. Returns the refreshed tally for the caller. */
    castVote(designId: string, input: {
        sessionId: string;
        nodeId: string;
    }): Promise<WhiteboardVoteTally>;
    /** The merged, newest-first activity feed for a design (edits folded in from
     *  version history). `type` narrows to one activity type; `cursor` pages. */
    designActivity(designId: string, opts?: {
        type?: ActivityType;
        cursor?: string;
    }): Promise<ActivityPage>;
    /** The caller's notifications, newest-first, paginated. */
    notifications(opts?: {
        unread?: boolean;
        cursor?: string;
    }): Promise<NotificationPage>;
    /** The caller's unread notification count (for the bell badge). */
    unreadNotificationCount(): Promise<{
        count: number;
    }>;
    markNotificationRead(id: string): Promise<void>;
    markAllNotificationsRead(): Promise<void>;
    /** The caller's notification channel preferences: email + web push (FR-13). */
    notificationPrefs(): Promise<NotificationPrefView>;
    /** Update the email and/or web-push notification type sets (FR-13). Pass only
     *  the channel(s) you are changing; an omitted channel is left untouched. The
     *  back-compat string-array overload updates the email channel. */
    setNotificationPrefs(input: NotificationType[] | {
        emailTypes?: NotificationType[];
        pushTypes?: NotificationType[];
    }): Promise<NotificationPrefView>;
    /** The public VAPID key to subscribe with, or null when web push is not
     *  configured server-side (the device toggle is hidden then). */
    pushVapidPublicKey(): Promise<{
        key: string | null;
    }>;
    /** Register this device's browser push subscription for the current user. */
    pushSubscribe(input: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }): Promise<void>;
    /** Remove a device's push subscription by endpoint. */
    pushUnsubscribe(endpoint: string): Promise<void>;
    /** Record a view-session heartbeat for an authenticated viewer (FR-14). */
    viewBeat(designId: string, input: {
        sessionId: string;
        pageId?: string | null;
        ms: number;
    }): Promise<void>;
    /** PUBLIC: record an anonymous (share-link) view-session heartbeat (FR-14,
     *  FR-15). Validated by the link token; no account needed. */
    sharedViewBeat(token: string, input: {
        anonId: string;
        sessionId: string;
        pageId?: string | null;
        ms: number;
        password?: string;
    }): Promise<void>;
    /** Aggregated engagement insights for a design (FR-14), member/owner only. */
    designInsights(designId: string): Promise<DesignInsights>;
    /** List templates. Accepts a keyword string (back-compat) or a filter. */
    listTemplates(filter?: string | TemplateListFilter): Promise<TemplateSummary[]>;
    getTemplateFile(id: string): Promise<DesignFile>;
    /** A template's declared fillable fields, for the bulk-create mapping UI. */
    templateFillableFields(id: string): Promise<FillableFieldSummary[]>;
    /** A design's declared fillable fields. */
    designFillableFields(id: string): Promise<FillableFieldSummary[]>;
    /** Data merge / bulk create: one design per dataset row from a template or
     *  base design. Synchronous + batched; the result reports the
     *  created designs, a truncated flag (when the dataset exceeded the cap), and
     *  any rows skipped for failing field validation. */
    bulkCreate(input: BulkCreateInput): Promise<BulkCreateResult>;
    /** Poll a background job (export, video render, bulk create, ...) by id. Only
     *  visible to the user that enqueued it (job-status contract). */
    getJob<R = unknown>(jobId: string): Promise<JobStatusView<R>>;
    /** Enqueue an MP4 render of a design's video timeline. Poll the
     *  returned jobId via getJob, then download from videoExportDownloadUrl. */
    /** Start a server video export. For video documents this renders the full
     *  timeline (ffmpeg); opts tune the output (scale multiplier, x264 CRF). */
    startVideoExport(designId: string, opts?: {
        scale?: number;
        crf?: number;
        startFrame?: number;
        endFrame?: number;
        format?: "mp4" | "webm" | "gif" | "mp3";
        /** Output frame rate override (frames duplicate/drop; timing holds). */
        fps?: number;
        skipCaptions?: boolean;
        /** Render only this track's audio (pre-master stem), mp3 format. */
        stemTrackId?: string;
        /** Render THIS file's timeline instead of the design's stored one (doc 28
         *  FR-19 deck-to-video: the client converts the deck to a video project on
         *  the fly and nothing is persisted). Same workspace asset scope. */
        file?: DesignFile;
    }): Promise<{
        jobId: string;
    }>;
    /** The authenticated download URL for a completed video export (cookie auth). */
    videoExportDownloadUrl(designId: string, jobId: string): string;
    /** Enqueue a DOCX or PDF render of a doc design. Poll via getJob,
     *  then download from docExportDownloadUrl. */
    startDocExport(designId: string, format: "docx" | "pdf"): Promise<{
        jobId: string;
    }>;
    /** The authenticated download URL for a completed doc export (cookie auth). */
    docExportDownloadUrl(designId: string, jobId: string): string;
    /** The authenticated URL for an accessibility-tagged PDF of the whole deck,
     *  rendered by the Go encoder (doc 28 FR-22). It serves the design as last
     *  saved, and its text is real text: selectable, searchable, and readable by
     *  assistive technology in the author's reading order. */
    taggedPdfUrl(designId: string): string;
    /** Convert a whiteboard design into a presentation deck. Poll via
     *  getJob; the result carries the new design id to open. */
    convertWhiteboardToDeck(designId: string): Promise<{
        jobId: string;
    }>;
    /** Autofill a single existing design from one row of values. */
    autofillDesign(id: string, values: FillRowValues): Promise<{
        designId: string;
    }>;
    applyTemplate(id: string, workspaceId: string): Promise<{
        designId: string;
    }>;
    /** Save the current design (by id or inline file) as a template (FR-9). */
    saveAsTemplate(input: SaveAsTemplateInput): Promise<TemplateSummary>;
    assignTemplateCollection(id: string, collectionId: string | null): Promise<TemplateSummary>;
    listTemplateCollections(workspaceId: string): Promise<TemplateCollectionSummary[]>;
    createTemplateCollection(workspaceId: string, name: string): Promise<TemplateCollectionSummary>;
    deleteTemplateCollection(id: string): Promise<void>;
    stockSearch(q?: string, kind?: string, opts?: {
        category?: string;
        style?: string;
        orientation?: string;
        collection?: string;
        limit?: number;
        offset?: number;
    }): Promise<StockAssetSummary[]>;
    /** The curated stock collections. */
    stockCollections(): Promise<StockCollectionSummary[]>;
    /** The catalog's filterable facets (categories, styles, orientations) per kind. */
    stockFilters(): Promise<StockFiltersSummary>;
    /** The current user's favorited stock assets (newest first). */
    stockFavorites(): Promise<StockAssetSummary[]>;
    /** Toggle the current user's favorite on a stock asset; returns the new state. */
    toggleStockFavorite(stockId: string): Promise<{
        favorited: boolean;
    }>;
    /** The current user's recently-used stock assets (most recent first). */
    stockRecent(): Promise<StockAssetSummary[]>;
    /** Record a stock asset as recently used (called when it is placed). 204, no body. */
    recordStockRecent(stockId: string): Promise<void>;
    /** The built-in mini apps + their granted scopes. */
    listApps(): Promise<MiniAppSummary[]>;
    getAiConfig(workspaceId: string): Promise<AiConfigView | null>;
    setAiConfig(workspaceId: string, input: {
        provider: string;
        model?: string;
        imageModel?: string;
        baseUrl?: string;
        apiKey?: string;
    }): Promise<AiConfigView>;
    getAiPolicy(workspaceId: string): Promise<AiPolicy>;
    setAiPolicy(workspaceId: string, input: AiPolicy): Promise<AiPolicy>;
    getAiUsage(workspaceId: string): Promise<{
        tokensThisMonth: number;
    }>;
    /** Audience state (visible questions + polls), personalized by voterKey.
     *  POST so a link password never rides a URL. */
    audienceState(token: string, input: {
        voterKey: string;
        password?: string;
    }): Promise<AudienceState>;
    audienceAsk(token: string, input: {
        name?: string;
        text: string;
        password?: string;
    }): Promise<AudienceQuestion>;
    audienceVoteQuestion(token: string, questionId: string, input: {
        voterKey: string;
        password?: string;
    }): Promise<void>;
    audienceVotePoll(token: string, pollId: string, input: {
        voterKey: string;
        option: number;
        password?: string;
    }): Promise<void>;
    audienceReact(token: string, input: {
        emoji: string;
        password?: string;
    }): Promise<void>;
    /** Presenter: full audience state incl. dismissed questions. */
    presenterAudienceState(designId: string): Promise<AudienceState>;
    presenterModerateQuestion(designId: string, questionId: string, input: {
        answered?: boolean;
        dismissed?: boolean;
    }): Promise<void>;
    presenterCreatePoll(designId: string, input: {
        question: string;
        options: string[];
    }): Promise<AudiencePoll>;
    presenterSetPollOpen(designId: string, pollId: string, open: boolean): Promise<void>;
    presenterClearAudience(designId: string): Promise<void>;
    /** Presenter: publish the current slide for audience slide-follow (-1 ends). */
    presenterSetLiveSlide(designId: string, slide: number): Promise<void>;
    /** Server-side data-source proxy (doc 28 / F27 live bindings): fetches a
     *  remote CSV/TSV/JSON URL past CORS, behind the same SSRF gate. */
    dataFetch(input: {
        url: string;
    }): Promise<{
        text: string;
    }>;
    /** Server-side URL-to-text extraction (doc 28 FR-23): fetches a public web
     *  page (SSRF-guarded) and returns its readable text for deck grounding. */
    aiExtractUrl(input: {
        url: string;
    }): Promise<{
        title: string;
        text: string;
    }>;
    aiText(input: {
        workspaceId: string;
        prompt: string;
        system?: string;
    }): Promise<{
        text: string;
    }>;
    aiImage(input: {
        workspaceId: string;
        prompt: string;
        size?: string;
    }): Promise<{
        image: string;
    }>;
    /** Describe an image in words for accessibility alt text (F22 FR-12).
     *  `imageBase64` is a base64 PNG/JPEG (a leading data: prefix is allowed).
     *  Needs a vision-capable model; throws ApiError 502 otherwise. */
    aiDescribeImage(input: {
        workspaceId: string;
        imageBase64: string;
        instruction?: string;
    }): Promise<{
        text: string;
    }>;
    /** Edit an image by prompt, or outpaint it (Magic Expand) when `maskBase64` is
     *  supplied. `imageBase64`/`maskBase64` are base64 PNGs (a leading data: prefix
     *  is allowed). Returns the result image as a data URL (or remote URL). */
    aiEditImage(input: {
        workspaceId: string;
        imageBase64: string;
        prompt: string;
        maskBase64?: string;
        size?: string;
    }): Promise<{
        image: string;
    }>;
    /** Generate + validate a multi-page design outline (FR-2). */
    aiOutline(input: {
        workspaceId: string;
        designType: AiStudioDesignType;
        prompt: string;
        brandClause?: string;
        pageCount?: number;
    }): Promise<AiDesignOutline>;
    /** Generate a polished design as a job (outline + per-page copy). Poll getJob;
     *  the result is an AiDesignOutline to lay out (FR-1/FR-25). */
    aiGenerateDesign(input: {
        workspaceId: string;
        designType: AiStudioDesignType;
        prompt: string;
        brandClause?: string;
        pageCount?: number;
    }): Promise<{
        jobId: string;
    }>;
    /** Generate N distinct outline options as a job (FR-4). Result: {variations}. */
    aiVariations(input: {
        workspaceId: string;
        designType: AiStudioDesignType;
        prompt: string;
        brandClause?: string;
        count?: number;
    }): Promise<{
        jobId: string;
    }>;
    /** Validate a chart spec from a data description (FR-21). */
    aiChart(input: {
        workspaceId: string;
        description: string;
    }): Promise<AiChartSpec>;
    /** Run one agentic assistant turn: a validated plan or a clarifying question
     *  (FR-6/7/10). The client executes the plan and re-validates arg types. */
    aiAssistant(input: {
        workspaceId: string;
        designSummary: string;
        history?: string;
        message: string;
    }): Promise<AiAssistantReply>;
    /** Extract a style profile from a reference for style transfer (FR-18). */
    aiStyleProfile(input: {
        workspaceId: string;
        referenceText?: string;
        seedPalette?: string[];
    }): Promise<AiStyleProfile>;
    /** AI design-critique suggestions for a posted design summary (FR-15). */
    aiCritique(input: {
        workspaceId: string;
        designSummary: string;
    }): Promise<{
        suggestions: string;
    }>;
    listAiSessions(designId: string): Promise<{
        sessions: AiSessionView[];
    }>;
    createAiSession(designId: string): Promise<AiSessionView>;
    listAiTurns(designId: string, sessionId: string): Promise<{
        turns: AiTurnView[];
    }>;
    appendAiTurn(designId: string, sessionId: string, turn: {
        role: "user" | "assistant";
        text: string;
        plan?: unknown;
        provenance?: unknown;
    }): Promise<AiTurnView>;
    listAssets(workspaceId: string, filter?: AssetListFilter): Promise<UploadedAsset[]>;
    uploadAsset(workspaceId: string, input: {
        filename: string;
        dataBase64: string;
        folderId?: string | null;
        thumbnail?: string;
    }): Promise<UploadedAsset>;
    /**
     * Import an image from a remote URL. The server validates the host (SSRF) and
     * re-checks the resolved IP (anti-DNS-rebinding) before fetching, then stores
     * it as an asset. Returns the created asset.
     */
    importAssetFromUrl(workspaceId: string, url: string, folderId?: string | null): Promise<UploadedAsset>;
    /** Rename, move-to-folder, and/or set tags on an asset. */
    updateAsset(id: string, patch: {
        filename?: string;
        folderId?: string | null;
        tags?: string[];
    }): Promise<UploadedAsset>;
    deleteAsset(id: string): Promise<void>;
    /** Current storage usage + cap for the workspace (FR-11). */
    assetUsage(workspaceId: string): Promise<StorageUsageView>;
    listAssetFolders(workspaceId: string): Promise<AssetFolder[]>;
    createAssetFolder(workspaceId: string, input: {
        name: string;
        parentId?: string | null;
    }): Promise<AssetFolder>;
    renameAssetFolder(id: string, name: string): Promise<AssetFolder>;
    deleteAssetFolder(id: string): Promise<void>;
    /** The workspace's brand kits, default first (FR-1). Membership-gated. */
    listBrandKits(workspaceId: string): Promise<BrandKit[]>;
    /** Create a brand kit (FR-1); needs manage-brand. First kit becomes default. */
    createBrandKit(workspaceId: string, input?: {
        name?: string;
        isDefault?: boolean;
    }): Promise<BrandKit>;
    getBrandKit(kitId: string): Promise<BrandKit>;
    /** Update a kit's metadata, contents, and controls (FR-1, FR-4, FR-5);
     *  needs manage-brand. */
    updateBrandKit(kitId: string, patch: BrandKitPatch): Promise<BrandKit>;
    deleteBrandKit(kitId: string): Promise<void>;
    /** Set a kit as the workspace default (FR-2); needs manage-brand. */
    setDefaultBrandKit(kitId: string): Promise<BrandKit>;
    /** The design's active resolved brand + the caller's manage flag (FR-11). */
    getDesignBrand(designId: string): Promise<ResolvedBrand>;
    /** Assign (or clear, with null) a design's active brand kit (FR-2); needs
     *  manage-brand. Writes DesignFile.meta.brandKitId server-side. */
    assignDesignBrand(designId: string, brandKitId: string | null): Promise<ResolvedBrand>;
    /** A kit's version history, newest first (FR-9); needs manage-brand. */
    listBrandKitVersions(kitId: string): Promise<BrandKitVersion[]>;
    /** Restore a kit to a prior version (FR-9); needs manage-brand. The prior
     *  snapshot is written back as a NEW version (history is never destroyed). */
    restoreBrandKitVersion(kitId: string, version: number): Promise<BrandKit>;
    /** Lint a design against its active brand kit (FR-7). Membership-gated.
     *  Returns every violation found, each with an applyable fix where safe. */
    brandLint(designId: string): Promise<BrandLintViolation[]>;
    /** The pre-export/publish brand gate for a design (FR-8). `blocked` is true
     *  under lintPolicy 'block' with any non-info violation, so the export refuses. */
    brandLintGate(designId: string): Promise<BrandLintResult>;
    /** Whether the tracked kit advanced past what the design reflects (FR-10),
     *  with a change summary, so the editor can prompt to review the update. */
    brandUpdates(designId: string): Promise<BrandUpdateSummary>;
    /** Pin a design to a specific kit version, or track latest with null (FR-10);
     *  needs manage-brand. Never mutates the scene graph. */
    setDesignBrandVersion(designId: string, version: number | null): Promise<ResolvedBrand>;
    /** Record the tracked kit's current version as reviewed (FR-10); needs
     *  manage-brand. Clears the "Brand updated - review" banner until the kit
     *  advances again. Writes `meta.brandReviewedVersion`; never mutates the scene
     *  graph. Returns the design's resolved brand. */
    markBrandReviewed(designId: string): Promise<ResolvedBrand>;
    /** Mark (or replace, an empty array clears) a design's brand locked-region
     *  node ids and, optionally, its editable fields (FR-6); needs manage-brand.
     *  Pass `editableFields` to record which nodes a filler may populate (omit to
     *  leave them untouched, `[]` to clear). Returns the design's resolved brand
     *  with the new locked-region + editable-field lists. */
    setDesignLockedRegions(designId: string, lockedRegions: string[], editableFields?: BrandEditableField[]): Promise<ResolvedBrand>;
}
