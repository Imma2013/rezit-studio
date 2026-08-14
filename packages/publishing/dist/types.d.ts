export type SocialPlatform = "instagram" | "facebook" | "x" | "linkedin" | "tiktok" | "pinterest" | "youtube";
export interface SocialAccount {
    id: string;
    workspaceId: string;
    platform: SocialPlatform;
    externalUserId: string;
    displayName: string;
    avatarUrl?: string;
    scopes: string[];
    status: "active" | "expired" | "revoked";
    connectedBy: string;
    connectedAt: string;
}
export interface PublishTarget {
    id: string;
    accountId: string;
    platform: SocialPlatform;
    kind: "profile" | "page" | "board" | "channel" | "organization";
    externalId: string;
    name: string;
}
export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed" | "canceled";
export interface ScheduledPost {
    id: string;
    workspaceId: string;
    designId: string;
    sourcePageId?: string;
    targets: PublishTargetSelection[];
    status: PostStatus;
    scheduledAt?: string;
    timezone: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface PublishTargetSelection {
    targetId: string;
    platform: SocialPlatform;
    caption: string;
    hashtags?: string[];
    firstComment?: string;
    link?: string;
    altText?: string;
    privacy?: "public" | "unlisted" | "private";
    renderVariantId: string;
    externalPostId?: string;
    externalPostUrl?: string;
    state: "pending" | "rendering" | "uploading" | "published" | "failed";
    error?: {
        code: string;
        message: string;
    };
}
export interface RenderVariant {
    id: string;
    designId: string;
    pageId: string;
    width: number;
    height: number;
    format: "png" | "jpg" | "mp4";
    storageKey: string;
    bytes: number;
    createdAt: string;
}
export interface PostInsights {
    postId: string;
    targetId: string;
    platform: SocialPlatform;
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    clicks?: number;
    fetchedAt: string;
}
export interface DesignEmbed {
    id: string;
    designId: string;
    pageId?: string;
    mode: "live" | "snapshot";
    snapshotId?: string;
    width?: number;
    height?: number;
    responsive: boolean;
    publicSlug: string;
    createdAt: string;
}
export interface QrCode {
    id: string;
    workspaceId: string;
    targetType: "published_url" | "embed_url" | "custom";
    targetValue: string;
    ecLevel: "L" | "M" | "Q" | "H";
    fgColor: string;
    bgColor: string;
    logoAssetId?: string;
    format: "svg" | "png";
    storageKey: string;
    createdAt: string;
}
