"use client";

/**
 * LIVE Client adapter: the APPROVED Client screens for a real, signed-in client user (lead 2026-11-21: real data only,
 * approved design only, no sample, no prototype).
 * Real today (GET /api/client/portal): the user's own name/email, their outlets, and the staff placed there
 * (name, role, department, outlet, start date only - data-visibility-matrix).
 * Real since day1-assignment-client-shifts.sql (GET /api/client/shifts, ../shifts-live.ts): published shifts and check-ins,
 * so Attendance, Schedules and the Overview attendance figures. An empty week is an empty state, never an error.
 * Real since day2-warnings-requests.sql (../requests-live.ts): Workforce Requests (list, detail, new request); and Compliance
 * (document STATUS of ordinary slots only, staff_doc_completion client audience).
 * Everything without a backend yet (candidates, payroll, notifications)
 * is EMPTY: the approved screens show their empty states or Coming soon (components/client/ClientLiveGate.tsx).
 * Nothing is invented. The Beeliv contact is the real support address (hello@beeliv.co, the Supabase/Resend sender).
 */
import type { ClientAnalyticsAdapter, AdapterEvent } from "../adapter";
import type {
  ClientOverview,
  ClientSession,
  DepartmentCount,
  DepartmentId,
  OutletScope,
  WorkforceMember,
  WorkforceMemberDetail,
} from "../types";
import { coverage, liveShifts, scheduleEntries, scoped, shiftBand, summary, toRecords, trend, week, type MemberLookup } from "../shifts-live";
import { addDays, startOfWeek, todayISO } from "../format";
import { errorFromReply, isKnownErrorCode, networkError, replyCode } from "../../shared/error-messages";
import {
  complianceSummary, createLiveRequest, department, DEPT_LABEL, liveCompliance, liveRequests, markLiveRequestSeen, scopedRequests,
} from "../requests-live";

type PortalOutlet = { outletId: string; outletName: string; clientId: string; clientName: string; city: string };
type PortalMember = { placementId: string; clientId: string; clientName: string; outletId: string; outletName: string; name: string; role: string; department: string; startDate: string; status: string };
type Portal = { fullName: string; email: string; outlets: PortalOutlet[]; workforce: PortalMember[]; workforceAvailable: boolean; profile: { phone: string; jobTitle: string; notifications: Record<string, boolean> } | null };

let cached: Promise<Portal> | null = null;
function portal(): Promise<Portal> {
  if (!cached) {
    cached = fetch("/api/client/portal", { credentials: "same-origin", cache: "no-store" }).catch(() => { throw networkError(); }).then(async (res) => {
      const j = (await res.json().catch(() => null)) as ({ ok?: boolean } & Portal) | null;
      if (!j || j.ok !== true) {
        const code = replyCode(j);
        throw code && code !== "unavailable" && isKnownErrorCode(code) ? errorFromReply(j) : new Error("Your account could not be loaded. Reload the page to try again.");
      }
      return j;
    });
    cached.catch(() => {
      cached = null; // a failed load can be retried
    });
  }
  return cached;
}

/** Only reachable from screens that show Coming soon in live; a calm way out, never a fake success. */
const NOT_CONNECTED = "This is coming soon. In the meantime, email Beeliv at hello@beeliv.co.";
const MANY = "Your businesses";
const TEAM = { name: "Beeliv team", role: "Your Beeliv contact", phone: null, email: "hello@beeliv.co" };


function inScope<T extends { outletId: string }>(rows: T[], scope: OutletScope): T[] {
  return scope === "all" ? rows : rows.filter((r) => r.outletId === scope);
}

function member(m: PortalMember): WorkforceMember {
  return {
    id: m.placementId,
    staffId: "",
    name: m.name || "",
    role: m.role || "",
    departmentId: department(m.department),
    outletId: m.outletId,
    assignmentStatus: "active",
    startDate: m.startDate || "", // screens show "Not set yet" when missing
    shift: "" as WorkforceMember["shift"], // not recorded by the backend yet; screens show a dash
    photoUrl: null,
  };
}

