@AGENTS.md

# Beeliv-Client

Serves **two domains from one app**: `beeliv.co` (public recruitment site) and `client.beeliv.co` (Client dashboard, under `/client/*`), split by `proxy.ts` reading the request's `host` header. Extracted from the shared prototype repo (`babaloloademola320-glitch/beeliv-hr-ops`) on 2026-09-05. See `README.md` for the full split rationale, the middleware routing logic, and the not-yet-wired auth design.

**This repo inherits every rule from the source repo's own `CLAUDE.md`** (stage boundaries, no-invented-requirements, small-testable-changes, secrets handling, etc.) — treat that document as still governing, even though it isn't physically copied here. In particular:

- **Stage boundary:** this is still Stage 1 prototype work. No database tables, RLS, Supabase Auth, or real authentication exist here. Every disabled/structural pattern (disabled form fields with an explanatory `title`, etc.) must stay that way until Stage 2 is explicitly approved.
- **Do not invent requirements, features, business rules, or roles** not already established in the source repo's documentation. No marketing/promotional content on the public site beyond what's already there — that rule carried over unchanged.
- **Do not touch `proxy.ts`'s host-based routing** without understanding both domains it's splitting — a bug there can silently expose the Client dashboard on the public domain or vice versa.
- **Do not add authentication/session logic** without first designing the cross-subdomain session approach (a Supabase Auth cookie scoped to `.beeliv.co`, shared with `Beeliv-Admin` and `Beeliv-Staff`) — implementing it independently here risks a design that doesn't interoperate with the other two apps.
- **Shared components/lib are intentionally duplicated** from the source repo rather than pulled from a shared package (see README). Don't "fix" this by importing across repos — if the duplication becomes a real problem, that's a decision to make explicitly, not silently.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
