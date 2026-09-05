import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Building2 } from "lucide-react";
import { SAMPLE_JOB_LISTINGS } from "@/lib/placeholder-data";
import { EmptyState } from "@/components/shared/EmptyState";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { HowItWorks } from "@/components/shared/HowItWorks";
import { CountUp } from "@/components/shared/CountUp";
import { HeroPreviewCard } from "@/components/shared/HeroPreviewCard";
import { AvatarStack } from "@/components/shared/AvatarStack";
import { Faq } from "@/components/shared/Faq";
import { BackToTop } from "@/components/shared/BackToTop";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

/**
 * Public Entry / Recruitment Home — docs/architecture/ui-ux-framework.md §16,
 * screen 01. This is explicitly NOT a marketing homepage: no About/Services/
 * Blog/Testimonials/Pricing content. Copy below is placeholder, pending
 * Beeliv's approval of actual wording. Per design-system.md §4, this hero is
 * the one surface in the entire app allowed a restrained gradient/glass
 * touch — reusing the existing `bg-brand-wash` utility (already used on the
 * applicant dashboard's welcome header) rather than inventing a new one.
 */
export default function PublicEntryHome() {
  const listings = SAMPLE_JOB_LISTINGS;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero — the one hero-adjacent moment permitted the brand-wash
            gradient accent (design-system.md §4). Two-column desktop layout
            (left: copy/CTA, right: decorative product-preview card) approved
            this session; below `lg` it collapses to the original single
            column with the preview card dropped entirely — not shrunk — so
            mobile screen space goes straight to the CTA (mobile document
            order: heading → copy → CTAs, unchanged). Dual CTA per the
            premium-landing research this session: a dominant primary action
            plus a lower-commitment secondary, both at the landing-scale
            `hero` button size (components/ui/button.tsx) — distinct from
            every dashboard button size in this app.

            The header now floats INSIDE this section (glass, absolutely
            positioned — see PublicHeader's `glass` prop) instead of sitting
            above it as a separate solid bar, so it reads as glass over the
            brand-wash background per design-system.md §4 rather than a
            plain bar with nothing colorful behind it. Extra top padding
            (pt-28/36 vs the original py-20/28) clears the floating bar's
            height so it never overlaps the headline. */}
        {/* data-tinted-bg — read by BackToTop (components/shared/
            BackToTop.tsx) so the floating button can swap to its inverse
            (light) style whenever it's scrolled over a purple/gold-tinted
            section instead of blending into it. */}
        <section
          data-tinted-bg
          className="bg-hero-glow relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-28"
        >
          {/* Decorative background texture — soft blurred brand-color blobs,
              pure CSS (no image asset, no new dependency). Low opacity by
              design so it reads as depth, not a graphic. */}
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
            {/* Fourth blob — bottom-right corner, gold-toned — extra
                atmosphere for the preview-card side of the layout. */}
            <div
              className="absolute right-0 bottom-0 h-72 w-72 rounded-full blur-[90px]"
              style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.1 }}
            />
            {/* Glossy diagonal "liquid ribbon" — project-lead reference (an
                Ultahost ad's soft blurred glass-ribbon background). Same
                pure-CSS blur technique as the blobs above, just an elongated
                rotated shape instead of a circle, plus a thin lighter streak
                layered on top for the glossy highlight a real glass/liquid
                render would catch. Purely decorative, sits behind all real
                content (z-0 implicit, no z-index needed since it's earlier
                in DOM order than the header/copy below). */}
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
                background:
                  "linear-gradient(90deg, transparent 10%, white 50%, transparent 90%)",
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
                  {/* Hand-drawn squiggle rather than a straight CSS underline —
                      stretches to the word's own rendered width via
                      preserveAspectRatio="none" instead of needing a DOM
                      measurement (StepEmployment's "1 of 2 documents"-style
                      one-off flourish doesn't need HowItWorks-level precision). */}
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
                <Link href="/positions" className={buttonVariants({ size: "hero" })}>
                  View Open Positions
                  <ArrowRight data-icon="inline-end" />
                </Link>
                {/* Glass pill, matching the header/preview-card treatment —
                    a third touch within this same hero zone, per the
                    "add more glassmorphism" direction. Still confined to
                    this one hero moment (design-system.md §4): every other
                    button in the app keeps the solid `outline` variant.
                    Hover scale/shadow matches the `hero` button size's own
                    treatment (components/ui/button.tsx) since this pill
                    can't use buttonVariants directly (glass isn't a general
                    variant, just this one hero's local style). */}
                <Link
                  href="#how-it-works"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-8 text-base font-medium text-foreground shadow-sm backdrop-blur-md backdrop-saturate-150 transition-all duration-150 hover:scale-[1.02] hover:bg-white/25 hover:shadow-lg active:scale-[0.98]"
                >
                  How It Works
                </Link>
              </div>

              {/* "100+" is a real, project-lead-confirmed figure (2026-09-04,
                  deliberately conservative/rounded down — not sourced from
                  any written doc, but a direct confirmation from the
                  project lead, not a guessed marketing number), not an
                  invented count — see components/shared/AvatarStack.tsx's
                  own comment for the "no fabricated trust claim" rule this
                  still has to satisfy. */}
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

            {/* Product-preview card — now shown at every width (previously
                desktop-only). The grid above is single-column below `lg`, so
                this naturally stacks BELOW the text column on mobile (it's
                the second grid item) rather than needing separate mobile
                markup; at `lg`+ the two-column grid puts it beside the text
                instead. See components/shared/HeroPreviewCard.tsx for why
                it's built from real components rather than a stock/
                illustration asset. */}
            <div className="mt-10 flex justify-center lg:mt-0">
              <HeroPreviewCard />
            </div>
          </div>
        </section>

        {/* Stats strip — genuinely-sourced operational counts only, per
            project-lead direction: no vanity/invented marketing metrics.
            Open positions is a real computed count (listings.length). The
            second tile deliberately does NOT show SAMPLE_OUTLETS_COUNT as a
            number — that constant is prototype placeholder data (used for
            real internal-facing context on the Ops dashboard), and stating
            a specific outlet count to an unauthenticated public visitor
            would present fabricated data as confirmed operational fact.
            "Multiple" is honest without inventing precision.

            Presentation: icon-led stat cards, wrapped in `ui/card.tsx`
            (hairline border, no shadow — static/non-clickable, per
            design-system.md §7's "static dashboard summary cards don't
            lift"). */}
        <section aria-label="Beeliv at a glance" className="border-y border-border bg-card px-4 py-8 sm:px-6">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
            <Card size="sm">
              <CardContent className="flex flex-col items-center text-center">
                <Briefcase className="size-5 text-primary" />
                <p className="font-heading mt-2 text-2xl font-semibold text-primary sm:text-3xl">
                  <CountUp value={listings.length} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Open positions</p>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="flex flex-col items-center text-center">
                <Building2 className="size-5 text-primary" />
                <p className="font-heading mt-2 text-2xl font-semibold text-primary sm:text-3xl">
                  Multiple
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Opportunities across Beeliv
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <HowItWorks />

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Open positions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Explore opportunities currently available with Beeliv. Find a role that matches
            your skills and experience, then learn more about the position before starting
            your application.
          </p>

          {listings.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                variant="briefcase"
                title="No open positions right now."
                description="Check back later for new opportunities."
                action={
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                  >
                    Log In
                  </Link>
                }
              />
            </div>
          ) : (
            // data-tinted-bg — these purple job cards are the other spot
            // (besides the hero/HowItWorks sections) BackToTop needs to
            // detect, so it doesn't render solid purple-on-purple over them.
            <div data-tinted-bg className="mt-4 grid gap-4 sm:grid-cols-3">
              {listings.slice(0, 3).map((job, i) => (
                <div
                  key={job.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {/* Purple/white treatment (bg-primary/text-primary-foreground) —
                      project-lead direction, distinguishes these from the
                      plain white stat cards above using the same Card
                      component. View Position uses the gold brand accent
                      (var(--gold)) rather than text-primary, since primary
                      IS the card background here and would be invisible. */}
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
                      {/* min-h-11 (44px) meets the WCAG AAA / Apple HIG tap-
                          target minimum — text itself is well under that, so
                          padding-based height is added without shifting the
                          card's visual density beyond the extra invisible space. */}
                      <Link
                        href={`/positions/${job.id}`}
                        className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[var(--gold)] hover:underline"
                      >
                        View Position →
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {listings.length > 0 ? (
            <div className="mt-6 text-center">
              <Link href="/positions" className={buttonVariants({ variant: "outline" })}>
                View All Positions →
              </Link>
            </div>
          ) : null}
        </section>

        <Faq />

        {/* Closing CTA — bookends the page with the same primary action as
            the hero, for a visitor who scrolled all the way through without
            converting at the top. */}
        <section className="border-t border-border bg-card px-4 py-14 text-center sm:px-6 sm:py-16">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Ready to find your next opportunity?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Explore available positions and take the first step towards joining the Beeliv team.
          </p>
          <div className="mt-6">
            <Link href="/positions" className={buttonVariants({ size: "hero" })}>
              View Open Positions
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer — structured (logo + 2 real existing links) per this session's
          approval, but still minimal per ui-ux-framework.md §16's "no
          promotional content" rule: no About, no social links, no newsletter,
          nothing invented. Both links already exist elsewhere in this app. */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/beeliv-logo-mark-v2.png"
              alt="Beeliv Hospitality"
              width={214}
              height={223}
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-medium text-muted-foreground">Beeliv Hospitality</span>
          </Link>
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/positions" className="hover:text-foreground hover:underline">
              Open Positions
            </Link>
            <Link href="/login" className="hover:text-foreground hover:underline">
              Log In
            </Link>
          </nav>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
