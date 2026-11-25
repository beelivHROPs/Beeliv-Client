/**
 * Client Attendance & Schedules, LIVE (GET /api/client/shifts, docs/contracts/day1-assignment-client-shifts.sql).
 * One published shift per item, for one person, with its check-in and a status the DATABASE decides
 * (scheduled | present | late | absent | on_leave). This file only reshapes those items into the existing Client types;
 * it adds no lateness, coverage or attendance rule of its own.
 *
 * What is NOT served and so is never invented:
 *  - a required headcount: the published roster IS the positions, so `required` = the people rostered (no "open" slots);
 *  - a staff id / photo: staffId "" and photoUrl null;
 *  - a shift band: "Morning / Evening / Night" is a DISPLAY grouping of the real start time (the real times are always shown).
 * Only relative imports so it can be unit-tested offline.
 */
import { addDays, startOfWeek } from "./format";
import { SHIFTS, SHIFT_ORDER } from "./labels";
import { errorFromReply, isKnownErrorCode, networkError, replyCode } from "../shared/error-messages";
import type {
  AttendanceRecord, AttendanceStatus, AttendanceSummary, DateRange, DepartmentId, ISODate, OutletScope,
  ScheduleDay, ScheduleShiftEntry, ShiftCoverage, ShiftKey,
} from "./types";

export type LiveShiftStatus = "scheduled" | "present" | "late" | "absent" | "on_leave";
export type LiveShift = {
  shiftId: string; date: ISODate; start: string; end: string; breakMins: number; role: string; section: string;
  outletId: string; outletName: string; staffName: string; checkInAt: string | null; checkOutAt: string | null; status: LiveShiftStatus;
};
/** Who a shift's person is on the Client's own staff list (placement id), when that can be told for certain. */
export type MemberLookup = (outletId: string, staffName: string) => string | null;

/** The database refuses a window longer than 62 days; ask in slices of at most this many days (inclusive). */
const SLICE_DAYS = 60;
const TTL_MS = 20_000;
const cache = new Map<string, { at: number; p: Promise<LiveShift[]> }>();

