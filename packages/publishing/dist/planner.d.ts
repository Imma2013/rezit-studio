import type { PostStatus, SocialPlatform } from "./types";
/** Group posts by their local calendar day (yyyy-mm-dd, in the day order keys sort naturally). */
export declare function groupByDay<T>(posts: readonly T[], getDueMs: (post: T) => number): Record<string, T[]>;
export interface PostFilter {
    platform?: SocialPlatform;
    accountId?: string;
    status?: PostStatus;
}
/** A minimal filterable post shape. Extra fields are ignored. */
export interface FilterablePost {
    platform?: SocialPlatform;
    accountId?: string;
    status?: PostStatus;
}
/** Filter posts by any combination of platform, accountId, and status. */
export declare function filterPosts<T extends FilterablePost>(posts: readonly T[], filter: PostFilter): T[];
export interface CalendarCell {
    dateIso: string;
    inMonth: boolean;
}
/**
 * A 6x7 month grid (6 weeks of 7 days) for `month` (1-12) of `year`. The grid
 * always starts on the Monday on or before the first of the month and runs 42
 * cells so the UI never reflows. `inMonth` is false for the leading/trailing
 * days that belong to the previous/next month.
 */
export declare function calendarMatrix(year: number, month: number): CalendarCell[][];
/**
 * The seven yyyy-mm-dd dates of the Monday-started week containing `dateIso`.
 */
export declare function weekDays(dateIso: string): string[];
