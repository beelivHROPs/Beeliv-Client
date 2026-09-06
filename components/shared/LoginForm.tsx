"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/shared/PasswordField";
import {
  AuthPageShell,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
} from "@/components/shared/AuthPageShell";

const disabledTitle = "Sign-in isn't available yet";
// Consistent with the email field's own placeholder everywhere else in this
// app — shown here as the "you've moved past this step" example, not a
// claim that a real value was typed (the email input stays disabled, same
// as every field on this structural, no-backend-yet screen).
const EXAMPLE_EMAIL = "you@example.com";

/**
 * Two-step email -> password flow (2026 login-UX research: single-field-
 * at-a-time reduces cognitive load vs. showing both fields at once).
 * Step navigation is real client state — same precedent as
 * components/applicant/documentation/DocumentationWizard.tsx ("step
 * navigation is local client state only ... nothing is persisted,
 * validated, or submitted"): the "Continue" button genuinely advances the
 * step, but the fields it reveals stay disabled/structural like everywhere
 * else on this page, since no Supabase Auth is wired up yet (Stage 1).
 * Split into its own client component (unlike the rest of this page's
 * static JSX) so app/login/page.tsx can stay a server component and export
 * `metadata` — same reason DocumentsScreen was split from its page.
 */
export function LoginForm() {
  const [step, setStep] = useState<"email" | "password">("email");

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
                Welcome back <span aria-hidden="true">👋</span>
              </h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Log in to continue to your dashboard.
              </p>

              {step === "email" ? (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep("password");
                  }}
                >
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
                      placeholder={EXAMPLE_EMAIL}
                      className="mt-1 h-11 text-base"
                    />
                  </div>

                  <button type="submit" className={AUTH_PRIMARY_BUTTON_CLASS}>
                    Continue
                  </button>
                </form>
              ) : (
                <form className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                    <span className="truncate text-foreground">{EXAMPLE_EMAIL}</span>
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="shrink-0 font-medium text-primary hover:underline"
                    >
                      Change
                    </button>
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

                  <button type="button" disabled title={disabledTitle} className={AUTH_PRIMARY_BUTTON_CLASS}>
                    Log In
                  </button>
                </form>
              )}

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

          {step === "email" ? (
            <form
              className="animate-fade-up mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("password");
              }}
            >
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
                  placeholder={EXAMPLE_EMAIL}
                  className={`mt-1 ${AUTH_INPUT_CLASS}`}
                />
              </div>

              <button type="submit" className={AUTH_PRIMARY_BUTTON_CLASS}>
                Continue
              </button>
            </form>
          ) : (
            <form className="animate-fade-up mt-6 space-y-4">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
                <span className="truncate text-white">{EXAMPLE_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="shrink-0 font-medium text-white hover:underline"
                >
                  Change
                </button>
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
          )}

          {step === "password" ? (
            <div className="mt-4 flex items-center justify-center gap-1 text-sm text-white/75">
              <Link href="/forgot-password" className="font-medium text-white hover:underline">
                Forgot password?
              </Link>
            </div>
          ) : null}

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
