import { NextResponse, type NextRequest } from "next/server";

/**
 * This one app serves two different domains — the public recruitment site
 * (beeliv.co) and the authenticated Client dashboard (client.beeliv.co) —
 * per the project lead's confirmed subdomain architecture (2026-09-05).
 * Both domains point at this same Vercel deployment; this proxy (renamed
 * from "middleware" in Next.js 16 — see node_modules/next/dist/docs's own
 * migration note) is what actually separates them, since Next.js itself
 * has no concept of "this route only exists on that hostname."
 *
 * The Client dashboard routes stay under the "/client" prefix (unchanged
 * from the original shared-monorepo paths, and unchanged from
 * lib/nav-config.ts's hrefs) rather than being flattened to root-level
 * paths — client.beeliv.co/client/dashboard reads a little redundantly,
 * but it means zero internal links needed rewiring for this split. Worth
 * revisiting as a polish pass later, not a Stage 1 blocker.
 */
const CLIENT_DASHBOARD_PREFIX = "/client";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isClientHost = host.startsWith("client.");
  const { pathname } = request.nextUrl;

  const isClientDashboardPath =
    pathname === CLIENT_DASHBOARD_PREFIX || pathname.startsWith(`${CLIENT_DASHBOARD_PREFIX}/`);

  if (isClientHost) {
    // client.beeliv.co only ever serves the Client dashboard.
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
    if (!isClientDashboardPath) {
      return NextResponse.rewrite(new URL("/__not_found__", request.url));
    }
  } else {
    // beeliv.co (and any other host, e.g. local dev) only ever serves the
    // public recruitment site — the Client dashboard isn't reachable here.
    if (isClientDashboardPath) {
      return NextResponse.rewrite(new URL("/__not_found__", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and Next's own internals — no need to run this
  // hostname check against them.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
