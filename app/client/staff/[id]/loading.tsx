import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/client/staff/[id]/page.tsx: back link, PageHeading (h1
 *  text-xl, mb-6, mt-1 description), and one read-only Profile card
 *  (outlet row + documentation-status badge row). */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-3.5 w-28" />

      <div className="mt-3 mb-6">
        <Skeleton className="h-6 w-48 max-w-full" />
        <Skeleton className="mt-1 h-3.5 w-32" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="mb-2 h-3.5 w-32" />
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
