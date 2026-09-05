import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/client/staff/[id]/page.tsx: back link, PageHeading, and one
 *  read-only Profile card (outlet row + documentation-status badge row). */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-3.5 w-28" />

      <div className="mt-3">
        <Skeleton className="h-7 w-48 max-w-full" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <Skeleton className="mb-2 h-3 w-32" />
        <div className="flex items-center justify-between py-0.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center justify-between py-0.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
