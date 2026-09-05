import { PublicHeader } from "@/components/shared/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/Skeleton";

/** Mirrors app/positions/page.tsx: header, page title, then a 3-column grid
 *  of job cards. Cards themselves render as real bg-primary purple (not
 *  skeletonized — it's the card's own brand-color surface, not loading
 *  data) with inverse (white/translucent) skeleton blocks for the title/
 *  location/summary/link text that hasn't arrived yet. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="bg-primary">
              <CardContent>
                <Skeleton inverse className="h-4 w-32" />
                <Skeleton inverse className="mt-2 h-3 w-24" />
                <Skeleton inverse className="mt-3 h-3 w-full" />
                <Skeleton inverse className="mt-1.5 h-3 w-2/3" />
                <Skeleton inverse className="mt-3 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
