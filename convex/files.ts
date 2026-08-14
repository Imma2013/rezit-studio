import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveAsset = mutation({
  args: {
    storageId: v.id('_storage'),
    workspaceId: v.optional(v.string()),
    filename: v.string(),
    mimeType: v.string(),
    byteSize: v.number(),
    kind: v.union(v.literal('image'), v.literal('video'), v.literal('audio'), v.literal('svg')),
    folderId: v.optional(v.union(v.string(), v.null())),
    thumbnailUrl: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    const assetId = await ctx.db.insert('assets', {
      storageId: args.storageId,
      workspaceId: args.workspaceId || 'ws-personal',
      filename: args.filename,
      mimeType: args.mimeType,
      byteSize: args.byteSize,
      kind: args.kind,
      folderId: args.folderId || null,
      thumbnailUrl: args.thumbnailUrl || null,
      url: url || '',
      tags: args.tags || [],
      createdAt: Date.now(),
    });
    return { id: assetId, url: url || '' };
  },
});

export const listAssets = query({
  args: {
    workspaceId: v.optional(v.string()),
    folderId: v.optional(v.union(v.string(), v.null())),
    q: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let assets = await ctx.db.query('assets').collect();
    if (args.workspaceId) {
      assets = assets.filter((a) => !a.workspaceId || a.workspaceId === args.workspaceId);
    }
    if (args.folderId !== undefined) {
      assets = assets.filter((a) => a.folderId === args.folderId);
    }
    if (args.q) {
      const q = args.q.toLowerCase();
      assets = assets.filter((a) => a.filename.toLowerCase().includes(q));
    }
    return await Promise.all(
      assets.map(async (a) => {
        const url = await ctx.storage.getUrl(a.storageId);
        return {
          id: a._id,
          workspaceId: a.workspaceId,
          kind: a.kind,
          filename: a.filename,
          mimeType: a.mimeType,
          byteSize: a.byteSize,
          folderId: a.folderId,
          tags: a.tags,
          url: url || a.url || '',
          thumbnail: a.thumbnailUrl || url || null,
          createdAt: new Date(a.createdAt).toISOString(),
        };
      })
    );
  },
});

export const deleteAsset = mutation({
  args: { id: v.id('assets') },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (asset) {
      await ctx.storage.delete(asset.storageId);
      await ctx.db.delete(args.id);
    }
  },
});
