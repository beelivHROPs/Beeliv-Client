/**
 * Display formatting only (no rules). Dates arrive as "YYYY-MM-DD" and are
 * parsed as LOCAL calendar dates so no timezone shift can move a day.
 */
import type { ClockTime, ISODate, ISODateTime } from "./types";

export function parseDate(d: ISODate): Date {
  const [y, m, day] = String(d ?? "").split("-").map(Number);
  return new Date(y, m - 1, day);
}

/** Shown wherever a date, time or figure the backend has not recorded would go (live data can be missing a field). */
export const NOT_SET = "Not set yet";

/** True for a usable "YYYY-MM-DD" (or longer ISO) date; false for "", null, undefined or garbage. */
export function isDate(d: ISODate | null | undefined): d is ISODate {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(parseDate(d.slice(0, 10)).getTime());
}

/** Formats a date with `fmt`, or returns `fallback` when the date is missing or invalid (never "Invalid Date"). */
export function maybeDate(d: ISODate | null | undefined, fmt: (d: ISODate) => string, fallback = NOT_SET): string {
  return isDate(d) ? fmt(d.slice(0, 10)) : fallback;
}

export function toISODate(date: Date): ISODate {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(d: ISODate, n: number): ISODate {
  const x = parseDate(d);
  x.setDate(x.getDate() + n);
  return toISODate(x);
}

/** Monday of the week containing `d` (weeks run Mon-Sun). */
export function startOfWeek(d: ISODate): ISODate {
  const day = (parseDate(d).getDay() + 6) % 7;
  return addDays(d, -day);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000);
}

/** "08:00" -> "8:00 AM". */
export function formatClock(t: ClockTime): string {
  const [h, m] = String(t ?? "").split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "—";
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatClockRange(start: ClockTime, end: ClockTime): string {
  return `${formatClock(start)} - ${formatClock(end)}`;
}

export function weekday(d: ISODate, style: "short" | "long" = "short"): string {
  return parseDate(d).toLocaleDateString("en-GB", { weekday: style });
}

export function dayMonth(d: ISODate): string {
  return parseDate(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).replace("Sept", "Sep");
}

/** "Tuesday, 30 September". */
export function fullDay(d: ISODate): string {
  return parseDate(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

/** "Tuesday, 30 September 2026". */
export function fullDate(d: ISODate): string {
  return parseDate(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "1 - 31 October". */
export function periodLabel(from: ISODate, to: ISODate): string {
  const a = parseDate(from);
  const b = parseDate(to);
  const month = b.toLocaleDateString("en-GB", { month: "long" });
  return a.getMonth() === b.getMonth() ? `${a.getDate()} - ${b.getDate()} ${month}` : `${dayMonth(from)} - ${dayMonth(to)}`;
}

export function monthYear(d: ISODate): string {
  return parseDate(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function greetingForNow(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning," : h < 17 ? "Good afternoon," : "Good evening,";
}

export function timeAgo(iso: ISODateTime): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (Number.isNaN(mins)) return "";
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** "87.5%" - trims a trailing ".0". */
export function formatPercent(n: number): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—"; // never "NaN%"
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

/** Share of a total as a whole percentage. Display only. */
export function share(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function displayName(u: { salutation: string | null; firstName: string; lastName: string }): string {
  return u.salutation ? `${u.salutation} ${u.lastName}` : `${u.firstName} ${u.lastName}`;
}

export function initials(name: string): string {
  const parts = String(name ?? "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}
