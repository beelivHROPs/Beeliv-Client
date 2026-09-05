import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/client/documentation-status/page.tsx: PageHeading + a
 *  bordered list of name/badge rows, one per SAMPLE_STAFF entry. */
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="mt-2 h-4 w-16" />

      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
