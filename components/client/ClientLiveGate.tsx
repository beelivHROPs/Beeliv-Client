"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ComingSoonScreen } from "@/components/shared/ComingSoonScreen";

/**
 * Live Client (lead rule 2026-11-21): real data or "Coming soon", never sample data.
 * These approved screens have no Beeliv backend yet, so real client users see Coming soon there.
 * Real today: Overview, My Workforce, Settings, Notifications, Search, Support.
 */
const SOON: { prefix: string; title: string }[] = [
  { prefix: "/client/analytics", title: "Analytics" },
  { prefix: "/client/attendance", title: "Attendance" },
  { prefix: "/client/compliance", title: "Compliance" },
  { prefix: "/client/payroll", title: "Payroll" },
  { prefix: "/client/recruitment", title: "Recruitment" },
  { prefix: "/client/reports", title: "Reports" },
  { prefix: "/client/requests", title: "Staff requests" },
  { prefix: "/client/schedules", title: "Schedules" },
];

export function ClientLiveGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soon = SOON.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`));
  return soon ? <ComingSoonScreen title={soon.title} /> : <>{children}</>;
}
