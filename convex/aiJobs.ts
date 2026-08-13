import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const listJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
      .unique();
    if (!user) return [];
    return ctx.db
      .query('aiJobs')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();
  },
});

export const enqueueJob = mutation({
  args: {
    kind: v.union(v.literal('image'), v.literal('video'), v.literal('copilot')),
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    const user = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    return ctx.db.insert('aiJobs', {
      ownerId: user._id,
      projectId: args.projectId,
      kind: args.kind,
      status: 'queued',
      createdAt: Date.now(),
    });
  },
});
