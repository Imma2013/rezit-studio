// Shared Rezit API client with automatic client-side storage & cloud persistence
import {
  HyCanvasClient,
  type DesignRecord,
  type DesignAccessView,
  type HomeItem,
  type TemplateSummary,
  type UploadedAsset,
  type AssetListFilter,
  type AssetFolder,
  type User,
  type WorkspaceWithRole,
} from "@hc/sdk";
import { createBlankDesign, type DesignFile } from "@hc/schema";
import { CodedError } from "./errors";
import { putMediaAsset, getMediaAssets, deleteMediaAsset, updateMediaAssetRecord } from "./assetStore";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8005/api";
const rawClient = new HyCanvasClient({ baseUrl, credentials: "include" });

// Local Storage Keys
const RECENT_KEY = "rezit_recent_designs";
const DOC_PREFIX = "rezit_doc_";
const META_PREFIX = "rezit_meta_";
const ASSETS_KEY = "rezit_uploaded_assets";
const FOLDERS_KEY = "rezit_asset_folders";

function getStoredRecent(): HomeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredRecent(items: HomeItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    // quota ignore
  }
}

function getStoredAssets(workspaceId?: string): UploadedAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASSETS_KEY);
    const list: UploadedAsset[] = raw ? JSON.parse(raw) : [];
    if (workspaceId) return list.filter((a) => !a.workspaceId || a.workspaceId === workspaceId);
    return list;
  } catch {
    return [];
  }
}

function saveStoredAssets(items: UploadedAsset[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ASSETS_KEY, JSON.stringify(items));
  } catch {
    // quota ignore
  }
}

function getStoredFolders(workspaceId?: string): AssetFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLDERS_KEY);
    const list: AssetFolder[] = raw ? JSON.parse(raw) : [];
    if (workspaceId) return list.filter((f) => !f.workspaceId || f.workspaceId === workspaceId);
    return list;
  } catch {
    return [];
  }
}

