import type { Address as AddressType } from "./address";
export type PrintCategory = "business_card" | "flyer" | "poster" | "sticker" | "mug" | "tshirt" | "packaging" | "signage" | "photo_book" | (string & {});
export type PrintColorSpace = "CMYK" | "RGB";
export interface PrintSize {
    id: string;
    label: string;
    widthMm: number;
    heightMm: number;
}
export interface PrintOption {
    id: string;
    label: string;
    priceDeltaCents: number;
}
export interface PrintProduct {
    id: string;
    category: PrintCategory;
    name: string;
    sizes: PrintSize[];
    substrates: PrintOption[];
    finishes: PrintOption[];
    sides: 1 | 2;
    requiredDpi: number;
    colorSpace: PrintColorSpace;
    iccProfile?: string;
    bleedMm: number;
    safeZoneMm: number;
    regions: string[];
    productionDays: number;
    basePriceCents?: Record<string, number>;
}
export interface MockupTemplate {
    id: string;
    productCategory: string;
    name: string;
    kind: "product" | "apparel" | "device" | "scene";
    surface: {
        warpMesh?: number[][];
        maskKey: string;
        lightingKey?: string;
    };
    outputWidth?: number;
    outputHeight?: number;
    surfaceAspect?: number;
}
export interface MockupRender {
    id: string;
    designId: string;
    pageId: string;
    templateId: string;
    imageKey: string;
    width: number;
    height: number;
    createdAt: string;
}
export type PreflightCode = "dpi" | "color_space" | "icc" | "bleed" | "safe_zone" | "font_embed" | "overprint";
export type PreflightLevel = "pass" | "warn" | "error";
export interface PreflightCheck {
    code: PreflightCode;
    level: PreflightLevel;
    message: string;
    nodeId?: string;
    overridable: boolean;
}
export interface PreflightResult {
    designId: string;
    productId: string;
    sizeId: string;
    checks: PreflightCheck[];
    status: PreflightLevel;
    ranAt: string;
}
export type PrintOrderStatus = "draft" | "submitted" | "in_production" | "shipped" | "delivered" | "canceled" | "problem";
export type ShipmentStatus = "pending" | "shipped" | "delivered" | "exception";
export interface ShipmentInfo {
    address: AddressType;
    method?: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: ShipmentStatus;
}
export interface CostBreakdown {
    currency: string;
    baseCents: number;
    optionsCents: number;
    shippingCents: number;
    taxesCents: number;
    subsidyCents: number;
    totalCents: number;
}
export interface PrintOrderItem {
    id: string;
    designId: string;
    productId: string;
    sizeId: string;
    substrateId: string;
    finishId?: string;
    quantity: number;
    printFileKey: string;
    shipping: ShipmentInfo;
    cost?: CostBreakdown;
}
export interface PrintOrder {
    id: string;
    workspaceId: string;
    createdBy: string;
    status: PrintOrderStatus;
    items: PrintOrderItem[];
    vendorId: string;
    vendorOrderId?: string;
    costBreakdown: CostBreakdown;
    createdAt: string;
    updatedAt: string;
}
export type { Address } from "./address";
