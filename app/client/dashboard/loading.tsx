import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/Skeleton";
import { DashboardHeroRowSkeleton, DashboardMetricsRowSkeleton } from "@/components/shared/DashboardLoadingShell";

/** Mirrors the current app/client/dashboard/page.tsx: hero row
 *  (HeroStatCard + donut, tone="slate" now folds the "Read-only" badge
 *  into the hero itself), 4 metric tiles, then an Assigned Staff list
 *  beside Attendance + Payroll cards. Previously stale — showed the old
 *  flat header-with-separate-badge shape this page no longer has. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl">
      <DashboardHeroRowSkeleton />
      <DashboardMetricsRowSkeleton />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="mt-1.5 h-2.5 w-24" />
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <Skeleton className="mb-2.5 h-3 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-1.5 h-3 w-36" />
              <Skeleton className="mt-2.5 h-3 w-24" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton className="mb-2.5 h-3 w-28" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-1.5 h-3 w-44 max-w-full" />
              <Skeleton className="mt-2.5 h-3 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
