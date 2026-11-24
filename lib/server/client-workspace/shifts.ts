/**
 * Client Attendance & Schedules (docs/contracts/day1-assignment-client-shifts.sql, public.client_portal_shifts). Pure: no I/O,
 * so it is unit-tested offline (tests/day1-assignment-shifts.test.cjs). The database re-checks the session, the agreements and
 * the outlet scope; this only bounds the request and keeps the documented fields of the answer.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
/** The database refuses a window longer than this many days (p_to - p_from). */
export const MAX_SHIFT_SPAN_DAYS = 62;
const STATUSES = ["scheduled", "present", "late", "absent", "on_leave"] as const;

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

export type ClientShiftStatus = (typeof STATUSES)[number];
export type ClientShift = {
  shiftId: string; date: string; start: string; end: string; breakMins: number; role: string; section: string;
  outletId: string; outletName: string; staffName: string; checkInAt: string | null; checkOutAt: string | null; status: ClientShiftStatus;
};

/** A real calendar date ("2026-02-30" is refused), as days since the epoch; null when not one. */
function dayNumber(v: unknown): number | null {
  if (typeof v !== "string" || !DATE.test(v)) return null;
  const t = Date.parse(`${v}T00:00:00Z`);
  return Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== v ? null : t / 86_400_000;
}

/** { from, to } as real dates, from <= to, at most MAX_SHIFT_SPAN_DAYS apart, and nothing else; otherwise null. */
export function parseShiftRange(input: unknown): { from: string; to: string } | null {
  const r = rec(input);
  if (!r || Object.keys(r).some((k) => k !== "from" && k !== "to")) return null;
  const a = dayNumber(r.from), b = dayNumber(r.to);
  if (a === null || b === null || b < a || b - a > MAX_SHIFT_SPAN_DAYS) return null;
  return { from: r.from as string, to: r.to as string };
}

const isoOrNull = (v: unknown) => (typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v)) ? v : null);

/** Keeps only well-formed items with the documented fields (staff name, role, section, times, status: no contact, no pay). */
export function projectClientShifts(items: unknown): ClientShift[] {
  return (Array.isArray(items) ? items : []).slice(0, 5000).flatMap((raw): ClientShift[] => {
    const s = rec(raw);
    if (!s || !UUID.test(str(s.shiftId)) || !UUID.test(str(s.outletId)) || dayNumber(s.date) === null || !TIME.test(str(s.start)) || !TIME.test(str(s.end))) return [];
    const status = STATUSES.find((x) => x === s.status);
    if (!status) return [];
    const brk = Number.isSafeInteger(s.breakMins) && (s.breakMins as number) >= 0 && (s.breakMins as number) <= 1440 ? (s.breakMins as number) : 0;
    return [{
      shiftId: str(s.shiftId), date: str(s.date), start: str(s.start), end: str(s.end), breakMins: brk, role: str(s.role), section: str(s.section),
      outletId: str(s.outletId), outletName: str(s.outletName), staffName: str(s.staffName), checkInAt: isoOrNull(s.checkInAt), checkOutAt: isoOrNull(s.checkOutAt), status,
    }];
  });
}
