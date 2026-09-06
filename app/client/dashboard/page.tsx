import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2, CalendarClock, Eye, FileCheck2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MetricCard } from "@/components/shared/MetricCard";
import { CountUp } from "@/components/shared/CountUp";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { HeroStatCard } from "@/components/shared/HeroStatCard";
import {
  SAMPLE_ATTENDANCE_TODAY,
  SAMPLE_PAYROLL_SCHEDULE,
  SAMPLE_STAFF,
} from "@/lib/placeholder-data";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Client / Business User Dashboard — docs/architecture/ui-ux-framework.md §5
 * (major wireframe). Confirmed widgets only: Assigned Staff (read-only),
 * Documentation Completion, Attendance Overview, Payroll Schedule (schedule/
 * dates only — never amounts, per the permanent payment-processing
 * exclusion). No NIN/banking/sensitive fields rendered anywhere here.
 *
 * Hard constraint: this role has no create/edit/delete/approve permission
 * anywhere in rbac.md (Proposal: "oversight, not control"). Every
 * interaction below is a quiet "View [X] →" navigation link — zero buttons,
 * zero controls that imply mutation. The "Read-only" badge in the header is
 * the PROPOSED visual cue from ui-ux-framework.md §5, not itself a
 * requirement; the zero-mutating-control rule is the requirement.
 */
export default function ClientDashboardPage() {
  const outletStaff = SAMPLE_STAFF.filter((s) => s.outlet === "Sample Outlet 1");
  const staffCount = outletStaff.length;
  const docsComplete = outletStaff.filter((s) => s.documentationStatus === "Complete").length;
  const docsPercent = staffCount > 0 ? Math.round((docsComplete / staffCount) * 100) : 0;
  const { present, total } = SAMPLE_ATTENDANCE_TODAY;
  const { nextPayrollDate, cadence } = SAMPLE_PAYROLL_SCHEDULE;

  const viewLinkClass =
    "mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--foreground)] hover:underline";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero row — same gradient hero-stat + donut pattern as HR/Ops, but
          tone="slate" (var(--foreground), this dashboard's own nav color)
          instead of purple — a dark-neutral gradient matching Client's
          "oversight, not control" restraint rather than a celebratory
          brand-colored one. Badge carries the existing "Read-only
          oversight" cue instead of a separate span. */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <HeroStatCard
          tone="slate"
          eyebrow={
            <>
              <Eye className="h-3 w-3" /> Client Portal — Read-Only
            </>
          }
          title="Sample Outlet 1"
          value={<CountUp value={staffCount} />}
          valueLabel="Assigned Staff"
          badge="Read-only oversight"
        />
        <Card>
          <CardContent className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Documentation Completion
            </h2>
            <ProgressRing
              value={docsPercent}
              size={104}
              centerLabel={<span className="text-lg font-bold text-foreground">{docsPercent}%</span>}
            />
            <p className="text-xs text-muted-foreground">
              {docsComplete} of {staffCount} staff complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics — staggered entrance, ~70ms/tile (design-system.md §15). */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          <MetricCard
            key="staff"
            icon={Users}
            label="Assigned Staff"
            value={<CountUp value={staffCount} />}
            caption={
              <Link href="/client/staff" className={viewLinkClass}>
                View Staff →
              </Link>
            }
          />,
          <MetricCard
            key="documentation"
            icon={FileCheck2}
            label="Documentation Completion"
            value={
              <>
                <CountUp value={docsComplete} /> / {staffCount}
              </>
            }
            caption={
              <>
                <Progress value={docsPercent} />
                <Link href="/client/documentation-status" className={viewLinkClass}>
                  View Documentation Status →
                </Link>
              </>
            }
          />,
          <MetricCard
            key="attendance"
            icon={CalendarCheck2}
            label="Attendance Overview"
            value={
              <>
                <CountUp value={present} /> / {total}
              </>
            }
            caption={
              <>
                <span>Present today</span>
                <Link href="/client/attendance" className={viewLinkClass}>
                  View Attendance →
                </Link>
              </>
            }
          />,
          <MetricCard
            key="payroll"
            icon={CalendarClock}
            label="Payroll Schedule"
            value={nextPayrollDate}
            caption={
              <>
                <span>{cadence} cadence · schedule only</span>
                <Link href="/client/payroll-schedule" className={viewLinkClass}>
                  View Payroll Schedule →
                </Link>
              </>
            }
          />,
        ].map((card, i) => (
          <div key={card.key} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            {card}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Assigned Staff list — read-only per rbac.md; no NIN/banking fields. */}
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Assigned Staff
              </h2>
              <Link href="/client/staff" className="text-xs font-medium text-[color:var(--foreground)] hover:underline">
                View Staff →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {outletStaff.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.position}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge
                      label={member.employmentStatus}
                      tone={member.employmentStatus === "Active" ? "success" : "info"}
                    />
                    <StatusBadge
                      label={member.documentationStatus}
                      tone={member.documentationStatus === "Complete" ? "success" : "warning"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Attendance Today
              </h2>
              <p className="text-lg font-semibold text-foreground">
                <CountUp value={present} /> / {total} present
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {total - present} not marked present today.
              </p>
              <Link href="/client/attendance" className={viewLinkClass}>
                View Attendance →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Payroll Schedule
              </h2>
              <p className="text-lg font-semibold text-foreground">{nextPayrollDate}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {cadence} cadence · schedule visibility only — no payment amounts or processing.
              </p>
              <Link href="/client/payroll-schedule" className={viewLinkClass}>
                View Payroll Schedule →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
