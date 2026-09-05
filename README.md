# Beeliv-Client

Serves **two domains from one app**: `beeliv.co` (the public recruitment site — homepage, Open Positions, Job Details, Apply, Login, Forgot Password) and `client.beeliv.co` (the authenticated Client dashboard, kept under the `/client/*` path prefix). Split out of the shared prototype repo (`babaloloademola320-glitch/beeliv-hr-ops`) on 2026-09-05, per the project lead's live confirmation of the real subdomain split:

- `beeliv.co` + `client.beeliv.co` → **this repo**
- `admin.beeliv.co` (HR + Ops) → `Beeliv-Admin`
- `talent.beeliv.co` (Applicant + Staff) → `Beeliv-Staff`

## How the two-domain split actually works

`proxy.ts` reads the incoming request's `host` header on every request:

- If the host starts with `client.` → only `/client/*` paths are allowed; `/` redirects to `/client/dashboard`; anything else 404s.
- Any other host (i.e. `beeliv.co`, or local dev) → `/client/*` paths 404; everything else (the public site) works normally.

**Deployment note:** on Vercel (or wherever this lands), both `beeliv.co` and `client.beeliv.co` need to be attached as domains to *this same project* — it's one deployment serving both, not two separate deployments.

**Known, deliberate polish gap:** the Client dashboard's routes stayed under `/client/*` (so `client.beeliv.co/client/dashboard`, not `client.beeliv.co/dashboard`) rather than being flattened to root-level paths. That's a little redundant, but it meant zero internal links needed rewiring during this split — worth revisiting later, not a Stage 1 blocker.

## Cross-app link

`app/apply/[id]/page.tsx`'s "Create Account & Continue" button points to `https://talent.beeliv.co/applicant/dashboard` — a full absolute URL, not a relative route, since the Applicant dashboard lives in the separate `Beeliv-Staff` app.

## What's duplicated here, and why

Same tradeoff as the other two repos: this app carries its own copies of every shared component/hook/lib file it needs rather than depending on a shared package across all three repos. Deliberate for this Stage 1/prototype stage.

## Auth (not yet wired)

No Supabase Auth/session handling exists yet. The intended design (shared across all three repos): login happens on `beeliv.co/login`, a Supabase Auth session cookie scoped to the parent domain `.beeliv.co` (not just `beeliv.co`) so it's valid on `admin.`/`client.`/`talent.` too, then a post-login redirect based on the authenticated user's role (from a `profiles` table, not yet created) — HR/Ops → `admin.beeliv.co`, Client → `client.beeliv.co/dashboard`, Staff/Applicant → `talent.beeliv.co`.

## Stage boundary

Same as `my-app`: this is Stage 1 prototype work. No database tables, RLS, or real authentication exist. Every disabled/structural pattern from the source repo is preserved as-is.
