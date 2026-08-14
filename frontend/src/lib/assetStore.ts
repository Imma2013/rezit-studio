// Persistent IndexedDB media asset storage for Rezit Studio
// Supports 100MB+ videos, audio clips, SVGs, and high-res images with zero memory bloat

import type { UploadedAsset } from "@hc/sdk";

export interface StoredMediaRecord {
  id: string;
  workspaceId: string;
  kind: "image" | "video" | "audio" | "svg";
  filename: string;
  mimeType: string;
  byteSize: number;
  folderId: string | null;
  tags: string[];
  thumbnail: string | null;
  createdAt: string;
  blob?: Blob;
}

const DB_NAME = "RezitMediaDB";
const DB_VERSION = 1;
const STORE_NAME = "media_assets";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("workspaceId", "workspaceId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// In-memory cache of object URLs so we don't leak or regenerate repeatedly
const urlCache = new Map<string, string>();

export async function putMediaAsset(
  record: Omit<StoredMediaRecord, "blob">,
  blobOrFile: Blob | File | string,
): Promise<UploadedAsset> {
  let blob: Blob;
  if (typeof blobOrFile === "string") {
    if (blobOrFile.startsWith("data:")) {
      const parts = blobOrFile.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || record.mimeType;
      const bstr = atob(parts[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
      blob = new Blob([u8arr], { type: mime });
    } else {
      blob = new Blob([blobOrFile], { type: record.mimeType });
    }
  } else {
    blob = blobOrFile;
  }

  const liveUrl = URL.createObjectURL(blob);
  urlCache.set(record.id, liveUrl);

  const fullRecord: StoredMediaRecord = {
    ...record,
    byteSize: blob.size,
    blob,
  };

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fullRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB save warning:", err);
  }

  return {
    id: record.id,
    workspaceId: record.workspaceId,
    kind: record.kind,
    filename: record.filename,
    mimeType: record.mimeType,
    byteSize: blob.size,
    folderId: record.folderId,
    tags: record.tags,
    url: liveUrl,
    thumbnail: record.thumbnail || (record.kind === "image" ? liveUrl : null),
    createdAt: record.createdAt,
  };
}

export async function getMediaAssets(workspaceId?: string): Promise<UploadedAsset[]> {
  try {
    const db = await openDb();
    const records = await new Promise<StoredMediaRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const filtered = workspaceId ? records.filter((r) => !r.workspaceId || r.workspaceId === workspaceId) : records;
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.map((r) => {
      let url = urlCache.get(r.id);
      if (!url && r.blob) {
        url = URL.createObjectURL(r.blob);
        urlCache.set(r.id, url);
      }
      return {
        id: r.id,
        workspaceId: r.workspaceId,
        kind: r.kind,
        filename: r.filename,
        mimeType: r.mimeType,
        byteSize: r.byteSize,
        folderId: r.folderId,
        tags: r.tags || [],
        url: url || "",
        thumbnail: r.thumbnail || (r.kind === "image" ? url || null : null),
        createdAt: r.createdAt,
      };
    });
  } catch {
    return [];
  }
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const url = urlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(id);
  }
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

export async function updateMediaAssetRecord(
  id: string,
  patch: { filename?: string; folderId?: string | null; tags?: string[] },
): Promise<UploadedAsset | null> {
  try {
    const db = await openDb();
    const existing = await new Promise<StoredMediaRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (!existing) return null;
    if (patch.filename !== undefined) existing.filename = patch.filename;
    if (patch.folderId !== undefined) existing.folderId = patch.folderId;
    if (patch.tags !== undefined) existing.tags = patch.tags;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(existing);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    let url = urlCache.get(existing.id);
    if (!url && existing.blob) {
      url = URL.createObjectURL(existing.blob);
      urlCache.set(existing.id, url);
    }
    return {
      id: existing.id,
      workspaceId: existing.workspaceId,
      kind: existing.kind,
      filename: existing.filename,
      mimeType: existing.mimeType,
      byteSize: existing.byteSize,
      folderId: existing.folderId,
      tags: existing.tags || [],
      url: url || "",
      thumbnail: existing.thumbnail || (existing.kind === "image" ? url || null : null),
      createdAt: existing.createdAt,
    };
  } catch {
    return null;
  }
}
