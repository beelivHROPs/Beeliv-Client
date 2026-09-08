import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SAMPLE_STAFF } from "@/lib/placeholder-data";

export const metadata: Metadata = { title: "Staff" };

/** Mobile fix — same treatment/rationale as app/hr/staff/page.tsx: a card
 *  list below `sm:`, the unchanged table at `sm:` and up. */
export default function ClientStaffListPage() {
  return (
    <div>
      <PageHeading title="Staff" description="Read-only — Sample Outlet 1" />

      <div className="flex flex-col gap-3 sm:hidden">
        {SAMPLE_STAFF.map((s) => (
          <Link
            key={s.id}
            href={`/client/staff/${s.id}`}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.position}</p>
              <div className="mt-2.5">
                <StatusBadge
                  label={s.employmentStatus}
                  tone={s.employmentStatus === "Active" ? "success" : "info"}
                />
              </div>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_STAFF.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-foreground">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.position}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={s.employmentStatus}
                    tone={s.employmentStatus === "Active" ? "success" : "info"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/client/staff/${s.id}`}
                    className="font-medium text-[color:var(--foreground)] hover:underline"
                  >
                    View →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
