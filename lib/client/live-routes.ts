/**
 * Live Client (lead rule 2026-11-21): real data or "Coming soon", never sample data.
 * These approved screens have no Beeliv backend yet, so real client users see Coming soon there
 * (components/client/ClientLiveGate.tsx), and Home never shows their numbers as if they were real.
 * Real today: Overview, My Workforce, Settings, Notifications, Search, Support.
 * Pure module: safe in server and client code and in node tests.
 */
export const LIVE_SOON: readonly { prefix: string; title: string }[] = [
  { prefix: "/client/analytics", title: "Analytics" },
  { prefix: "/client/attendance", title: "Attendance" },
  { prefix: "/client/compliance", title: "Compliance" },
  { prefix: "/client/payroll", title: "Payroll" },
  { prefix: "/client/recruitment", title: "Recruitment" },
  { prefix: "/client/reports", title: "Reports" },
  { prefix: "/client/requests", title: "Staff requests" },
  { prefix: "/client/schedules", title: "Schedules" },
];

/** The Coming-soon entry for this path or href (query and hash ignored), or undefined when the screen has real data. */
export function liveSoonFor(hrefOrPath: string): { prefix: string; title: string } | undefined {
  const path = hrefOrPath.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return LIVE_SOON.find((s) => path === s.prefix || path.startsWith(`${s.prefix}/`));
}
