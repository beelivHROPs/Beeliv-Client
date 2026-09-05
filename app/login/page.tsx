import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/shared/PasswordField";
import {
  AuthPageShell,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
} from "@/components/shared/AuthPageShell";

export const metadata: Metadata = { title: "Log In" };

const disabledTitle = "Sign-in isn't available yet";

/**
 * Login — docs/architecture/ui-ux-framework.md §16, screen 07.
 *
 * PROPOSED direction (not yet Beeliv-approved): one unified login for all
 * five roles, with role-based routing after authentication. Structural only
 * — no real Supabase Auth is wired up in this implementation slice.
 *
 * Two genuinely different layouts below/above `sm:`, same split pattern
 * already used elsewhere for "too different to share one responsive tree"
 * cases (e.g. components/shared/HowItWorks.tsx's mobile zigzag vs. desktop
 * grid): below `sm:` keeps the ORIGINAL gradient-header + overlapping-card
 * composition (project-lead direction — the "too big" complaint was
 * specifically about desktop; the mobile treatment was never the problem).
 * At `sm:` and up, the compact AuthPageShell (this session's redesign) — see
 * that component's own comment for the full rationale. "Forgot password?"
 * is upgraded to a real link (app/forgot-password/page.tsx, new this
 * session) in BOTH layouts — that fix isn't breakpoint-specific.
 */
export default function LoginPage() {
  return (
    <>
      {/* Mobile (<sm) — original composition, unchanged from before this
          session's desktop redesign. */}
      <div className="flex min-h-screen flex-col bg-background sm:hidden">
        <main className="flex flex-1 flex-col">
          <div className="bg-auth-glow relative overflow-hidden rounded-b-4xl px-4 pt-12 pb-28">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-16 -left-16 h-56 w-56 rounded-full blur-[60px]"
                style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.3 }}
              />
              <div
                className="absolute -top-10 right-0 h-48 w-48 rounded-full blur-[60px]"
                style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)", opacity: 0.35 }}
              />
            </div>

            <div className="relative z-10 flex justify-center">
              <Link
                href="/"
                className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-md"
              >
                <Image
                  src="/beeliv-logo-mark-v2.png"
                  alt="Beeliv Hospitality"
                  width={214}
                  height={223}
                  priority
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-8 w-full max-w-sm flex-1 px-4 pb-10">
            <div className="animate-fade-up rounded-3xl border border-border bg-card p-7 shadow-lg">
              <h1 className="text-center font-heading text-xl font-semibold text-foreground">
                Welcome back <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Log in to continue to your dashboard.
              </p>

              <form className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email-mobile" className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email-mobile"
                    type="email"
                    autoComplete="email"
                    disabled
                    title={disabledTitle}
                    placeholder="you@example.com"
                    className="mt-1 h-11 text-base"
                  />
                </div>

                <PasswordField
                  id="password-mobile"
                  label="Password"
                  autoComplete="current-password"
                  disabled
                  title={disabledTitle}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground has-disabled:opacity-50">
                    <input
                      type="checkbox"
                      disabled
                      title={disabledTitle}
                      className="size-4 rounded border-input accent-primary disabled:cursor-not-allowed"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="button" disabled size="hero" className="w-full" title={disabledTitle}>
                  Log In
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link href="/positions" className="font-medium text-primary hover:underline">
                  View open positions
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Desktop (sm and up) — the compact redesign. */}
      <div className="hidden sm:block">
        <AuthPageShell>
          <div className="animate-fade-up text-center">
            <h1 className="font-heading text-2xl font-semibold text-white">
              Welcome back <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-white/75">Log in to continue to your dashboard.</p>
          </div>

          <form className="animate-fade-up mt-6 space-y-4">
            <div>
              <label htmlFor="email" className={AUTH_LABEL_CLASS}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled
                title={disabledTitle}
                placeholder="you@example.com"
                className={`mt-1 ${AUTH_INPUT_CLASS}`}
              />
            </div>

            <PasswordField
              id="password"
              label="Password"
              autoComplete="current-password"
              disabled
              title={disabledTitle}
              labelClassName={AUTH_LABEL_CLASS}
              inputClassName={AUTH_INPUT_CLASS}
            />

            <button type="button" disabled title={disabledTitle} className={AUTH_PRIMARY_BUTTON_CLASS}>
              Log In
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-white/75">
            <Link href="/forgot-password" className="font-medium text-white hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="mt-3 text-center text-sm text-white/75">
            New here?{" "}
            <Link href="/positions" className="font-medium text-white hover:underline">
              View open positions
            </Link>
          </p>
        </AuthPageShell>
      </div>
    </>
  );
}
