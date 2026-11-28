/**
 * Client Support messages, LIVE: GET /api/client/support/list and POST /api/client/support/create
 * (docs/contracts/client-support-messages.sql). Reshapes the server's answer only; it adds no rule of its own.
 * Only relative imports so it can be unit-tested offline.
 */
import { errorFromReply, networkError } from "../shared/error-messages";

export type SupportStatus = "open" | "answered" | "closed";
export type SupportReply = { body: string; at: string; by: string };
export type SupportMessage = {
  id: string; reference: string; topic: string; message: string; status: SupportStatus; outletName: string;
  sentAt: string; updatedAt: string; hasUpdate: boolean; replies: SupportReply[];
};

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const STATUSES: readonly SupportStatus[] = ["open", "answered", "closed"];

/** One server item -> a SupportMessage; null when malformed. */
export function toSupportMessage(raw: unknown): SupportMessage | null {
  const r = rec(raw);
  const status = r ? STATUSES.find((s) => s === r.status) : undefined;
  if (!r || !status || !str(r.id)) return null;
  return {
    id: str(r.id), reference: str(r.reference), topic: str(r.topic), message: str(r.message), status, outletName: str(r.outletName),
    sentAt: str(r.sentAt), updatedAt: str(r.updatedAt) || str(r.sentAt), hasUpdate: r.hasUpdate === true,
    replies: (Array.isArray(r.replies) ? r.replies : []).flatMap((x): SupportReply[] => {
      const p = rec(x);
      return p && str(p.body) ? [{ body: str(p.body), at: str(p.at), by: str(p.by) || "Beeliv team" }] : [];
    }),
  };
}

/** Support-specific wording first, then the shared explanation (lib/shared/error-messages.ts). */
const OVERRIDES: Record<string, string> = {
  invalid_request: "Choose a topic and write a message of 3 to 1,000 characters.",
  agreement_required: "Accept the current Beeliv agreements first, then try again.",
  no_access: "You can't send a message for this outlet.",
};

/** The user's messages, newest first. */
export async function liveSupportMessages(): Promise<SupportMessage[]> {
  const res = await fetch("/api/client/support/list", { credentials: "same-origin", cache: "no-store" }).catch(() => { throw networkError(); });
  const j = rec(await res.json().catch(() => null));
  if (j?.ok !== true || !Array.isArray(j.items)) throw errorFromReply(j, undefined, OVERRIDES);
  return j.items.map(toSupportMessage).filter((x): x is SupportMessage => !!x);
}

/** Sends the message; resolves with the server's reference (BLV-MSG-...). */
export async function sendLiveSupportMessage(input: { topic: string; message: string; outletId: string | null }): Promise<{ id: string; reference: string }> {
  const body: Rec = { topic: input.topic, message: input.message.trim() };
  if (input.outletId) body.outletId = input.outletId;
  const res = await fetch("/api/client/support/create", {
    method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }).catch(() => { throw networkError(); });
  const j = rec(await res.json().catch(() => null));
  if (j?.ok !== true || !str(j.id)) throw errorFromReply(j, undefined, OVERRIDES);
  return { id: str(j.id), reference: str(j.reference) };
}