async function fetchSlice(from: ISODate, to: ISODate): Promise<LiveShift[]> {
  let res: Response;
  try {
    res = await fetch(`/api/client/shifts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { credentials: "same-origin", cache: "no-store" });
  } catch {
    throw networkError();
  }
  const j = (await res.json().catch(() => null)) as { ok?: boolean; items?: unknown } | null;
  if (!j || j.ok !== true || !Array.isArray(j.items)) {
    const code = replyCode(j);
    throw code && code !== "unavailable" && isKnownErrorCode(code) ? errorFromReply(j, "shift") : new Error("Shifts could not be loaded. Please try again.");
  }
  return j.items as LiveShift[];
}

/** Published shifts in [from, to] (inclusive), all outlets the user may see. Shared for a few seconds across the page's cards. */
export function liveShifts(from: ISODate, to: ISODate): Promise<LiveShift[]> {
  if (to < from) return Promise.resolve([]);
  const key = `${from}|${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.p;
  const slices: [ISODate, ISODate][] = [];
  for (let a = from; a <= to; a = addDays(a, SLICE_DAYS + 1)) {
    const b = addDays(a, SLICE_DAYS);
    slices.push([a, b < to ? b : to]);
  }
  const p = Promise.all(slices.map(([a, b]) => fetchSlice(a, b))).then((parts) => parts.flat());
  cache.set(key, { at: Date.now(), p });
  p.catch(() => {
    if (cache.get(key)?.p === p) cache.delete(key); // a failed load can be retried
  });
  return p;
}

/** Test helper: forget cached shifts. */
export function resetLiveShifts() {
  cache.clear();
}

export function scoped(items: LiveShift[], scope: OutletScope): LiveShift[] {
  return scope === "all" ? items : items.filter((s) => s.outletId === scope);
}

/** Display band from the real start time (05:00-12:59 morning, 13:00-20:59 evening, otherwise night). */
export function shiftBand(start: string): ShiftKey {
  const h = Number(start.slice(0, 2));
  return h >= 5 && h < 13 ? "morning" : h >= 13 && h < 21 ? "evening" : "night";
}

/** Same wording-based department guess the live workforce list uses (section first, then role). */
export function departmentOf(section: string, role: string): DepartmentId {
  const t = `${section} ${role}`.toLowerCase();
  if (/kitchen|chef|cook/.test(t)) return "kitchen";
  if (/bar/.test(t)) return "bar";
  if (/admin|office|account/.test(t)) return "admin";
  if (/support|clean|security|steward|maint/.test(t)) return "support";
  return "floor-service";
}

const STATUS: Record<Exclude<LiveShiftStatus, "scheduled">, AttendanceStatus> = { present: "present", late: "late", absent: "absent", on_leave: "on-leave" };

const LAGOS = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
/** Check-in as the outlet's wall-clock time (Africa/Lagos, the zone the database decides lateness in). */
export function clockIn(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : LAGOS.format(new Date(t));
}

const memberIdOf = (s: LiveShift, lookup: MemberLookup) => lookup(s.outletId, s.staffName) ?? s.shiftId;

/** Attendance records = shifts whose outcome is known (a still-to-come shift is not a record). Newest first, then by name. */
export function toRecords(items: LiveShift[], lookup: MemberLookup): AttendanceRecord[] {
  return items
    .filter((s): s is LiveShift & { status: Exclude<LiveShiftStatus, "scheduled"> } => s.status !== "scheduled")
    .map((s) => ({
      id: s.shiftId, date: s.date, memberId: memberIdOf(s, lookup), staffId: "", staffName: s.staffName, role: s.role,
      departmentId: departmentOf(s.section, s.role), outletId: s.outletId, shift: shiftBand(s.start), status: STATUS[s.status],
      clockIn: s.status === "present" || s.status === "late" ? clockIn(s.checkInAt) : null,
    }))
    .sort((a, b) => (a.date === b.date ? a.staffName.localeCompare(b.staffName) : a.date < b.date ? 1 : -1));
}

/**
 * One day's counts. scheduled = every published shift that day (including ones still to come);
 * attendanceRate = (present + late) / (present + late + absent): only shifts that are due, approved leave excluded,
 * one decimal, 0 when nothing is due yet (never a division by zero).
 */
export function summary(date: ISODate, items: LiveShift[]): AttendanceSummary {
  const day = items.filter((s) => s.date === date);
  const n = (st: LiveShiftStatus) => day.filter((s) => s.status === st).length;
  const present = n("present"), late = n("late"), absent = n("absent"), onLeave = n("on_leave");
  const due = present + late + absent;
  return { date, scheduled: day.length, present, late, absent, onLeave, attendanceRate: due ? Math.round(((present + late) / due) * 1000) / 10 : 0 };
}

/** Day-by-day summaries over the range; days with no published shift are left out (not drawn as zero). */
export function trend(range: DateRange, items: LiveShift[]): AttendanceSummary[] {
  const out: AttendanceSummary[] = [];
  for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
    const s = summary(d, items);
    if (s.scheduled > 0) out.push(s);
  }
  return out;
}

const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

/** Today's coverage by band: the people rostered, with the band's earliest start and latest end (overnight-aware). */
export function coverage(date: ISODate, items: LiveShift[]): ShiftCoverage[] {
  const day = items.filter((s) => s.date === date);
  return SHIFT_ORDER.flatMap((band): ShiftCoverage[] => {
    const list = day.filter((s) => shiftBand(s.start) === band);
    if (!list.length) return [];
    const start = list.reduce((m, s) => (minutes(s.start) < minutes(m) ? s.start : m), list[0].start);
    const endOf = (s: LiveShift) => minutes(s.end) + (minutes(s.end) <= minutes(s.start) ? 1440 : 0);
    const end = list.reduce((m, s) => (endOf(s) > endOf(m) ? s : m), list[0]).end;
    return [{ shift: band, label: SHIFTS[band].label, start, end, assigned: list.length, required: list.length }];
  });
}

/** Monday to Sunday of the week containing weekOf; empty when nothing is published that week (the approved empty state). */
export function week(weekOf: ISODate, items: LiveShift[]): ScheduleDay[] {
  const first = startOfWeek(weekOf);
  const days = Array.from({ length: 7 }, (_, i) => addDays(first, i));
  if (!items.some((s) => days.includes(s.date))) return [];
  return days.map((date) => {
    const day = items.filter((s) => s.date === date);
    const count = (k: ShiftKey) => day.filter((s) => shiftBand(s.start) === k).length;
    return { date, total: day.length, shifts: { morning: count("morning"), evening: count("evening"), night: count("night") } };
  });
}

/** One card per outlet, day and exact start-end time, listing the people rostered on it. */
export function scheduleEntries(items: LiveShift[], lookup: MemberLookup): ScheduleShiftEntry[] {
  const groups = new Map<string, ScheduleShiftEntry>();
  for (const s of items) {
    const key = `${s.date}|${s.outletId}|${s.start}|${s.end}`;
    let g = groups.get(key);
    if (!g) {
      const band = shiftBand(s.start);
      g = { id: key, date: s.date, shift: band, label: SHIFTS[band].label, start: s.start, end: s.end, outletId: s.outletId, outletName: s.outletName, assigned: 0, required: 0, staff: [] };
      groups.set(key, g);
    }
    g.staff.push({ memberId: memberIdOf(s, lookup), name: s.staffName, role: s.role, departmentId: departmentOf(s.section, s.role), photoUrl: null });
    g.assigned = g.required = g.staff.length;
  }
  return [...groups.values()].sort((a, b) => (a.date === b.date ? (a.start === b.start ? a.outletName.localeCompare(b.outletName) : a.start < b.start ? -1 : 1) : a.date < b.date ? -1 : 1));
}
