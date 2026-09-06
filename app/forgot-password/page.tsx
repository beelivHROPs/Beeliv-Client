import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AuthPageShell,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
} from "@/components/shared/AuthPageShell";

export const metadata: Metadata = { title: "Forgot Password" };

const disabledTitle = "Password reset isn't available yet — no Supabase Auth wired up (Stage 1)";

/**
 * Forgot Password — new this session (project-lead: "there's also not
 * forgot password reset page?"). Structural only, same convention as
 * Login/Apply: no real Supabase Auth/email-sending exists yet (Stage 1), so
 * the email field and submit action are disabled placeholders rather than a
 * real reset flow.
 *
 * Same mobile/desktop split as app/login/page.tsx and app/apply/[id]/
 * page.tsx (see those files' own comments): below `sm:` the gradient-header
 * + overlapping-card composition (project-lead: match the sign-up page's
 * mobile design), above `sm:` the compact AuthPageShell redesign.
 */
export default function ForgotPasswordPage() {
  return (
    <>
      {/* Mobile (<sm) — same composition as Login/Apply's mobile layout. */}
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
                  src="/beeliv-logo-mark-hd.png"
                  alt="Beeliv Hospitality"
                  width={314}
                  height={342}
                  priority
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-8 w-full max-w-sm flex-1 px-4 pb-10">
            <div className="animate-fade-up rounded-3xl border border-border bg-card p-7 shadow-lg">
              <h1 className="text-center font-heading text-xl font-semibold text-foreground">
                Forgot your password?
              </h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Enter the email on your account and we&apos;ll send you a link to reset it.
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

                <button type="button" disabled title={disabledTitle} className={AUTH_PRIMARY_BUTTON_CLASS}>
                  Send Reset Link
                </button>
              </form>

              <Link
                href="/login"
                className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                Back to Log In
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Desktop (sm and up) — the compact redesign. */}
      <div className="hidden sm:block">
        <AuthPageShell>
          <div className="animate-fade-up text-center">
            <h1 className="font-heading text-2xl font-semibold text-white">Forgot your password?</h1>
            <p className="mt-1 text-sm text-white/75">
              Enter the email on your account and we&apos;ll send you a link to reset it.
            </p>
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

            <button type="button" disabled title={disabledTitle} className={AUTH_PRIMARY_BUTTON_CLASS}>
              Send Reset Link
            </button>
          </form>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-white/85 hover:text-white hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to Log In
          </Link>
        </AuthPageShell>
      </div>
    </>
  );
}
