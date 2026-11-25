import { RateFailure } from "@/lib/server/auth/rate";
import { enforceOrigin } from "@/lib/server/auth/service";
import { readJson } from "@/lib/server/public-enquiries/handler";
import { createClientRequest, readClientRequests } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };
const STATUS: Record<string, number> = { invalid_request: 400, agreement_required: 403, no_access: 403, forbidden: 403, rate_limited: 429, unavailable: 503 };

function failure(error: unknown) {
  const code = error instanceof RateFailure ? "rate_limited" : error instanceof Error && error.message in STATUS ? error.message : "unauthenticated";
  return Response.json({ ok: false, error: { code } }, { status: STATUS[code] ?? 401, headers: HEADERS });
}

/**
 * GET /api/client/requests: the signed-in client user's staff requests (day2-warnings-requests.sql, part B) and the reason
 * labels for the form. 401 when not a verified, active client user.
 */
export async function GET() {
  try {
    const { items, reasons } = await readClientRequests();
    return Response.json({ ok: true, items, reasons }, { headers: HEADERS });
  } catch (error) {
    return failure(error);
  }
}

/** POST /api/client/requests: send a new staff request to Beeliv HR. Same-origin JSON only. */
export async function POST(request: Request) {
  try {
    enforceOrigin(request, "client");
    const input = await readJson(request).catch(() => null);
    return Response.json({ ok: true, ...(await createClientRequest(input)) }, { headers: HEADERS });
  } catch (error) {
    return failure(error); // a cross-origin call fails enforceOrigin with "forbidden" (403)
  }
}
