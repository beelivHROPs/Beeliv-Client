import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { CountUp } from "@/components/shared/CountUp";

/**
 * Decorative "product preview" for the public hero's desktop two-column layout
 * (docs/architecture/ui-ux-framework.md §16, screen 01) — approved this session.
 * Built entirely from real, already-shipped UI components (StatusBadge,
 * ProgressRing, and a step-circle treatment borrowed from
 * components/applicant/ApplicationJourney.tsx's visual language) rather than
 * any stock photo or illustration asset, per this project's no-stock-imagery
 * rule. All copy below is an invented, generic placeholder ("Application
 * Progress", steps 1–3) — deliberately NOT lib/placeholder-data.ts's real
 * sample applicant — so this can never read as anyone's actual application or
 * imply a logged-in session.
 *
 * Purely illustrative: aria-hidden, pointer-events-none, no data binding, no
 * interactivity. The glass surface (background/border/blur below) is this
 * app's one permitted glass moment per design-system.md §4 ("hero-adjacent
 * area of the Applicant Entry Surface" — at most once, never on operational
 * dashboards) — it needs the hero's bg-hero-glow section behind it to read
 * as glass, so this only renders inside that section.
 *
 * No visible "illustrative preview only" disclaimer text (removed per
 * project-lead direction) — the content itself (generic step labels, no
 * name, no dates, no real applicant data) already reads as a sample rather
 * than a specific real record, `aria-hidden` means screen readers skip it
 * entirely, and this matches how real product-preview heroes (Stripe,
 * Linear) handle this: they never visibly label their preview UI as sample
 * data either. "Wire to real data once available" from that same request
 * isn't actionable yet — there's no auth/backend for this to bind to.
 */
export function HeroPreviewCard() {
  // Labels match the confirmed applicant-facing stage names used elsewhere
  // (Application → Review → ... → Final Decision, see ApplicationJourney.tsx)
  // rather than the earlier invented "Applied/Decision" wording — compressed
  // to 3 checkpoints (skipping Interview/Documentation) since this card is
  // too small to fit all 5 without the same wrap/crush bug fixed elsewhere.
  // Zigzag cascade (top-left → upper-right → lower-center) rather than one
  // straight diagonal — matches the same connecting-zigzag language as
  // HowItWorks' mobile connector. Kept well inside 0-100 on both axes (not
  // touching the edges) so a centered circle never clips against the card's
  // own overflow-hidden, and the last point stays away from the bottom-left
  // corner where the floating chip sits below, so they never overlap.
  // delayS staggers each circle's animate-circle-bounce (globals.css) to
  // roughly match when the traveling pulse (animate-dash-flow, now a
  // single sweep rather than repeating dashes) actually reaches that point
  // — proportional to each point's position along the path's total arc
  // length (pathLength="100" below normalizes the dash timing to arc
  // length, not point index), not just evenly split across 3 steps.
  const steps = [
    { label: "Application", state: "done" as const, x: 15, y: 18, delayS: 0.05 },
    { label: "Review", state: "current" as const, x: 80, y: 42, delayS: 0.5 },
    { label: "Decision", state: "upcoming" as const, x: 34, y: 78, delayS: 0.9 },
  ];
  const linePoints = steps.map((s) => `${s.x},${s.y}`).join(" ");

  return (
    // Outer wrapper deliberately has no overflow-hidden — the floating chip
    // below needs to break the glass card's edge for the layered-depth
    // effect; the card itself keeps its own overflow-hidden for the shine.
    // max-w-sm on mobile (where it now also shows), scaling up to max-w-lg
    // on desktop — review feedback comparing this against a reference site
    // whose equivalent hero card runs noticeably larger/more spacious.
    <div className="relative w-full max-w-sm lg:max-w-lg">
      <div
        aria-hidden="true"
        className="animate-float-bob-slow pointer-events-none relative overflow-hidden rounded-2xl border border-white/25 bg-white/15 p-6 shadow-[0_18px_30px_-12px_color-mix(in_srgb,var(--primary)_30%,transparent),0_45px_90px_-18px_color-mix(in_srgb,var(--primary)_60%,transparent)] backdrop-blur-lg backdrop-saturate-150 lg:p-8"
      >
        {/* Glass "shine" — a soft diagonal light catch across the top-left,
            the detail that sells frosted glass as glass rather than just a
            translucent panel. Purely decorative, clipped by the card's own
            rounded corners via the parent's overflow-hidden. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent"
        />

        <div className="relative flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-foreground/70 uppercase lg:text-sm">
            Application Progress
          </p>
          <StatusBadge label="Under Review" tone="warning" />
        </div>

        <div className="mt-5 flex items-center gap-4 lg:mt-6">
          <ProgressRing value={60} size={64} />
          <p className="font-heading text-lg font-semibold text-foreground lg:text-xl">
            <CountUp value={60} suffix="%" /> complete
          </p>
        </div>

        {/* Mini 3-step stepper — same numbered-circle language as
            ApplicationJourney's stepper, cascaded diagonally and connected
            by a dashed line rather than laid out as a flat row. The line
            itself flows slowly (animate-dash-flow) — a still, static dashed
            line read as a mistake once the rest of the card had motion; a
            slow march reads as "in progress" instead. No live stage data,
            still decorative only. */}
        <div className="relative mt-6 h-36 lg:mt-8 lg:h-48">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Static faint base line — without this, the connection
                between circles would only be visible for the instant the
                traveling pulse below happens to be passing through that
                segment, reading as broken/disconnected the rest of the
                time. Same "static base + animated overlay" pattern already
                used for HowItWorks' connectors. */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.18"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={linePoints}
              pathLength={100}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="animate-dash-flow"
            />
          </svg>
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              style={{ left: `${step.x}%`, top: `${step.y}%` }}
            >
              <div
                className={`animate-circle-bounce flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold lg:h-9 lg:w-9 lg:text-sm ${
                  step.state === "done"
                    ? "border-success bg-success text-white"
                    : step.state === "current"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                }`}
                style={{ animationDelay: `${step.delayS}s` }}
              >
                {step.state === "done" ? "✓" : i + 1}
              </div>
              <div className="text-[10px] font-medium whitespace-nowrap text-foreground/70 lg:text-xs">
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating chip — breaks the card's corner for a layered, "product
          screenshot" feel instead of one flat plane. Bottom-LEFT specifically
          (not bottom-right, where the diagonal cascade's own last point
          already lands) so it never overlaps the diagram — the first version
          put it bottom-right and it sat directly on top of "Decision".
          Content stays as non-specific/illustrative as the rest of this
          card — no invented real status. */}
      <div
        aria-hidden="true"
        className="animate-float-bob absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-full border border-border bg-card py-2 pr-3.5 pl-2.5 text-xs font-semibold text-foreground shadow-lg lg:-bottom-5 lg:-left-5 lg:gap-2 lg:py-2.5 lg:pr-4 lg:pl-3 lg:text-sm"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-[10px] text-white lg:h-6 lg:w-6 lg:text-xs">
          ✓
        </span>
        1 of 2 documents received
      </div>
    </div>
  );
}
