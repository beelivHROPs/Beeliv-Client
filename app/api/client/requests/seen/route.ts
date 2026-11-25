import { RateFailure } from "@/lib/server/auth/rate";
import { enforceOrigin } from "@/lib/server/auth/service";
import { readJson } from "@/lib/server/public-enquiries/handler";
import { markClientRequestSeen } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
const HEADERS = { "Cache-Control": "private, no-store" };
const STATUS: Record<string, number> = { invalid_request: 400, agreement_required: 403, no_access: 403, forbidden: 403, rate_limited: 429, unavailable: 503 };

/** POST /api/client/requests/seen { requestId }: the client user opened this request (clears its "Updated" mark). */
export async function POST(request: Request) {
  try {
    enforceOrigin(request, "client");
    await markClientRequestSeen(await readJson(request).catch(() => null));
    return Response.json({ ok: true }, { headers: HEADERS });
  } catch (error) {
    const code = error instanceof RateFailure ? "rate_limited" : error instanceof Error && error.message in STATUS ? error.message : "unauthenticated";
    return Response.json({ ok: false, error: { code } }, { status: STATUS[code] ?? 401, headers: HEADERS });
  }
}