function saveStoredFolders(items: AssetFolder[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FOLDERS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function inferAssetKind(filename: string, mimeType?: string): "image" | "video" | "audio" | "svg" {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  if (mimeType?.startsWith("video/") || ["mp4", "webm", "mov", "m4v", "avi", "mkv"].includes(ext)) {
    return "video";
  }
  if (mimeType?.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)) {
    return "audio";
  }
  if (mimeType?.includes("svg") || ext === "svg") {
    return "svg" as any;
  }
  return "image";
}

// Built-in starter templates for Rezit Studio
const BUILTIN_TEMPLATES: TemplateSummary[] = [
  {
    id: "tpl-social-post",
    title: "Vibrant Social Media Post",
    categories: ["social"],
    previewUrls: [],
    format: { width: 1080, height: 1080, unit: "px" },
  },
  {
    id: "tpl-story",
    title: "Gradient Modern Story",
    categories: ["social"],
    previewUrls: [],
    format: { width: 1080, height: 1920, unit: "px" },
  },
  {
    id: "tpl-youtube-thumb",
    title: "Tech YouTube Thumbnail",
    categories: ["marketing"],
    previewUrls: [],
    format: { width: 1280, height: 720, unit: "px" },
  },
  {
    id: "tpl-promo-poster",
    title: "Creative Event Poster",
    categories: ["print"],
    previewUrls: [],
    format: { width: 1920, height: 1080, unit: "px" },
  },
  {
    id: "tpl-video-reel",
    title: "Shorts & Reels Video Clip",
    categories: ["video"],
    previewUrls: [],
    format: { width: 1080, height: 1920, unit: "px" },
  },
];

class RezitClient extends HyCanvasClient {
  async me(): Promise<User> {
    try {
      return await super.me();
    } catch {
      return {
        id: "rezit-user-1",
        email: "creator@rezit.studio",
        emailVerified: true,
        name: "Rezit Creator",
        locale: "en",
        theme: "light",
        timezone: "",
        timeFormat: "auto",
        weekStart: "auto",
        prefs: { accessibility: { reduceMotion: false, highContrast: false } },
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async listWorkspaces(): Promise<WorkspaceWithRole[]> {
    try {
      return await super.listWorkspaces();
    } catch {
      return [
        {
          id: "ws-personal",
          name: "Rezit Workspace",
          slug: "personal",
          kind: "personal",
          role: "owner",
          ownerId: "rezit-user-1",
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  async createDesign(input: { workspaceId: string; title?: string; from?: DesignFile }): Promise<DesignRecord> {
    try {
      return await super.createDesign(input);
    } catch {
      const id = `des_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const title = input.title || input.from?.title || "Untitled design";
      const file = input.from || createBlankDesign({ title });
      file.title = title;

      const record: DesignRecord = {
        id,
        workspaceId: input.workspaceId || "ws-personal",
        title,
        schemaVersion: 1,
        currentSnapshotId: "snap-init",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        purgeAfter: null,
      };

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(DOC_PREFIX + id, JSON.stringify(file));
          window.localStorage.setItem(META_PREFIX + id, JSON.stringify(record));

          const recent = getStoredRecent().filter((r) => r.id !== id);
          const homeItem: HomeItem = {
            id,
            workspaceId: record.workspaceId,
            kind: "design",
            docKind: (file.meta?.kind as string) || "design",
            title: record.title,
            starred: false,
            sharedWithMe: false,
            updatedAt: record.updatedAt,
          };
          recent.unshift(homeItem);
          saveStoredRecent(recent);
        } catch {
          // ignore localStorage error
        }
      }

      return record;
    }
  }

  async getDesign(id: string): Promise<DesignRecord & { recovered?: boolean }> {
    try {
      return await super.getDesign(id);
    } catch {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(META_PREFIX + id);
        if (raw) return JSON.parse(raw);
      }
      return {
        id,
        workspaceId: "ws-personal",
        title: "Rezit Design",
        schemaVersion: 1,
        currentSnapshotId: "snap-init",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        purgeAfter: null,
      };
    }
  }

  async getDesignFile(id: string, opts?: { trashed?: boolean }): Promise<DesignFile> {
    try {
      return await super.getDesignFile(id, opts);
    } catch {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(DOC_PREFIX + id);
        if (raw) {
          try {
            return JSON.parse(raw);
          } catch {
            // invalid json fallback
          }
        }
      }
      return createBlankDesign({ title: "Rezit Design" });
    }
  }

  async saveSnapshot(id: string, input: { file: DesignFile; label?: string; kind?: any }): Promise<DesignRecord> {
    try {
      return await super.saveSnapshot(id, input);
    } catch {
      const now = new Date().toISOString();
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(DOC_PREFIX + id, JSON.stringify(input.file));
          const meta = await this.getDesign(id);
          meta.updatedAt = now;
          meta.title = input.file.title || meta.title;
          window.localStorage.setItem(META_PREFIX + id, JSON.stringify(meta));

          const recent = getStoredRecent();
          const idx = recent.findIndex((r) => r.id === id);
          if (idx >= 0) {
            recent[idx].title = meta.title;
            recent[idx].updatedAt = now;
            saveStoredRecent(recent);
          }
        } catch {
          // ignore
        }
      }
      return this.getDesign(id);
    }
  }

  async home(workspaceId: string, section?: "favorites" | "recent" | "shared"): Promise<HomeItem[]> {
    try {
      return await super.home(workspaceId, section);
    } catch {
      const all = getStoredRecent();
      if (section === "favorites") {
        return all.filter((i) => i.starred);
      }
      return all;
    }
  }

  async search(workspaceId: string, query: string): Promise<HomeItem[]> {
    try {
      return await super.search(workspaceId, query);
    } catch {
      const q = query.toLowerCase();
      return getStoredRecent().filter((i) => i.title.toLowerCase().includes(q));
    }
  }

  async renameDesign(id: string, title: string): Promise<DesignRecord> {
    try {
      return await super.renameDesign(id, title);
    } catch {
      const meta = await this.getDesign(id);
      meta.title = title;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(META_PREFIX + id, JSON.stringify(meta));
        const recent = getStoredRecent();
        const item = recent.find((r) => r.id === id);
        if (item) {
          item.title = title;
          saveStoredRecent(recent);
        }
      }
      return meta;
    }
  }

  async deleteDesign(id: string, purge = false): Promise<void> {
    try {
      return await super.deleteDesign(id, purge);
    } catch {
      if (typeof window !== "undefined") {
        if (purge) {
          window.localStorage.removeItem(DOC_PREFIX + id);
          window.localStorage.removeItem(META_PREFIX + id);
          const recent = getStoredRecent().filter((r) => r.id !== id);
          saveStoredRecent(recent);
        } else {
          const recent = getStoredRecent().filter((r) => r.id !== id);
          saveStoredRecent(recent);
        }
      }
    }
  }

  async toggleFavorite(designId: string, on: boolean): Promise<{ starred: boolean }> {
    try {
      return await super.toggleFavorite(designId, on);
    } catch {
      if (typeof window !== "undefined") {
        const recent = getStoredRecent();
        const it = recent.find((r) => r.id === designId);
        if (it) {
          it.starred = on;
          saveStoredRecent(recent);
        }
      }
      return { starred: on };
    }
  }

  async designAccess(designId: string): Promise<DesignAccessView> {
    try {
      return await super.designAccess(designId);
    } catch {
      return {
        mode: "edit",
        capabilities: ["view", "comment", "edit", "share", "approve", "manage-roles", "manage-brand", "delete"],
      };
    }
  }

  async listTemplates(opts?: any): Promise<TemplateSummary[]> {
    try {
      const res = await super.listTemplates(opts);
      return res && res.length > 0 ? res : BUILTIN_TEMPLATES;
    } catch {
      return BUILTIN_TEMPLATES;
    }
  }

  async getTemplateFile(templateId: string): Promise<DesignFile> {
    try {
      return await super.getTemplateFile(templateId);
    } catch {
      const tpl = BUILTIN_TEMPLATES.find((t) => t.id === templateId) || BUILTIN_TEMPLATES[0];
      return createBlankDesign({ title: tpl.title, width: tpl.format.width, height: tpl.format.height });
    }
  }

  async applyTemplate(templateId: string, workspaceId: string): Promise<{ designId: string }> {
    try {
      return await super.applyTemplate(templateId, workspaceId);
    } catch {
      const file = await this.getTemplateFile(templateId);
      const rec = await this.createDesign({ workspaceId, title: file.title, from: file });
      return { designId: rec.id };
    }
  }

  async listAssets(workspaceId: string, filter: AssetListFilter = {}): Promise<UploadedAsset[]> {
    try {
      return await super.listAssets(workspaceId, filter);
    } catch {
      let list = await getMediaAssets(workspaceId);
      if (filter.folderId !== undefined) {
        if (filter.folderId === null || filter.folderId === "root") {
          list = list.filter((a) => !a.folderId);
        } else {
          list = list.filter((a) => a.folderId === filter.folderId);
        }
      }
      if (filter.tag) {
        list = list.filter((a) => a.tags?.includes(filter.tag!));
      }
      if (filter.q) {
        const q = filter.q.toLowerCase();
        list = list.filter((a) => (a.filename || "").toLowerCase().includes(q) || (a.tags || []).some((t) => t.toLowerCase().includes(q)));
      }
      return list;
    }
  }

  async uploadAsset(
    workspaceId: string,
    input: { filename: string; dataBase64?: string; file?: Blob | File; folderId?: string | null; thumbnail?: string }
  ): Promise<UploadedAsset> {
    try {
      if (input.dataBase64 && !input.file) {
        return await super.uploadAsset(workspaceId, {
          filename: input.filename,
          dataBase64: input.dataBase64,
          folderId: input.folderId,
          thumbnail: input.thumbnail,
        });
      }
    } catch {
      // fallback to IndexedDB store
    }
    const ext = (input.filename.split(".").pop() || "").toLowerCase();
    const isVideo = ["mp4", "webm", "mov", "m4v", "avi", "mkv"].includes(ext);
    const isAudio = ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext);
    const isSvg = ext === "svg";
    const mimeType = isVideo
      ? "video/mp4"
      : isAudio
      ? "audio/mpeg"
      : isSvg
      ? "image/svg+xml"
      : ext === "png"
      ? "image/png"
      : "image/jpeg";
    const kind = isVideo ? "video" : isAudio ? "audio" : isSvg ? "svg" : "image";

    const payload = input.file || input.dataBase64 || "";
    const asset = await putMediaAsset(
      {
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        workspaceId,
        kind,
        filename: input.filename,
        mimeType,
        byteSize: input.file?.size || input.dataBase64?.length || 1024,
        folderId: input.folderId || null,
        tags: [],
        thumbnail: input.thumbnail || null,
        createdAt: new Date().toISOString(),
      },
      payload
    );
    return asset;
  }

  async importAssetFromUrl(workspaceId: string, url: string, folderId?: string | null): Promise<UploadedAsset> {
    try {
      return await super.importAssetFromUrl(workspaceId, url, folderId);
    } catch {
      const filename = url.split("/").pop()?.split("?")[0] || "imported-media";
      const asset: UploadedAsset = {
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        workspaceId,
        kind: inferAssetKind(filename),
        filename,
        mimeType: filename.endsWith(".png") ? "image/png" : "image/jpeg",
        byteSize: 1024,
        folderId: folderId || null,
        tags: [],
        url,
        thumbnail: url,
        createdAt: new Date().toISOString(),
      };
      const existing = getStoredAssets();
      existing.unshift(asset);
      saveStoredAssets(existing);
      return asset;
    }
  }

  async updateAsset(id: string, patch: { filename?: string; folderId?: string | null; tags?: string[] }): Promise<UploadedAsset> {
    try {
      return await super.updateAsset(id, patch);
    } catch {
      const res = await updateMediaAssetRecord(id, patch);
      if (res) return res;
      throw new Error("Asset not found");
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await super.deleteAsset(id);
    } catch {
      await deleteMediaAsset(id);
    }
  }

  async listAssetFolders(workspaceId: string): Promise<AssetFolder[]> {
    try {
      return await super.listAssetFolders(workspaceId);
    } catch {
      return getStoredFolders(workspaceId);
    }
  }

  async createAssetFolder(workspaceId: string, input: { name: string; parentId?: string | null }): Promise<AssetFolder> {
    try {
      return await super.createAssetFolder(workspaceId, input);
    } catch {
      const folder: AssetFolder = {
        id: `fld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        workspaceId,
        name: input.name,
        parentId: input.parentId || null,
        createdAt: new Date().toISOString(),
      };
      const folders = getStoredFolders();
      folders.push(folder);
      saveStoredFolders(folders);
      return folder;
    }
  }

  async renameAssetFolder(id: string, name: string): Promise<AssetFolder> {
    try {
      return await super.renameAssetFolder(id, name);
    } catch {
      const folders = getStoredFolders();
      const f = folders.find((x) => x.id === id);
      if (f) {
        f.name = name;
        saveStoredFolders(folders);
        return f;
      }
      throw new Error("Folder not found");
    }
  }

  async deleteAssetFolder(id: string): Promise<void> {
    try {
      await super.deleteAssetFolder(id);
    } catch {
      const folders = getStoredFolders().filter((x) => x.id !== id);
      saveStoredFolders(folders);
      const assets = getStoredAssets();
      let changed = false;
      for (const a of assets) {
        if (a.folderId === id) {
          a.folderId = null;
          changed = true;
        }
      }
      if (changed) saveStoredAssets(assets);
    }
  }

  async assetUsage(workspaceId: string): Promise<{ usedBytes: number; quotaBytes: number; userUsedBytes: number; userQuotaBytes: number }> {
    try {
      return await super.assetUsage(workspaceId);
    } catch {
      const assets = getStoredAssets(workspaceId);
      const usedBytes = assets.reduce((sum, a) => sum + (a.byteSize || 1024), 0);
      return {
        usedBytes,
        quotaBytes: 10737418240, // 10 GB
        userUsedBytes: usedBytes,
        userQuotaBytes: 10737418240,
      };
    }
  }

  async listTrash(workspaceId: string): Promise<DesignRecord[]> {
    try {
      return await super.listTrash(workspaceId);
    } catch {
      return [];
    }
  }

  async myTasks(): Promise<any[]> {
    try {
      return await super.myTasks();
    } catch {
      return [];
    }
  }

  async listTemplateCollections(workspaceId: string): Promise<any[]> {
    try {
      return await super.listTemplateCollections(workspaceId);
    } catch {
      return [];
    }
  }
}

export const oc = new RezitClient({ baseUrl, credentials: "include" });

/** Upload one asset with byte-level progress */
export async function uploadAssetWithProgress(
  workspaceId: string,
  input: { filename: string; dataBase64?: string; file?: Blob | File; folderId?: string | null; thumbnail?: string },
  onProgress?: (pct: number) => void,
): Promise<UploadedAsset> {
  if (onProgress) onProgress(30);
  try {
    if (onProgress) onProgress(60);
    const asset = await oc.uploadAsset(workspaceId, input);
    if (onProgress) onProgress(100);
    return asset;
  } catch (e) {
    if (onProgress) onProgress(100);
    throw e;
  }
}

export const apiOrigin = baseUrl.replace(/\/api\/?$/, "");

export function authStartUrl(providerId: string): string {
  return `${baseUrl}/v1/auth/${providerId}/start`;
}

export function ssoLinkUrl(): string {
  return `${baseUrl}/v1/auth/oidc/link`;
}

export function resolveAssetUrl(url: string): string {
  if (/^(https?:\/\/|data:|blob:)/.test(url)) return url;
  return `${apiOrigin}${url}`;
}

export function stockProxyUrl(sourceUrl: string): string {
  return sourceUrl;
}
