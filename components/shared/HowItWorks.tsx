"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileStack, FileText, Search, Users } from "lucide-react";

/**
 * Step labels/order: the confirmed applicant journey (docs/BEELIV-
 * APPLICANT-JOURNEY.md §"The Journey, End to End" — Apply, Application
 * Review/Shortlisting, Interview/Assessment, Documentation), plus one
 * summary step. The four internal-only stages after Documentation
 * (Verification, Selection/Approval, Staff Onboarding, Assignment) still
 * aren't itemized here — an applicant doesn't need HR's internal state
 * machine — but leaving the journey hanging at "Documentation" with no
 * mention of an outcome was confusing, so those four collapse into one
 * "Final Decision" summary step instead of being added individually.
 *
 * Icons: lucide-react (already a dependency throughout this app), not new
 * stock art. One per step, purely illustrative of the step's nature.
 */
const STEPS = [
  {
    label: "Application",
    description: "Explore available positions and submit an application for the role that interests you.",
    icon: FileText,
  },
  {
    label: "Review",
    description:
      "Our recruitment team reviews applications and identifies candidates who meet the requirements for the next stage.",
    icon: Search,
  },
  {
    label: "Interview & Assessment",
    description:
      "Selected candidates may be invited to complete an interview or assessment relevant to the position.",
    icon: Users,
  },
  {
    label: "Documentation",
    description:
      "Candidates who progress through the recruitment process provide the required employment information and supporting documents.",
    icon: FileStack,
  },
  {
    label: "Final Decision",
    description:
      "Successful candidates proceed through the final recruitment and onboarding process, and are assigned based on Beeliv's operational requirements.",
    icon: CheckCircle2,
  },
];

// Fire-once sequential timeline, shared by both breakpoints (project lead,
// 2026-09-02: adopt the desktop timer on mobile too, rather than the
// earlier scroll-scrubbed mobile variant): step i's content reveals, then
// the line/segment to step i+1 draws, then step i+1 reveals — repeating
// through the last step. Short durations per the "decrease the animation
// time" direction (down from an earlier 700-900ms single-shot per segment).
const STEP_MS = 350;
const LINE_MS = 450;
const stepDelay = (i: number) => i * (STEP_MS + LINE_MS);
const lineDelay = (i: number) => stepDelay(i) + STEP_MS;

/** One cubic-Bézier segment per hop between `points`, elbow control points
 *  at the vertical midpoint of each hop — a smooth S-curve between
 *  alternating left/right zigzag positions. Returns one path string per
 *  segment (not one combined path) so each segment can be independently
 *  draw-animated on its own `lineDelay`, matching the desktop per-line
 *  treatment below. */
function buildZigzagSegments(points: { x: number; y: number }[]): string[] {
  const segments: string[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    segments.push(
      `M ${prev.x} ${prev.y} C ${prev.x} ${midY} ${curr.x} ${midY} ${curr.x} ${curr.y}`
    );
  }
  return segments;
}

