import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card } from "@/components/shared/Card";
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

/** Client Staff Detail — read-only, no sensitive fields, no mutating controls. */
export default async function ClientStaffDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const staff = SAMPLE_STAFF.find((s) => s.id === id);

  if (!staff) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/client/staff"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Staff
      </Link>

      <PageHeading title={staff.name} description={staff.position} />

      <Card title="Profile (read-only)">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Outlet</dt>
            <dd className="text-gray-900">{staff.outlet}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Documentation</dt>
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
      </Card>
    </div>
  );
}
