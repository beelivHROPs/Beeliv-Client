import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SAMPLE_JOB_LISTINGS } from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { PasswordField } from "@/components/shared/PasswordField";
import {
  AuthPageShell,
  AUTH_PRIMARY_BUTTON_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_INPUT_CLASS,
} from "@/components/shared/AuthPageShell";

type Params = { id: string };

export const metadata: Metadata = { title: "Apply" };

/**
 * Apply Entry — docs/architecture/ui-ux-framework.md §16, screen 04.
 * Quick Application field set — locked this session (project-lead decision):
 * Full Name, Email, Phone Number, Password, Confirm Password. Full name and
 * phone were added to the originally thinner email/password-only version so
 * Beeliv has an identity and an alternate contact channel from the start;
 * everything else in the onboarding field set (personal info detail,
 * employment, next-of-kin, sensitive/banking) still stays out of this
 * screen entirely — it belongs to the later Documentation stage, once the
 * applicant has been shortlisted/interviewed. Linking the created account
 * and this specific job listing (`applications.applicant_id` /
 * `job_listing_id`, per database-architecture.md §3) is real Stage 2 work
 * once accounts and a database exist — not represented here, since faking
 * that link without either would be an illusion, not a feature.
 *
 * Structural only: real Supabase Auth account creation/login is Stage 2 work
 * and is explicitly out of scope for this implementation slice. Input fields
 * are disabled with an explanatory title, matching app/login/page.tsx's
 * convention; the primary action still navigates to the next structural
 * screen (no real signup is performed).
 *
 * Two genuinely different layouts below/above `sm:` — same split as
 * app/login/page.tsx (see that file's own comment): below `sm:` keeps the
 * ORIGINAL gradient-header + overlapping-card composition (project-lead
 * direction — the "too big" complaint was specifically about desktop). At
 * `sm:` and up, the compact AuthPageShell redesign.
 */
export default async function ApplyEntryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const job = SAMPLE_JOB_LISTINGS.find((j) => j.id === id);

  if (!job) {
    notFound();
  }

  const disabledTitle = "Sign-in isn't available yet";

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
              <h1 className="font-heading text-xl font-semibold text-foreground">
                Apply for {job.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your account and start your application. You can complete additional
                information as you progress through the recruitment process.
              </p>

              <form className="mt-6 space-y-4">
                <div>
                  <label htmlFor="full-name-mobile" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    id="full-name-mobile"
                    type="text"
                    autoComplete="name"
                    disabled
                    title={disabledTitle}
                    placeholder="Your full name"
                    className="mt-1 h-11 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="email-mobile" className="block text-sm font-medium text-foreground">
                    Email Address
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

                <div>
                  <label htmlFor="phone-mobile" className="block text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    id="phone-mobile"
                    type="tel"
                    autoComplete="tel"
                    disabled
                    title={disabledTitle}
                    placeholder="080X XXX XXXX"
                    className="mt-1 h-11 text-base"
                  />
                </div>

                <PasswordField
                  id="password-mobile"
                  label="Password"
                  autoComplete="new-password"
                  disabled
                  title={disabledTitle}
                />

                <PasswordField
                  id="confirm-password-mobile"
                  label="Confirm Password"
                  autoComplete="new-password"
                  disabled
                  title={disabledTitle}
                />

                <Link
                  href="https://talent.beeliv.co/applicant/dashboard"
                  className={buttonVariants({ size: "hero", className: "w-full" })}
                >
                  Create Account &amp; Continue
                </Link>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log In
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
            <h1 className="font-heading text-xl font-semibold text-white">Apply for {job.title}</h1>
            <p className="mt-1 text-sm text-white/75">
              Create your account and start your application. You can complete additional
              information as you progress through the recruitment process.
            </p>
          </div>

          <form className="animate-fade-up mt-6 space-y-4">
            <div>
              <label htmlFor="full-name" className={AUTH_LABEL_CLASS}>
                Full Name
              </label>
              <Input
                id="full-name"
                type="text"
                autoComplete="name"
                disabled
                title={disabledTitle}
                placeholder="Your full name"
                className={`mt-1 ${AUTH_INPUT_CLASS}`}
              />
            </div>

            <div>
              <label htmlFor="email" className={AUTH_LABEL_CLASS}>
                Email Address
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

            <div>
              <label htmlFor="phone" className={AUTH_LABEL_CLASS}>
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                disabled
                title={disabledTitle}
                placeholder="080X XXX XXXX"
                className={`mt-1 ${AUTH_INPUT_CLASS}`}
              />
            </div>

            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              disabled
              title={disabledTitle}
              labelClassName={AUTH_LABEL_CLASS}
              inputClassName={AUTH_INPUT_CLASS}
            />

            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              autoComplete="new-password"
              disabled
              title={disabledTitle}
              labelClassName={AUTH_LABEL_CLASS}
              inputClassName={AUTH_INPUT_CLASS}
            />

            {/* Full cross-subdomain URL, not a relative route — the
                Applicant dashboard lives in Beeliv-Staff (talent.beeliv.co),
                a separate deployed app from this one. */}
            <Link href="https://talent.beeliv.co/applicant/dashboard" className={AUTH_PRIMARY_BUTTON_CLASS}>
              Create Account &amp; Continue
            </Link>
          </form>

          <p className="mt-4 text-center text-sm text-white/75">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white hover:underline">
              Log In
            </Link>
          </p>
        </AuthPageShell>
      </div>
    </>
  );
}
