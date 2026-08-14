import type { DesignFile, Node, Page } from "./schema";
/** The alt text a node exposes to assistive technology, if any.
 *  `NodeBase.altText` generalizes the older image-only `ImageNode.alt`, which
 *  stays supported so files written before v12 keep their descriptions. */
export declare function nodeAltText(node: Node): string | undefined;
/** True when the node is marked presentational, so a checker should not demand
 *  a description and an accessible export should skip it. */
export declare function isDecorative(node: Node): boolean;
/** A node needs alt text when it conveys meaning: it is an image (or carries a
 *  link/interaction) and is neither decorative nor already described. */
export declare function needsAltText(node: Node): boolean;
/**
 * The order assistive technology should traverse a page's top-level nodes.
 *
 * Resolution: take `page.readingOrder`, keep only ids that still exist, then
 * append every remaining node in z-order. So a missing list means pure z-order,
 * a stale id is dropped rather than throwing, and a node added after the list
 * was authored still gets read. Nothing is ever omitted.
 */
export declare function resolveReadingOrder(page: Page): Node[];
/** The reading order as ids, normalized (existing ids first, then the rest in
 *  z-order). Writing this back makes an implicit order explicit. */
export declare function normalizeReadingOrder(page: Page): string[];
/** Move the node at `from` to `to` within a page's reading order, returning the
 *  new id list. Used by the Reading Order pane's drag-to-reorder. */
export declare function moveInReadingOrder(page: Page, from: number, to: number): string[];
/** Every node on a page that still needs a description, in reading order. */
export declare function nodesNeedingAltText(page: Page): Node[];
/** Deck-wide count of nodes still missing a description (decorative excluded). */
export declare function missingAltTextCount(file: DesignFile): number;
