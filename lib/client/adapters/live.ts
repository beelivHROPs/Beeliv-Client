"use client";

/**
 * LIVE Client adapter: the APPROVED Client screens for a real, signed-in client user (lead 2026-11-21: real data only,
 * approved design only, no sample, no prototype).
 * Real today (GET /api/client/portal): the user's own name/email, their outlets, and the staff placed there
 * (name, role, department, outlet, start date only - data-visibility-matrix).
 * Everything without a backend yet (attendance, schedules, candidates, requests, documents, payroll, notifications)
 * is EMPTY: the approved screens show their empty states. Nothing is invented; writes say "not connected yet".
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

type PortalOutlet = { outletId: string; outletName: string; clientId: string; clientName: string; city: string };
type PortalMember = { placementId: string; clientId: string; clientName: string; outletId: string; outletName: string; name: string; role: string; department: string; startDate: string; status: string };
type Portal = { fullName: string; email: string; outlets: PortalOutlet[]; workforce: PortalMember[]; workforceAvailable: boolean };

let cached: Promise<Portal> | null = null;
function portal(): Promise<Portal> {
  if (!cached) {
    cached = fetch("/api/client/portal", { credentials: "same-origin", cache: "no-store" }).then(async (res) => {
      const j = (await res.json().catch(() => null)) as ({ ok?: boolean } & Portal) | null;
      if (!j || j.ok !== true) throw new Error("Your account could not be loaded. Reload the page to try again.");
      return j;
    });
    cached.catch(() => {
      cached = null; // a failed load can be retried
    });
  }
  return cached;
}

const NOT_CONNECTED = "This isn't connected yet. Beeliv will switch it on soon.";
const TEAM = { name: "Beeliv team", role: "Your Beeliv contact", phone: null, email: null };

function department(text: string): DepartmentId {
  const t = text.toLowerCase();
  if (/kitchen|chef|cook/.test(t)) return "kitchen";
  if (/bar/.test(t)) return "bar";
  if (/admin|office|account/.test(t)) return "admin";
  if (/support|clean|security|steward|maint/.test(t)) return "support";
  return "floor-service";
}
const DEPT_LABEL: Record<DepartmentId, string> = { "floor-service": "Floor service", kitchen: "Kitchen", bar: "Bar", admin: "Admin", support: "Support" };

function inScope<T extends { outletId: string }>(rows: T[], scope: OutletScope): T[] {
  return scope === "all" ? rows : rows.filter((r) => r.outletId === scope);
}

function member(m: PortalMember): WorkforceMember {
  return {
    id: m.placementId,
    staffId: "",
    name: m.name,
    role: m.role,
    departmentId: department(m.department),
    outletId: m.outletId,
    assignmentStatus: "active",
    startDate: m.startDate,
    shift: "" as WorkforceMember["shift"], // not recorded by the backend yet; screens show a dash
    photoUrl: null,
  };
}

async function session(): Promise<ClientSession> {
  const p = await portal();
  const parts = p.fullName.trim().split(/\s+/).filter(Boolean);
  const clients = [...new Set(p.outlets.map((o) => o.clientName))];
  return {
    accountState: p.outlets.length ? "active" : "no-outlets",
    user: { id: "", firstName: parts[0] ?? "", lastName: parts.slice(1).join(" "), salutation: null, avatarUrl: null, email: p.email },
    clientId: p.outlets[0]?.clientId,
    clientName: clients.length === 1 ? clients[0] : clients.length ? "Your businesses" : "",
    outlets: p.outlets.map((o) => ({ id: o.outletId, name: o.outletName, location: o.city, imageUrl: null })),
    defaultScope: "all",
    team: TEAM,
  };
}

const zero = (date: string) => ({ date, scheduled: 0, present: 0, late: 0, absent: 0, onLeave: 0, attendanceRate: 0 });
const today = () => new Date().toISOString().slice(0, 10);
const listeners = new Set<(e: AdapterEvent) => void>();

export const liveClientAdapter: ClientAnalyticsAdapter = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSession: session,
  async getOverview(scope): Promise<ClientOverview> {
    const [s, p] = await Promise.all([session(), portal()]);
    const outlet = scope === "all" ? null : (s.outlets.find((o) => o.id === scope) ?? null);
    return {
      scope,
      scopeLabel: outlet ? outlet.name : s.clientName ? `All ${s.clientName} outlets` : "All your outlets",
      greetingName: s.user.firstName,
      outlet,
      metrics: { ...zero(today()), activeStaff: inScope(p.workforce, scope).length, openPositions: 0 },
      checkedIn: 0,
      attention: [],
      team: TEAM,
    };
  },
  getAttendanceSummary: async (_scope, date) => zero(date),
  getAttendanceTrend: async () => [],
  async getWorkforceDistribution(scope): Promise<DepartmentCount[]> {
    const counts = new Map<DepartmentId, number>();
    for (const m of inScope((await portal()).workforce, scope)) counts.set(department(m.department), (counts.get(department(m.department)) ?? 0) + 1);
    return [...counts].map(([departmentId, count]) => ({ departmentId, label: DEPT_LABEL[departmentId], count }));
  },
  getScheduleCoverage: async () => [],
  getWeekSchedule: async () => [],
  getRecruitmentSummary: async () => ({ awaitingFeedback: 0, openPositions: 0, positions: [] }),
  getComplianceSummary: async () => ({ total: 0, complete: 0, outstanding: 0, updateRequired: 0, expiringSoon: 0, percentComplete: 0, attention: [] }),
  getPayrollVisibility: async () => ({ upcoming: [], history: [] }),
  getRecentActivity: async () => [],
  getNotifications: async () => [],
  markNotificationRead: async () => undefined,
  markAllNotificationsRead: async () => undefined,
  deleteNotification: async () => undefined,
  getWorkforce: async (scope) => inScope((await portal()).workforce, scope).map(member),
  getAttendanceRecords: async () => [],
  getCandidates: async () => [],
  getWorkforceRequests: async () => [],
  getDocuments: async () => [],
  async getWorkforceMemberDetail(scope, memberId): Promise<WorkforceMemberDetail | null> {
    const m = inScope((await portal()).workforce, scope).find((x) => x.placementId === memberId);
    if (!m) return null;
    return {
      member: member(m),
      outletName: m.outletName,
      clientName: m.clientName,
      attendance: { from: today(), to: today(), scheduled: 0, present: 0, late: 0, absent: 0, onLeave: 0, attendanceRate: 0 },
      recentAttendance: [],
      upcomingSchedule: [],
      documents: [],
      history: [],
    };
  },
  getSchedule: async () => ({ canEdit: false, shifts: [] }),
  getCandidate: async () => null,
  submitCandidateFeedback: async () => {
    throw new Error(NOT_CONNECTED);
  },
  getWorkforceRequest: async () => null,
  createWorkforceRequest: async () => {
    throw new Error(NOT_CONNECTED);
  },
  getWorkforceRequestReasons: async () => [],
  // Setup is complete for anyone who reaches the Client screens (the real setup flow lives at /client/setup).
  // Settings shows the person's REAL name; job title, phone and preferences are not served yet, so they are empty.
  async getOnboarding() {
    const p = await portal();
    return {
      status: "complete" as const,
      currentStep: 0,
      invitedBy: TEAM,
      items: [],
      details: { fullName: p.fullName, jobTitle: "", phone: "", preferredContact: "email" as const, avatarUrl: null },
      notifications: {} as import("../types").NotificationPrefs,
      agreements: [],
    };
  },
  saveOnboarding: async () => {
    throw new Error(NOT_CONNECTED);
  },
};
