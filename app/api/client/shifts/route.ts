import { RateFailure } from "@/lib/server/auth/rate";
import { readClientShifts } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };

const STATUS: Record<string, number> = { invalid_request: 400, agreement_required: 403, no_access: 403, rate_limited: 429, unavailable: 503 };

/**
 * GET /api/client/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD: the signed-in client user's published shifts and check-ins
 * (read-only; at most 62 days). 401 when not a verified, active client user.
 */
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const input: Record<string, string> = {};
    for (const [k, v] of q) input[k] = v;
    return Response.json({ ok: true, items: await readClientShifts(input) }, { headers: HEADERS });
  } catch (error) {
    const code = error instanceof RateFailure ? "rate_limited" : error instanceof Error && error.message in STATUS ? error.message : "unauthenticated";
    return Response.json({ ok: false, error: { code } }, { status: STATUS[code] ?? 401, headers: HEADERS });
  }
}
