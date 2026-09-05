import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/client/documentation-status/page.tsx: PageHeading (h1
 *  text-xl, mb-6, mt-1 "Read-only" description) + a bordered list of
 *  name/badge rows, one per SAMPLE_STAFF entry. */
export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-6 w-56 max-w-full" />
        <Skeleton className="mt-1 h-3.5 w-16" />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
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
