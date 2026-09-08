import type { Metadata } from "next";
import { PageHeading } from "@/components/shared/PageHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_STAFF } from "@/lib/placeholder-data";

export const metadata: Metadata = { title: "Documentation Status" };

// Outlet-scoped (rbac.md §4) — same constant/pattern as
// app/client/staff/page.tsx and app/client/dashboard/page.tsx. Found
// unfiltered via a QA sweep.
const ASSIGNED_OUTLET = "Sample Outlet 1";

export default function ClientDocumentationStatusPage() {
  const staff = SAMPLE_STAFF.filter((s) => s.outlet === ASSIGNED_OUTLET);

  return (
    <div>
      <PageHeading title="Documentation Status" description={`Read-only — ${ASSIGNED_OUTLET}`} />
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {staff.map((s) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-gray-900">{s.name}</span>
            <StatusBadge
              label={s.documentationStatus}
              tone={s.documentationStatus === "Complete" ? "success" : "warning"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
