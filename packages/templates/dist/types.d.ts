import type { AttributionEntry } from "@hc/stock";
export type TemplateVisibility = "personal" | "team" | "public";
export interface StyleDescriptor {
    palette: string[];
    typography: Array<{
        role: "heading" | "subheading" | "body" | "accent";
        family: string;
        weight: number;
    }>;
    effects?: string[];
    styleTags?: string[];
    mood?: string;
}
export interface FillableField {
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
/** A brand template's locked structure. The listed node ids are
 *  layout/logo/locked-style regions a filler can populate (via editable fields)
 *  but cannot move, resize, rotate, restyle, or delete. When a design is
 *  instantiated from the template, these ids are written to
 *  `DesignFile.meta.brandLockedRegions` and the editor gates mutation entry
 *  points on them for non-manage-brand users. */
export interface BrandTemplateRegions {
    /** Node ids locked against move/resize/rotate/restyle/delete. */
    lockedRegions: string[];
}
export interface MarketplaceInfo {
    status: "draft" | "in-review" | "published" | "rejected";
    authorDisplayName: string;
    usageCount: number;
    rewardEligible: boolean;
}
export interface Template {
    id: string;
    title: string;
    description?: string;
    visibility: TemplateVisibility;
    ownerId: string;
    workspaceId?: string | null;
    categories: string[];
    tags: string[];
    style: StyleDescriptor;
    format: {
        width: number;
        height: number;
        unit: "px" | "mm" | "in" | "pt";
        preset?: string;
    };
    pageCount: number;
    locale?: string;
    previewUrls: string[];
    designFileKey: string;
    fillableFields: FillableField[];
    /** The brand kit this is a template for, or null when generic. */
    brandKitId?: string | null;
    /** Node ids locked against structural edits for fillers. */
    lockedRegions?: string[];
    attributions: AttributionEntry[];
    marketplace?: MarketplaceInfo;
    version: number;
    createdAt: string;
    updatedAt: string;
}
export interface TemplateCollection {
    id: string;
    title: string;
    description?: string;
    trending?: boolean;
    seasonal?: boolean;
    templateIds: string[];
}
/** Visibility scope for a search (mirrors the "All / My / Team / Marketplace" UI). */
export type TemplateScope = "all" | "personal" | "team" | "public";
export interface TemplateQuery {
    text?: string;
    color?: string;
    style?: string | string[];
    category?: string | string[];
    format?: {
        width: number;
        height: number;
    };
    scope?: TemplateScope;
    workspaceId?: string | null;
}
