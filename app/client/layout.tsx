import { AppShell } from "@/components/layout/AppShell";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/nav-config";

// Force every /client/* route to render dynamically (per-request) instead
// of being statically generated at build time. This repo (beeliv-client-app
// specifically) serves two different hostnames — beeliv.co and
// client.beeliv.co — from one deployment via proxy.ts's Host-header-based
// routing, but proxy.ts only runs at REQUEST time; static generation at
// build time has no Host header to route by at all. Confirmed live on
// client.beeliv.co/client/dashboard: even a fully fresh deploy (Age: 0,
// no CDN caching involved) served the wrong content — the public
// homepage's markup instead of the dashboard's — pointing at a build-time
// static-generation bug tied to this dual-domain setup, not a caching
// issue. Forcing dynamic rendering means every request actually goes
// through proxy.ts's routing before the page renders, eliminating the
// static-shell-generated-without-host-context path entirely.
export const dynamic = "force-dynamic";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      roleLabel={ROLE_LABELS.client}
      scopeLabel="Sample Outlet 1"
      navItems={NAV_ITEMS.client}
      userName="Sample Business Contact"
      navTone="slate"
    >
      {children}
    </AppShell>
  );
}
