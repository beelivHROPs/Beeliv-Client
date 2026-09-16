import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2, CalendarClock, Eye, FileCheck2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MetricCard } from "@/components/shared/MetricCard";
import { CountUp } from "@/components/shared/CountUp";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { HeroStatCard } from "@/components/shared/HeroStatCard";
import { Avatar } from "@/components/shared/Avatar";
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
 *
 * Visual pass adapting the "Eduplex" education-dashboard reference
 * (project-lead: "might pick the UI for client dashboard") — style only,
 * same as the HR/Ops passes. None of its course/lesson/assignment content
 * carries over (Client has no such capability in rbac.md); what does:
 * rounded-2xl/shadow-sm cards, and a small Avatar per row on Assigned
 * Staff (reusing the existing initials-avatar component, not a fabricated
 * photo) to match the reference's icon-per-row list style. Deliberately
 * NOT given the vivid solid-color tiles Ops just got — Client's dark-
 * neutral, "oversight not control" restraint (see HeroStatCard tone="slate"
 * above) stays as-is.
 */
export default function ClientDashboardPage() {
  const outletStaff = SAMPLE_STAFF.filter((s) => s.outlet === "Sample Outlet 1");
  const staffCount = outletStaff.length;
  const docsComplete = outletStaff.filter((s) => s.documentationStatus === "Complete").length;
  const docsPercent = staffCount > 0 ? Math.round((docsComplete / staffCount) * 100) : 0;
  const { present, total } = SAMPLE_ATTENDANCE_TODAY;
  const { nextPayrollDate, cadence } = SAMPLE_PAYROLL_SCHEDULE;

  const viewLinkClass =
    "mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--foreground)] hover:underline";

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
        <Card className="rounded-2xl shadow-sm ring-0">
          <CardContent className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Documentation Completion
            </h2>
            <ProgressRing
              value={docsPercent}
              size={104}
              tone="slate"
              showCenterLabel
            />
            <p className="text-sm text-muted-foreground">
              {docsComplete} of {staffCount} staff complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics — staggered entrance, ~70ms/tile (design-system.md §15). */}
      <div className="mb-4 grid grid-cols-2 gap-3 duo:grid-cols-3 sm:grid-cols-4">
        {[
          <MetricCard
            key="staff"
            icon={Users}
            iconTone="slate-solid"
            chipShape="circle"
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
            iconTone="slate-solid"
            chipShape="circle"
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
            iconTone="slate-solid"
            chipShape="circle"
            label="Attendance Overview"
            value={
              <>
                <CountUp value={present} /> / {total}
              </>
            }
            caption={
              <>
                <span>{total - present} not marked present today</span>
                <Link href="/client/attendance" className={viewLinkClass}>
                  View Attendance →
                </Link>
              </>
            }
          />,
          <MetricCard
            key="payroll"
            icon={CalendarClock}
            iconTone="slate-solid"
            chipShape="circle"
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

      {/* Assigned Staff list — read-only per rbac.md; no NIN/banking fields.
          Avatar per row (existing initials-avatar component, tone="plum"
          to match Client's own purple) — matches the Eduplex reference's
          icon-per-row list style without fabricating a real photo.
          Full width, not paired with a sidebar (project-lead: "why is
          there a tautology in the client dashboard design??" — the
          standalone "Attendance Today" and "Payroll Schedule" cards that
          used to sit beside this just restated their own MetricCard tile
          above with the exact same number and the exact same "View X →"
          link, unlike HR/Ops's sidebar cards, which show real additional
          detail (a full list, a reason breakdown). Client only has one
          widget with genuine list-shaped detail beyond its tile —
          Assigned Staff — so it's the only thing left below the fold.
          Capped to max-w-2xl (project-lead: "fix the page width you
          already ruin it, it's not fit") — going full max-w-5xl width
          left a few short rows (name + two small badges) stretched across
          the whole page with a huge empty gap between them; this keeps
          roughly the same width the card had before it was paired with
          the now-removed sidebar.
          Rows are a real Table now, not a hand-rolled <ul> (project-lead:
          the tawk.to "History" table reference — "look at this dashboard
          design again"). Reuses components/ui/table.tsx, the same table
          primitive app/hr/staff and app/client/staff already use for
          their own staff lists — zero new styling invented, just this
          widget adopting an existing pattern. Table's own wrapper already
          provides the card border/radius/bg, so this isn't nested inside
          another Card (that would double-box it). */}
      <div className="sm:mx-auto sm:max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Assigned Staff
          </h2>
          <Link href="/client/staff" className="text-sm font-medium text-[color:var(--foreground)] hover:underline">
            View Staff →
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>Documentation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outletStaff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={member.name} size="sm" tone="plum" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{member.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={member.employmentStatus}
                    tone={member.employmentStatus === "Active" ? "success" : "info"}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={member.documentationStatus}
                    tone={member.documentationStatus === "Complete" ? "success" : "warning"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
