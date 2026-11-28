/**
 * Client Support messages (docs/contracts/client-support-messages.sql). Pure: no I/O. The database re-checks the session,
 * the agreements, the outlet scope, the topic, the length, the revision and every status change; this only bounds the
 * input before any sign-in work and keeps the documented fields of the answer.
 * Shared by the Client route (/api/client/support/*) and the Admin route (/api/admin/support/*).
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The eight topics the database accepts (exact strings, same as the Support page). */
export const SUPPORT_TOPICS = [
  "Staffing request", "Recruitment question", "Staff concern", "Document / compliance issue", "Schedule issue", "Access change request",
  "Report a problem", "Other",
] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number];
export const SUPPORT_STATUSES = ["open", "answered", "closed"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");
const keysOnly = (r: Rec, allowed: readonly string[]) => Object.keys(r).every((k) => allowed.includes(k));
const iso = (v: unknown) => (typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v)) ? v : "");

export type NewSupportMessage = { topic: SupportTopic; message: string; outletId: string | null };

/** { topic, message, outletId? }: a known topic, a message of 3-1000 characters, an optional outlet id. null when off. */
export function parseNewSupportMessage(input: unknown): NewSupportMessage | null {
  const r = rec(input);
  if (!r || !keysOnly(r, ["topic", "message", "outletId"])) return null;
  const topic = SUPPORT_TOPICS.find((t) => t === r.topic);
  const message = typeof r.message === "string" ? r.message.trim() : "";
  if (!topic || message.length < 3 || message.length > 1000) return null;
  if (!(r.outletId === undefined || r.outletId === null || (typeof r.outletId === "string" && UUID.test(r.outletId)))) return null;
  return { topic, message, outletId: typeof r.outletId === "string" ? r.outletId.toLowerCase() : null };
}

export type SupportReply = { messageId: string; expectedRevision: number; body: string; close: boolean };

/** Admin reply and/or close: the revision it was read at, a reply of at most 1000 characters, and a reply or a close. */
export function parseSupportReply(input: unknown): SupportReply | null {
  const r = rec(input);
  if (!r || !keysOnly(r, ["messageId", "expectedRevision", "body", "close"])) return null;
  if (typeof r.messageId !== "string" || !UUID.test(r.messageId)) return null;
  if (!Number.isSafeInteger(r.expectedRevision) || (r.expectedRevision as number) < 1 || (r.expectedRevision as number) > 1_000_000) return null;
  if (!(r.body === undefined || typeof r.body === "string") || !(r.close === undefined || typeof r.close === "boolean")) return null;
  const body = typeof r.body === "string" ? r.body.trim() : "";
  const close = r.close === true;
  if (body.length > 1000 || (!body && !close)) return null;
  return { messageId: r.messageId.toLowerCase(), expectedRevision: r.expectedRevision as number, body, close };
}

export type SupportReplyEntry = { body: string; at: string; by: string };
export type ClientSupportMessage = {
  id: string; reference: string; topic: string; message: string; status: SupportStatus; outletName: string; clientName: string;
  sentAt: string; updatedAt: string; revision: number; hasUpdate: boolean; replies: SupportReplyEntry[];
};
export type AdminSupportMessage = ClientSupportMessage & { clientId: string; sender: string };

function replyEntry(raw: unknown): SupportReplyEntry | null {
  const r = rec(raw);
  if (!r || !iso(r.at) || typeof r.body !== "string" || !r.body) return null;
  return { body: r.body.slice(0, 1000), at: iso(r.at), by: str(r.by) };
}

function clientMessage(raw: unknown): ClientSupportMessage | null {
  const m = rec(raw);
  const status = m ? SUPPORT_STATUSES.find((s) => s === m.status) : undefined;
  if (!m || !status || !UUID.test(str(m.id)) || !iso(m.sentAt) || typeof m.message !== "string") return null;
  return {
    id: str(m.id), reference: str(m.reference, 40), topic: str(m.topic, 80), message: m.message.slice(0, 1000), status,
    outletName: str(m.outletName), clientName: str(m.clientName), sentAt: iso(m.sentAt), updatedAt: iso(m.updatedAt) || iso(m.sentAt),
    revision: Number.isSafeInteger(m.revision) && (m.revision as number) >= 1 ? (m.revision as number) : 1, hasUpdate: m.hasUpdate === true,
    replies: (Array.isArray(m.replies) ? m.replies : []).slice(0, 200).map(replyEntry).filter((x): x is SupportReplyEntry => !!x),
  };
}

/** The Client's own messages: documented fields only (replies signed "Beeliv team"). At most 500. */
export function projectClientSupport(items: unknown): ClientSupportMessage[] {
  return (Array.isArray(items) ? items : []).slice(0, 500).map(clientMessage).filter((x): x is ClientSupportMessage => !!x);
}

/** Admin list: the client fields plus client id and the sender's name. At most 1000. */
export function projectAdminSupport(items: unknown): AdminSupportMessage[] {
  return (Array.isArray(items) ? items : []).slice(0, 1000).flatMap((raw): AdminSupportMessage[] => {
    const base = clientMessage(raw);
    const m = rec(raw);
    if (!base || !m || !UUID.test(str(m.clientId))) return [];
    return [{ ...base, clientId: str(m.clientId), sender: str(m.sender) }];
  });
}
