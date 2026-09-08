import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_STAFF } from "@/lib/placeholder-data";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const staff = SAMPLE_STAFF.find((s) => s.id === id);
  return { title: staff ? staff.name : "Staff Member" };
}

/**
 * Client Staff Detail — read-only, no sensitive fields, no mutating controls.
 *
 * Restyled onto the app's current design-system tokens/Card (spacing audit
 * follow-up — this page still had the raw-gray/blue-600 prototype styling).
 * Link tone uses --foreground (not --primary) matching this dashboard's own
 * established "oversight, not control" convention (app/client/dashboard/
 * page.tsx's viewLinkClass) rather than the purple used elsewhere.
 *
 * Outlet-scoped (rbac.md §4) — direct-URL access to another outlet's staff
 * record now 404s the same as a nonexistent id, rather than leaking full
 * detail (found via a QA sweep).
 */
const ASSIGNED_OUTLET = "Sample Outlet 1";

export default async function ClientStaffDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const staff = SAMPLE_STAFF.find((s) => s.id === id);

  if (!staff || staff.outlet !== ASSIGNED_OUTLET) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/client/staff"
        className="text-sm font-medium text-[color:var(--foreground)] hover:underline"
      >
        ← Back to Staff
      </Link>

      <PageHeading title={staff.name} description={staff.position} />

      <Card>
        <CardContent>
          <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Profile (read-only)
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Outlet</dt>
              <dd className="font-medium text-foreground">{staff.outlet}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Documentation</dt>
              <dd>
                <StatusBadge
                  label={staff.documentationStatus}
                  tone={
                    staff.documentationStatus === "Complete"
                      ? "success"
                      : "warning"
                  }
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
