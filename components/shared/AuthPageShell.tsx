import Image from "next/image";
import Link from "next/link";

/**
 * Shared full-page shell for the auth-adjacent screens (Login, Apply/Quick
 * Application, Forgot Password) — replaces the earlier "gradient header
 * band + overlapping white card" composition (project-lead feedback: that
 * modal read as too tall/heavy on desktop). This is the same full-bleed
 * bg-auth-glow purple treatment established for app/not-found.tsx and
 * app/error.tsx, reused here rather than invented separately — matches the
 * flatter, single-surface reference (fields floating directly on the
 * colored background, no bounding card/border/shadow panel) the project
 * lead pointed to this session. A single shared shell keeps the three
 * screens visually/structurally identical instead of drifting.
 */
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-auth-glow relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-[70px]"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.3 }}
        />
        <div
          className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.28 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* White badge behind the logo — this is a rich purple surface
            (bg-auth-glow), so the logo needs the light backing to stay
            legible, same rule as everywhere else this class is used. */}
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center justify-center rounded-2xl bg-white p-3 shadow-md"
        >
          <Image
            src="/beeliv-logo-mark-hd.png"
            alt="Beeliv Hospitality"
            width={314}
            height={342}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        {children}
      </div>
    </div>
  );
}

/** Shared "white pill on purple" primary CTA classes — explicit, not
 *  buttonVariants({variant:"default", className:...}): the default variant
 *  bakes in text-primary-foreground (white) via cva, and tailwind-merge
 *  doesn't reliably dedupe that against an override className, which
 *  rendered a button's label invisible (white-on-white) the first time
 *  this was tried on app/not-found.tsx. Fully explicit sidesteps that.
 *  Also reused as-is for the mobile (<sm) variant of these same buttons
 *  (login/forgot-password/apply) instead of buttonVariants({size:"hero"})
 *  — same h-13/rounded-xl sizing, one source of truth, and no risk of
 *  hitting that exact bug again by fighting the default variant's classes. */
export const AUTH_PRIMARY_BUTTON_CLASS =
  "inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gold text-base font-medium text-gold-foreground shadow-sm transition-all duration-150 hover:scale-[1.01] hover:bg-gold/90 hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

export const AUTH_LABEL_CLASS = "block text-sm font-medium text-white/90";
// Explicit disabled: overrides — same tailwind-merge dedupe failure as
// AUTH_PRIMARY_BUTTON_CLASS above: the base Input component's own
// `disabled:bg-input/50 disabled:opacity-50` won the cascade over this
// className's plain `bg-white`, leaving these fields a washed-out
// translucent-purple against bg-auth-glow instead of solid white with
// legible placeholder text ("the texts are too dim" feedback).
export const AUTH_INPUT_CLASS =
  "h-11 border-transparent bg-white text-base text-foreground shadow-sm placeholder:text-muted-foreground disabled:bg-white disabled:text-foreground disabled:opacity-100 disabled:placeholder:text-muted-foreground";
