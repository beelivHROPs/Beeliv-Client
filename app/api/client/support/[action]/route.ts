import { RateFailure } from "@/lib/server/auth/rate";
import { enforceOrigin } from "@/lib/server/auth/service";
import { readJson } from "@/lib/server/public-enquiries/handler";
import { createClientSupport, readClientSupport } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };
const STATUS: Record<string, number> = { invalid_request: 400, agreement_required: 403, no_access: 403, forbidden: 403, not_found: 404, rate_limited: 429, unavailable: 503 };

function failure(error: unknown) {
  const code = error instanceof RateFailure ? "rate_limited" : error instanceof Error && error.message in STATUS ? error.message : "unauthenticated";
  return Response.json({ ok: false, error: { code } }, { status: STATUS[code] ?? 401, headers: HEADERS });
}

/**
 * GET /api/client/support/list: the signed-in client user's Support messages and Beeliv's replies
 * (docs/contracts/client-support-messages.sql). 401 when not a verified, active client user.
 */
export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (action !== "list") throw new Error("not_found");
    return Response.json({ ok: true, items: await readClientSupport() }, { headers: HEADERS });
  } catch (error) {
    return failure(error);
  }
}

/** POST /api/client/support/create { topic, message, outletId? }: send a message to Beeliv HR. Same-origin JSON only. */
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params;
    if (action !== "create") throw new Error("not_found");
    enforceOrigin(request, "client");
    const input = await readJson(request).catch(() => null);
    return Response.json({ ok: true, ...(await createClientSupport(input)) }, { headers: HEADERS });
  } catch (error) {
    return failure(error); // a cross-origin call fails enforceOrigin with "forbidden" (403)
  }
}
