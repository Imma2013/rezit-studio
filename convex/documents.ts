import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getDocument = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;
    return ctx.db
      .query('documents')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .first();
  },
});

export const saveDocument = mutation({
  args: {
    projectId: v.id('projects'),
    width: v.number(),
    height: v.number(),
    nodes: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        width: args.width,
        height: args.height,
        nodes: args.nodes,
        version: existing.version + 1,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return ctx.db.insert('documents', {
      projectId: args.projectId,
      width: args.width,
      height: args.height,
      nodes: args.nodes,
      version: 1,
      updatedAt: Date.now(),
    });
  },
});
