import type { Metadata } from "next";
import { PageHeading } from "@/components/shared/PageHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_STAFF } from "@/lib/placeholder-data";

export const metadata: Metadata = { title: "Documentation Status" };

export default function ClientDocumentationStatusPage() {
  return (
    <div>
      <PageHeading title="Documentation Status" description="Read-only" />
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {SAMPLE_STAFF.map((s) => (
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
