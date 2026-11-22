import { readClientPortal } from "@/lib/server/client-workspace/context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const HEADERS = { "Cache-Control": "private, no-store" };

/** The signed-in client user's own outlets and placed staff. 401 when not a verified, active client user. */
export async function GET() {
  try {
    return Response.json({ ok: true, ...(await readClientPortal()) }, { headers: HEADERS });
  } catch {
    return Response.json({ ok: false, error: { code: "unavailable" } }, { status: 401, headers: HEADERS });
  }
}