async function session(): Promise<ClientSession> {
  const p = await portal();
  const parts = String(p.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const clients = [...new Set(p.outlets.map((o) => o.clientName))];
  return {
    accountState: p.outlets.length ? "active" : "no-outlets",
    user: { id: "", firstName: parts[0] ?? "", lastName: parts.slice(1).join(" "), salutation: null, avatarUrl: null, email: p.email ?? "" },
    clientId: p.outlets[0]?.clientId,
    clientName: clients.length === 1 ? clients[0] : clients.length ? MANY : "",
    outlets: p.outlets.map((o) => ({ id: o.outletId, name: o.outletName, location: o.city, imageUrl: null })),
    defaultScope: "all",
    team: TEAM,
  };
}

/**
 * A shift's person on the user's own staff list (placement id), so a record opens their staff page. Only when exactly one
 * placed person at that outlet has that name; otherwise none (the record keeps its shift id and is never guessed).
 */
async function memberLookup(): Promise<MemberLookup> {
  const p = await portal().catch(() => null);
  const byKey = new Map<string, string | null>();
  for (const m of p?.workforce ?? []) {
    const key = `${m.outletId}|${String(m.name ?? "").trim().toLowerCase()}`;
    byKey.set(key, byKey.has(key) ? null : m.placementId);
  }
  return (outletId, name) => byKey.get(`${outletId}|${name.trim().toLowerCase()}`) ?? null;
}

/** The local calendar day, the same "today" the screens use. */
const today = () => todayISO();
const listeners = new Set<(e: AdapterEvent) => void>();

export const liveClientAdapter: ClientAnalyticsAdapter = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSession: session,
  async getOverview(scope): Promise<ClientOverview> {
    const day = today();
    const [s, p, shifts] = await Promise.all([session(), portal(), liveShifts(day, day)]);
    const mine = scoped(shifts, scope);
    const outlet = scope === "all" ? null : (s.outlets.find((o) => o.id === scope) ?? null);
    return {
      scope,
      scopeLabel: outlet ? outlet.name : s.clientName && s.clientName !== MANY ? `All ${s.clientName} outlets` : "All your outlets",
      greetingName: s.user.firstName || "there",
      outlet,
      metrics: { ...summary(day, mine), activeStaff: inScope(p.workforce, scope).length, openPositions: 0 },
      // Members with a recorded check-in today (present or late), as decided by the database.
      checkedIn: mine.filter((x) => x.date === day && (x.status === "present" || x.status === "late")).length,
      attention: [],
      team: TEAM,
    };
  },
  getAttendanceSummary: async (scope, date) => summary(date, scoped(await liveShifts(date, date), scope)),
  getAttendanceTrend: async (scope, range) => trend(range, scoped(await liveShifts(range.from, range.to), scope)),
  async getWorkforceDistribution(scope): Promise<DepartmentCount[]> {
    const counts = new Map<DepartmentId, number>();
    for (const m of inScope((await portal()).workforce, scope)) counts.set(department(m.department), (counts.get(department(m.department)) ?? 0) + 1);
    return [...counts].map(([departmentId, count]) => ({ departmentId, label: DEPT_LABEL[departmentId], count }));
  },
  getScheduleCoverage: async (scope, date) => coverage(date, scoped(await liveShifts(date, date), scope)),
  async getWeekSchedule(scope, weekOf) {
    const first = startOfWeek(weekOf);
    return week(weekOf, scoped(await liveShifts(first, addDays(first, 6)), scope));
  },
  getRecruitmentSummary: async () => ({ awaitingFeedback: 0, openPositions: 0, positions: [] }),
  // Document STATUS of ordinary slots for the placed staff (GET /api/client/compliance). Same items as the list, so the numbers agree.
  getComplianceSummary: async (scope) => complianceSummary(inScope(await liveCompliance(), scope)),
  getPayrollVisibility: async () => ({ upcoming: [], history: [] }),
  getRecentActivity: async () => [],
  getNotifications: async () => [],
  markNotificationRead: async () => undefined,
  markAllNotificationsRead: async () => undefined,
  deleteNotification: async () => undefined,
  getWorkforce: async (scope) => inScope((await portal()).workforce, scope).map(member),
  async getAttendanceRecords(scope, range) {
    const [items, lookup] = await Promise.all([liveShifts(range.from, range.to), memberLookup()]);
    return toRecords(scoped(items, scope), lookup);
  },
  getCandidates: async () => [],
  // Staff requests (GET /api/client/requests, day2-warnings-requests.sql part B).
  getWorkforceRequests: async (scope) => scopedRequests((await liveRequests()).items, scope),
  getDocuments: async (scope) => inScope(await liveCompliance(), scope),
  async getWorkforceMemberDetail(scope, memberId): Promise<WorkforceMemberDetail | null> {
    const m = inScope((await portal()).workforce, scope).find((x) => x.placementId === memberId);
    if (!m) return null;
    // The same real data as Attendance, Schedules and Compliance, narrowed to this one person (placement id).
    const day = today(), from = addDays(day, -29), to = addDays(day, 13);
    const [items, lookup, docs] = await Promise.all([
      liveShifts(from, to).catch(() => [] as Awaited<ReturnType<typeof liveShifts>>),
      memberLookup().catch(() => (() => null) as MemberLookup),
      liveCompliance().catch(() => [] as Awaited<ReturnType<typeof liveCompliance>>),
    ]);
    const mine = scoped(items, scope).filter((x) => lookup(x.outletId, x.staffName) === memberId);
    const records = toRecords(mine.filter((x) => x.date <= day), lookup);
    const count = (st: string) => records.filter((r) => r.status === st).length;
    const scheduled = records.length, present = count("present");
    return {
      member: member(m),
      outletName: m.outletName || "",
      clientName: m.clientName || "",
      attendance: { from, to: day, scheduled, present, late: count("late"), absent: count("absent"), onLeave: count("on-leave"), attendanceRate: scheduled ? Math.round((present / scheduled) * 1000) / 10 : 0 },
      recentAttendance: records.slice(0, 5),
      upcomingSchedule: mine.filter((x) => x.date >= day && x.status === "scheduled").sort((x, y) => `${x.date}${x.start}`.localeCompare(`${y.date}${y.start}`)).slice(0, 7)
        .map((x) => ({ date: x.date, shift: shiftBand(x.start), start: x.start.slice(0, 5), end: x.end.slice(0, 5) })),
      documents: inScope(docs, scope).filter((d) => d.memberId === memberId),
      history: [],
    };
  },
  // Read-only: the Client's edit permission is a Beeliv decision that is still open.
  async getSchedule(scope, range) {
    const [items, lookup] = await Promise.all([liveShifts(range.from, range.to), memberLookup()]);
    return { canEdit: false, shifts: scheduleEntries(scoped(items, scope), lookup) };
  },
  getCandidate: async () => null,
  submitCandidateFeedback: async () => {
    throw new Error(NOT_CONNECTED);
  },
  async getWorkforceRequest(scope, id) {
    const r = scopedRequests((await liveRequests()).items, scope).find((x) => x.id === id) ?? null;
    // Opening it clears the "Updated" mark on the server; this view still shows the update notice once.
    if (r?.hasUpdate) void markLiveRequestSeen(r.id);
    return r;
  },
  async createWorkforceRequest(_scope, input) {
    const created = await createLiveRequest(input);
    for (const l of listeners) l("notifications"); // open lists refresh quietly
    return created;
  },
  getWorkforceRequestReasons: async () => (await liveRequests()).reasons,
  // Setup is complete for anyone who reaches the Client screens (the real setup flow lives at /client/setup).
  // Settings shows the person's REAL name; job title, phone and preferences are not served yet, so they are empty.
  async getOnboarding() {
    const p = await portal();
    return {
      status: "complete" as const,
      currentStep: 0,
      invitedBy: TEAM,
      items: [],
      details: { fullName: p.fullName ?? "", jobTitle: p.profile?.jobTitle ?? "", phone: p.profile?.phone ?? "", preferredContact: "email" as const, avatarUrl: null },
      notifications: (p.profile?.notifications ?? {}) as import("../types").NotificationPrefs,
      agreements: [],
    };
  },
  // Settings: the person's OWN name, phone, job title and notification preferences (client-portal-profile.sql).
  async saveOnboarding(input) {
    const body: Record<string, unknown> = {};
    if (input.details) Object.assign(body, { fullName: input.details.fullName, phone: input.details.phone, jobTitle: input.details.jobTitle });
    if (input.notifications) body.notifications = Object.fromEntries(Object.entries(input.notifications).filter(([, v]) => typeof v === "boolean"));
    const res = await fetch("/api/client/profile", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => { throw networkError(); });
    const j = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string } | null;
    // phone_in_use never says whose number it is (lib/shared/error-messages.ts).
    if (!j?.ok) throw errorFromReply(j, undefined, { invalid_request: "Check the details and try again.", unavailable: "We couldn't save that. Please try again." });
    cached = null; // reload the saved values
    return this.getOnboarding();
  },
};
