# Beeliv-Client

Serves both `beeliv.co` (public site) and `client.beeliv.co` (Client dashboard) from one deployment — `proxy.ts` splits traffic by hostname.

**Deployment:** attach both domains to this same project, not two separate deployments, or the split won't work.

Standard Next.js app otherwise. No environment variables needed — no database or authentication is wired up yet (Stage 1 prototype: every form field is intentionally disabled, no data is persisted).
