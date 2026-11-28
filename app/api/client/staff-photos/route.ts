import { RateFailure } from "@/lib/server/auth/rate";
import { enforceOrigin } from "@/lib/server/auth/service";
import { readClientStaffPhotos } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };

/**
 * POST /api/client/staff-photos: short-lived links to the VERIFIED Passport photographs of the staff placed at the
 * signed-in client user's outlets (docs/contracts/staff-photos.sql). Same-origin only. Not a verified client user: 401.
 * When the feature itself is not available the answer is an empty list, never an error (initials stay).
 */
export async function POST(request: Request) {
  try {
    enforceOrigin(request, "client");
  } catch {
    return Response.json({ ok: false, error: { code: "forbidden" } }, { status: 403, headers: HEADERS });
  }
  try {
    return Response.json({ ok: true, photos: await readClientStaffPhotos() }, { headers: HEADERS });
  } catch (error) {
    if (error instanceof RateFailure) return Response.json({ ok: false, error: { code: "rate_limited" } }, { status: 429, headers: HEADERS });
    return Response.json({ ok: false, error: { code: "unauthenticated" } }, { status: 401, headers: HEADERS });
  }
}
