import { saveClientProfile } from "@/lib/server/client-workspace/context";
import { enforceOrigin } from "@/lib/server/auth/service";
import { readJson } from "@/lib/server/public-enquiries/handler";

export const runtime = "nodejs";
const HEADERS = { "Cache-Control": "private, no-store" };

/** The signed-in client user saves their OWN name, phone, job title and notification preferences. */
export async function POST(request: Request) {
  try {
    enforceOrigin(request, "client");
    const raw = (await readJson(request)) as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return Response.json({ ok: false, reason: "invalid_request" }, { status: 400, headers: HEADERS });
    const pick = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).slice(0, 200) : undefined);
    const notifications = raw.notifications && typeof raw.notifications === "object" && !Array.isArray(raw.notifications) ? (raw.notifications as Record<string, boolean>) : undefined;
    await saveClientProfile({ fullName: pick("fullName"), phone: pick("phone"), jobTitle: pick("jobTitle"), notifications });
    return Response.json({ ok: true }, { headers: HEADERS });
  } catch (e) {
    const reason = e instanceof Error && ["phone_in_use", "invalid_request"].includes(e.message) ? e.message : "unavailable";
    return Response.json({ ok: false, reason }, { status: reason === "unavailable" ? 503 : 400, headers: HEADERS });
  }
}
