"use strict";
// Content-calendar helpers for the planner (FR-6). Pure and clock-free: due
// times are supplied by the caller via a getter. The calendar matrix is a
// month-view grid; the week starts on Monday.
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupByDay = groupByDay;
exports.filterPosts = filterPosts;
exports.calendarMatrix = calendarMatrix;
exports.weekDays = weekDays;
/** Group posts by their local calendar day (yyyy-mm-dd, in the day order keys sort naturally). */
function groupByDay(posts, getDueMs) {
    const out = {};
    for (const post of posts) {
        const key = isoDay(getDueMs(post));
        (out[key] ?? (out[key] = [])).push(post);
    }
    return out;
}
/** Filter posts by any combination of platform, accountId, and status. */
function filterPosts(posts, filter) {
    return posts.filter((p) => {
        if (filter.platform != null && p.platform !== filter.platform)
            return false;
        if (filter.accountId != null && p.accountId !== filter.accountId)
            return false;
        if (filter.status != null && p.status !== filter.status)
            return false;
        return true;
    });
}
/**
 * A 6x7 month grid (6 weeks of 7 days) for `month` (1-12) of `year`. The grid
 * always starts on the Monday on or before the first of the month and runs 42
 * cells so the UI never reflows. `inMonth` is false for the leading/trailing
 * days that belong to the previous/next month.
 */
function calendarMatrix(year, month) {
    // First day of the target month, in UTC to avoid local-tz drift.
    const first = new Date(Date.UTC(year, month - 1, 1));
    // JS getUTCDay: 0=Sun..6=Sat. Convert to Monday-first index 0..6.
    const mondayIndex = (first.getUTCDay() + 6) % 7;
    // Start date = first of month minus mondayIndex days.
    const start = new Date(first);
    start.setUTCDate(first.getUTCDate() - mondayIndex);
    const weeks = [];
    const cursor = new Date(start);
    for (let w = 0; w < 6; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            week.push({
                dateIso: isoDayFromDate(cursor),
                inMonth: cursor.getUTCMonth() === month - 1 && cursor.getUTCFullYear() === year,
            });
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}
/**
 * The seven yyyy-mm-dd dates of the Monday-started week containing `dateIso`.
 */
function weekDays(dateIso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateIso);
    if (!m)
        throw new Error(`weekDays: bad date: ${dateIso}`);
    const base = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    const mondayIndex = (base.getUTCDay() + 6) % 7;
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - mondayIndex);
    const days = [];
    const cursor = new Date(monday);
    for (let i = 0; i < 7; i++) {
        days.push(isoDayFromDate(cursor));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
}
function isoDay(epochMs) {
    return isoDayFromDate(new Date(epochMs));
}
function isoDayFromDate(d) {
    const y = d.getUTCFullYear().toString().padStart(4, "0");
    const mo = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = d.getUTCDate().toString().padStart(2, "0");
    return `${y}-${mo}-${day}`;
}
