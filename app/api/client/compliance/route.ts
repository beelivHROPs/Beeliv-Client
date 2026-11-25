import { RateFailure } from "@/lib/server/auth/rate";
import { readClientCompliance } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };
const STATUS: Record<string, number> = { agreement_required: 403, no_access: 403, rate_limited: 429, unavailable: 503 };

/**
 * GET /api/client/compliance: document STATUS of the ordinary slots for the staff placed at the user's outlets
 * (staff_doc_completion, client audience). Takes no input: the server decides whose status is read. Never a file,
 * a reason, a person id or a sensitive slot. 401 when not a verified, active client user.
 */
export async function GET() {
  try {
    return Response.json({ ok: true, items: await readClientCompliance() }, { headers: HEADERS });
  } catch (error) {
    const code = error instanceof RateFailure ? "rate_limited" : error instanceof Error && error.message in STATUS ? error.message : "unauthenticated";
    return Response.json({ ok: false, error: { code } }, { status: STATUS[code] ?? 401, headers: HEADERS });
  }
}
