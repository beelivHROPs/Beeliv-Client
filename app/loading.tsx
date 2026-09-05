import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/Skeleton";
import { PublicHeader } from "@/components/shared/PublicHeader";

/** Full-page skeleton mirroring app/(home)/page.tsx section-for-section —
 *  hero (real PublicHeader chrome, skeleton copy/CTAs/preview card), stats,
 *  How It Works, Open Positions (purple cards, matching the real bg-primary
 *  treatment via inverse skeleton text), FAQ, closing CTA, footer. Lives in
 *  the (home) route group specifically so it doesn't leak onto the ~19
 *  ComingSoonScreen routes that still fall back to the generic root
 *  app/loading.tsx — this one is deliberately homepage-specific. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero-glow relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-28">
          <PublicHeader glass />

          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-3 h-11 w-full max-w-md" />
              <Skeleton className="mt-2 h-11 w-3/4 max-w-md" />
              <Skeleton className="mt-5 h-5 w-full max-w-sm" />

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Skeleton className="h-13 w-44 rounded-xl" />
                <Skeleton className="h-13 w-40 rounded-xl" />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Skeleton className="h-9 w-24 rounded-full" />
                <div>
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="mt-1.5 h-3 w-28" />
                </div>
              </div>
            </div>

            {/* HeroPreviewCard placeholder */}
            <div className="mt-10 flex justify-center lg:mt-0">
              <Skeleton className="h-64 w-full max-w-sm rounded-2xl sm:h-72 lg:h-80 lg:max-w-lg" />
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border bg-card px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <Card key={i} size="sm">
                <CardContent className="flex flex-col items-center text-center">
                  <Skeleton className="size-5 rounded-full" />
                  <Skeleton className="mt-2 h-7 w-16" />
                  <Skeleton className="mt-1.5 h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-brand-wash border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="mt-2 h-3 w-64 max-w-full" />
            </div>

            <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card px-5 pt-12 pb-5">
                  <Skeleton className="mb-9 size-14 rounded-2xl" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions — cards render as real bg-primary purple with
            inverse (white/translucent) skeleton content, same treatment as
            app/positions/loading.tsx. */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <Skeleton className="mt-1.5 h-4 w-2/3 max-w-md" />

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

          <div className="mt-6 flex justify-center">
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />

          <div className="mt-6 divide-y divide-border rounded-xl border border-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                <Skeleton className="h-3.5 w-full max-w-sm" />
                <Skeleton className="size-4 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-border bg-card px-4 py-14 text-center sm:px-6 sm:py-16">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            <Skeleton className="mt-6 h-13 w-48 rounded-xl" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex items-center gap-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </footer>
    </div>
  );
}