/**
 * "How it works" process section — public homepage only.
 *
 * One fire-once motion model, shared by both breakpoints (CONFIRMED,
 * project lead, 2026-09-02 — an earlier pass gave mobile a continuous
 * scroll-scrubbed variant; this was later reverted in favor of the same
 * timer desktop already used, for consistency): a native
 * `IntersectionObserver` flips one `visible` boolean the first time the
 * section is ~35% in view (never re-triggers), and the whole
 * step→line→step→line sequence plays on its own short fixed timeline via
 * CSS `transition-delay` (`stepDelay`/`lineDelay` above) — independent of
 * scroll speed, identical timing on both breakpoints. Only the layout/line
 * shape differs: desktop is a horizontal row with straight connecting
 * lines; mobile is a vertical zigzag (steps alternating left/right)
 * connected by one curved segment per hop. This remains the narrowly-scoped
 * motion category from design-system.md §15 — approved for this one
 * section, not a general pattern to reach for elsewhere.
 *
 * Mobile zigzag segment geometry is DOM-measured (circle centers via
 * `getBoundingClientRect`), not a fixed/precomputed shape, since row
 * heights vary with description text length — re-measured on font-load
 * (`document.fonts.ready`) and on any container resize (`ResizeObserver`),
 * not just `window` resize, since internal content reflow (e.g. a font
 * swap) doesn't fire a `window` resize event but does shift circle
 * positions.
 *
 * Reduced motion: the whole sequence is skipped and everything renders
 * fully revealed on mount, per the established convention elsewhere in
 * this codebase (components/applicant/ApplicationJourney.tsx,
 * components/shared/ProgressRing.tsx).
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Lazy-initialized (not set via setState-in-effect, which trips this
  // codebase's lint rule) so a reduced-motion visitor never sees the
  // un-revealed state even for a single frame.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Mobile zigzag connector geometry.
  const zigzagContainerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [zigzag, setZigzag] = useState<{ width: number; height: number; segments: string[] }>({
    width: 0,
    height: 0,
    segments: [],
  });

  const measureZigzag = useCallback(() => {
    const container = zigzagContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const points = circleRefs.current.map((circle) => {
      if (!circle) return null;
      const r = circle.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - containerRect.left,
        y: r.top + r.height / 2 - containerRect.top,
      };
    });
    if (points.some((p) => p === null)) return;
    setZigzag({
      width: containerRect.width,
      height: containerRect.height,
      segments: buildZigzagSegments(points as { x: number; y: number }[]),
    });
  }, []);

  useEffect(() => {
    measureZigzag();

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measureZigzag).catch(() => {});
    }

    const container = zigzagContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(measureZigzag, 150);
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [measureZigzag]);

  // Fire-once sequential trigger — shared by both breakpoints.
  useEffect(() => {
    // Already true via the lazy initializer above if reduced motion is
    // preferred — nothing to observe.
    if (visible) return;

    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // fire once — never re-triggers
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    // bg-brand-wash (not bg-background) so this section reads as its own
    // distinct band against the plain-white sections above/below, and so the
    // white step cards below still read as boxed against it, not white-on-
    // white. Same subtle two-corner tint already used for dashboard welcome
    // bands — not a flat fill, per design-system.md's anti color-flood rule.
    <section
      id="how-it-works"
      ref={sectionRef}
      // data-tinted-bg — read by BackToTop so the floating button can swap
      // to its inverse (light) style over this section instead of blending
      // into the tint.
      data-tinted-bg
      className="bg-brand-wash border-t border-border px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From application to opportunity — here&apos;s what to expect.
          </p>
        </div>

        {/* Mobile zigzag (<sm) */}
        <div ref={zigzagContainerRef} className="relative mt-12 sm:hidden">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0"
            width={zigzag.width}
            height={zigzag.height}
            style={{ overflow: "visible" }}
          >
            {zigzag.segments.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--border)" strokeWidth="2" />
                <path
                  d={d}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={visible ? 0 : 100}
                  className="motion-reduce:!transition-none"
                  style={{
                    transition: `stroke-dashoffset ${LINE_MS}ms cubic-bezier(0.4,0,0.2,1) ${lineDelay(i)}ms`,
                  }}
                />
              </g>
            ))}
          </svg>

          <div className="relative flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className={`flex items-center gap-4 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 ${
                  i % 2 === 1 ? "flex-row-reverse" : "flex-row"
                }`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity ${STEP_MS}ms ease-out ${stepDelay(i)}ms, transform ${STEP_MS}ms ease-out ${stepDelay(i)}ms`,
                }}
              >
                <div className="relative shrink-0">
                  <div
                    ref={(node) => {
                      circleRefs.current[i] = node;
                    }}
                    className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary"
                  >
                    <step.icon className="size-5" strokeWidth={2} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    {step.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop row (sm and up) — CSS Grid, not flex. The previous flex
            version had `flex-1` step columns but `last:flex-none` on the
            final one (a holdover from when a fixed max-w on the card made
            that column's own width irrelevant); once that cap was removed
            for the wider redesign, the last column had nothing constraining
            it and grew to swallow the row. An explicit grid track list
            (1fr per step, a small fixed track per connector) makes every
            step column deterministically equal-width regardless of
            content — no flex-grow negotiation to get wrong. */}
        <div
          // Reversed — the 5rem connector gap made the cards themselves too
          // narrow/cramped (tall wrapping description text, e.g. "Final
          // Decision"). Back down to a tighter 2rem gap, and the section
          // itself widened (max-w-6xl -> max-w-7xl above) so cards get
          // genuinely more width, not just what the gap gives back.
          className="mt-14 hidden sm:grid sm:items-start"
          style={{
            gridTemplateColumns: STEPS.map((_, i) =>
              i < STEPS.length - 1 ? "1fr 2rem" : "1fr"
            ).join(" "),
          }}
        >
          {STEPS.map((step, i) => (
            <Fragment key={step.label}>
              <div
                className="flex flex-col items-center px-3 motion-reduce:!opacity-100 motion-reduce:!translate-y-0"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity ${STEP_MS}ms ease-out ${stepDelay(i)}ms, transform ${STEP_MS}ms ease-out ${stepDelay(i)}ms`,
                }}
              >
                {/* Icon tile overlaps the card's top edge — first attempt
                    (just a negative margin) was too subtle to actually
                    register as a change. This version makes it unmistakable:
                    a bigger overlap (-mb-9, well over half the icon's own
                    height) plus its own shadow and a ring in the page's own
                    background color, so there's a real visible seam between
                    icon and card instead of them just barely touching — the
                    same "cutout" ring trick already used for AvatarStack's
                    overlapping circles. z-10 keeps it above the card's
                    border. The connector line below still targets
                    top-[27px] — the icon's own top offset is unchanged by a
                    margin on itself, only the card (its sibling) shifts. */}
                <div className="relative z-10 -mb-9">
                  <div className="ring-background flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary shadow-md ring-4">
                    <step.icon className="size-6" strokeWidth={2} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {i + 1}
                  </span>
                </div>
                {/* Left-aligned, not centered — multi-line body copy reads
                    easier left-aligned (design reference comparison this
                    session). min-h reserves 2 lines' worth of title height
                    so a longer label ("Interview & Assessment") wrapping to
                    2 lines doesn't push its description lower than the
                    single-line cards next to it. pt-12 leaves room for the
                    now-bigger overlapping icon above. */}
                <div className="w-full rounded-xl border border-border bg-card px-5 pt-12 pb-5 text-left shadow-sm">
                  <h3 className="font-heading min-h-12 text-base font-semibold text-foreground">
                    {step.label}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {i < STEPS.length - 1 ? (
                <svg
                  aria-hidden="true"
                  className="relative top-[27px] h-0.5 w-full"
                  viewBox="0 0 100 2"
                  preserveAspectRatio="none"
                >
                  <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border)" strokeWidth="2.5" />
                  <line
                    x1="0"
                    y1="1"
                    x2="100"
                    y2="1"
                    pathLength={100}
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeDasharray={100}
                    strokeDashoffset={visible ? 0 : 100}
                    className="motion-reduce:!transition-none"
                    style={{
                      transition: `stroke-dashoffset ${LINE_MS}ms cubic-bezier(0.4,0,0.2,1) ${lineDelay(i)}ms`,
                    }}
                  />
                </svg>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
