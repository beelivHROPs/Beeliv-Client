import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { SAMPLE_JOB_LISTINGS } from "@/lib/placeholder-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { HowItWorks } from "@/components/shared/HowItWorks";
import { HeroPreviewCard } from "@/components/shared/HeroPreviewCard";
import { AvatarStack } from "@/components/shared/AvatarStack";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Open Positions" };

/**
 * Open Positions / Talent Entry — docs/architecture/ui-ux-framework.md §16,
 * screen 02, now carrying the full applicant-facing hero that used to live
 * on the public homepage. Project-lead (2026-09-16): the main public
 * homepage (app/(home)/page.tsx) is being rebuilt business-first, matching
 * the real beeliv.co design, with recruitment/"Talent" pushed to this page
 * (which represents talent.beeliv.co in the eventual split-repo deployment —
 * see CLAUDE.md's Beeliv-Staff repo note). This hero/HowItWorks content is
 * unchanged from its original homepage version other than the CTAs, which
 * now point at this page's own listings/How It Works instead of navigating
 * away to a separate page.
 */
export default function OpenPositionsPage() {
  const listings = SAMPLE_JOB_LISTINGS;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        <section
          data-tinted-bg
          className="bg-hero-glow relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-28"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-[70px]"
              style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", opacity: 0.1 }}
            />
            <div
              className="absolute -top-16 right-0 h-64 w-64 rounded-full blur-[70px]"
              style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.12 }}
            />
            <div
              className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full blur-[80px]"
              style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", opacity: 0.08 }}
            />
            <div
              className="absolute right-0 bottom-0 h-72 w-72 rounded-full blur-[90px]"
              style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.1 }}
            />
            <div
              className="absolute top-1/4 left-[-10%] h-28 w-[140%] rotate-[-16deg] blur-[60px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--primary) 30%, var(--gold) 55%, var(--primary) 80%, transparent 100%)",
                opacity: 0.22,
              }}
            />
            <div
              className="absolute top-[28%] left-[-10%] h-8 w-[140%] rotate-[-16deg] blur-[30px]"
              style={{
                background: "linear-gradient(90deg, transparent 10%, white 50%, transparent 90%)",
                opacity: 0.35,
              }}
            />
          </div>

          <PublicHeader glass />

          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="animate-fade-up mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Careers at Beeliv
              </p>
              <h1 className="mt-2 font-heading text-5xl leading-[1.15] font-extrabold text-foreground sm:text-6xl">
                Find your next{" "}
                <span className="relative inline-block text-primary">
                  opportunity
                  <svg
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 h-2.5 w-full sm:-bottom-2 sm:h-3"
                    viewBox="0 0 120 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,6 Q7.5,1 15,6 T30,6 T45,6 T60,6 T75,6 T90,6 T105,6 T120,6"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray="100"
                      strokeDashoffset="100"
                      className="animate-underline-draw"
                    />
                  </svg>
                </span>{" "}
                with Beeliv.
              </h1>
              <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground lg:mx-0">
                Explore open roles and take the first step towards joining the Beeliv team.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <a href="#listings" className={buttonVariants({ size: "hero" })}>
                  View Open Positions
                  <ArrowRight data-icon="inline-end" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-8 text-base font-medium text-foreground shadow-sm backdrop-blur-md backdrop-saturate-150 transition-all duration-150 hover:scale-[1.02] hover:bg-white/25 hover:shadow-lg active:scale-[0.98]"
                >
                  How It Works
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
                <AvatarStack />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    100+ staff trained &amp; recruited
                  </p>
                  <p className="text-xs text-muted-foreground">Ready to join our team?</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center lg:mt-0">
              <HeroPreviewCard />
            </div>
          </div>
        </section>

        <HowItWorks />

        <section id="listings" className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Open Positions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Find an opportunity that&apos;s right for you.
          </p>

          {listings.length === 0 ? (
            <EmptyState
              variant="briefcase"
              title="No open positions right now."
              description="Check back later for new opportunities."
            />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((job, i) => (
                <div key={job.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <Card className="bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
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
        </section>
      </main>
    </div>
  );
}
