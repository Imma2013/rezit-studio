import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const listProjects = query({
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
      .query('projects')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    mode: v.union(v.literal('graphic'), v.literal('video'), v.literal('calendar')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');
    let user = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
      .unique();
    if (!user) {
      const userId = await ctx.db.insert('users', {
        firebaseUid: identity.subject,
        email: identity.email,
        displayName: identity.name,
      });
      user = await ctx.db.get(userId);
    }
    return ctx.db.insert('projects', {
      ownerId: user!._id,
      name: args.name,
      mode: args.mode,
      updatedAt: Date.now(),
    });
  },
});
