import { PublicHeader } from "@/components/shared/PublicHeader";
import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/positions/[id]/page.tsx: title + location, About section,
 *  Requirements list, then the Apply button. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader backHref="/positions" backLabel="Back to Open Positions" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-32" />

        <div className="mt-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-3/4" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-3 w-28" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className={`h-3 w-2/3 ${i === 0 ? "mt-2" : "mt-1.5"}`} />
          ))}
        </div>

        <Skeleton className="mt-10 h-9 w-32 rounded-lg" />
      </main>
    </div>
  );
}
