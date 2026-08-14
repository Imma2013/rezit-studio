import * as Y from "yjs";
import { type DesignFile } from "@hc/schema";
/** True when a Y.Doc has no design state yet (its root map is empty). A freshly
 *  constructed room doc is empty until seeded or until a peer's first sync. */
export declare function isEmptyDoc(ydoc: Y.Doc): boolean;
/**
 * Seed an empty room Y.Doc from the latest persisted DesignFile so the first
 * joiner syncs the saved state rather than a blank document. No-op when the doc
 * already has state (a peer synced first, or it was seeded earlier), so it is
 * safe to call on every join. Returns true when it actually seeded.
 */
export declare function seedDocFromFile(ydoc: Y.Doc, file: DesignFile): boolean;
/** Project the room Y.Doc to a plain DesignFile for the last-client snapshot. */
export declare function docToFile(ydoc: Y.Doc): DesignFile;
/** FR-13: a read-only (viewer) connection may receive sync/awareness but must
 *  never apply document updates. The gateway calls this before applying an
 *  inbound sync update; viewers are dropped (not applied, not broadcast). */
export declare function canApplyUpdates(role: "editor" | "viewer"): boolean;
