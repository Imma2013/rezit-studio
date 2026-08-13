import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getByProject = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const timeline = await ctx.db
      .query('videoTimelines')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .unique();
    return timeline;
  },
});

export const saveTimeline = mutation({
  args: {
    projectId: v.id('projects'),
    aspectRatio: v.union(v.literal('9:16'), v.literal('16:9'), v.literal('1:1')),
    durationSeconds: v.number(),
    tracks: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('videoTimelines')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        aspectRatio: args.aspectRatio,
        durationSeconds: args.durationSeconds,
        tracks: args.tracks,
        updatedAt: now,
      });
      return existing._id;
    }

    const id = await ctx.db.insert('videoTimelines', {
      projectId: args.projectId,
      aspectRatio: args.aspectRatio,
      durationSeconds: args.durationSeconds,
      tracks: args.tracks,
      updatedAt: now,
    });
    return id;
  },
});
