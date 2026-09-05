import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SAMPLE_JOB_LISTINGS } from "@/lib/placeholder-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeading } from "@/components/shared/PageHeading";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Open Positions" };

/**
 * Open Positions — docs/architecture/ui-ux-framework.md §16, screen 02.
 * Whether this pool is Beeliv-wide or per-outlet is TBD (rbac.md §11 q10) —
 * "location" is shown here as a placeholder field only, not a confirmed
 * job-card schema. Solid surface throughout (no glass) — the gradient/glass
 * touch permitted by design-system.md §4 is reserved for screen 01 only.
 */
export default function OpenPositionsPage() {
  const listings = SAMPLE_JOB_LISTINGS;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <PageHeading
          title="Open Positions"
          description="Find an opportunity that's right for you."
        />

        {listings.length === 0 ? (
          <EmptyState
            variant="briefcase"
            title="No open positions right now."
            description="Check back later for new opportunities."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((job, i) => (
              <div key={job.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                {/* Same purple/white treatment as the homepage's Open
                    Positions preview cards (app/page.tsx) — kept consistent
                    across both places this same job data is shown. */}
                <Card className="bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent>
                    <p className="font-heading text-base font-semibold text-primary-foreground">
                      {job.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-primary-foreground/70">
                      <MapPin className="size-3.5" />
                      {job.location}
                    </p>
                    <p className="mt-2 text-sm text-primary-foreground/80">{job.summary}</p>
                    <Link
                      href={`/positions/${job.id}`}
                      className="mt-3 inline-block text-sm font-medium text-[var(--gold)] hover:underline"
                    >
                      View Position →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
