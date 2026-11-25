/**
 * Client Workforce Requests and Compliance, LIVE.
 *  - Requests: GET/POST /api/client/requests and POST /api/client/requests/seen (docs/contracts/day2-warnings-requests.sql,
 *    part B). publicId = the server's reference (BLV-REQ-...); the department is stored as text and read back with the same
 *    keyword mapping My Workforce uses.
 *  - Compliance: GET /api/client/compliance (staff_doc_completion, client audience): a coarse STATUS per ordinary document
 *    slot, per placed staff member. Never a file, an expiry the backend did not send, or a sensitive slot.
 * This file only reshapes the server's answer into the existing Client types; it adds no rule of its own.
 * Only relative imports so it can be unit-tested offline (tests/day2-staff-requests.test.cjs).
 */
import { toISODate } from "./format";
import type { ComplianceItem, ComplianceState, ComplianceSummary, DepartmentId, NewWorkforceRequest, OutletScope, WorkforceRequest, WorkforceRequestStatus } from "./types";

/** Department text (placements, requests) -> the Client's department ids. Shared with My Workforce. */
export function department(text: string | null | undefined): DepartmentId {
  const t = String(text ?? "").toLowerCase();
  if (/kitchen|chef|cook/.test(t)) return "kitchen";
  if (/bar/.test(t)) return "bar";
  if (/admin|office|account/.test(t)) return "admin";
  if (/support|clean|security|steward|maint/.test(t)) return "support";
  return "floor-service";
}
/** The text a department id is stored as (reads back to the same id through `department`). */
export const DEPT_LABEL: Record<DepartmentId, string> = { "floor-service": "Floor service", kitchen: "Kitchen", bar: "Bar", admin: "Admin", support: "Support" };

const STATUSES: readonly WorkforceRequestStatus[] = ["submitted", "under-review", "in-recruitment", "candidates-submitted", "closed"];
type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");
/** A server timestamp as the viewer's own calendar day (what the screens compare and show). */
const localDay = (v: unknown) => {
  const t = typeof v === "string" ? Date.parse(v) : NaN;
  return Number.isNaN(t) ? "" : toISODate(new Date(t));
};

/** One server item -> the Client's WorkforceRequest; null when malformed. */
export function toWorkforceRequest(raw: unknown): WorkforceRequest | null {
  const r = rec(raw);
  const status = r ? STATUSES.find((s) => s === r.status) : undefined;
  if (!r || !status || !str(r.id) || !str(r.outletId)) return null;
  return {
    id: str(r.id), publicId: str(r.reference), outletId: str(r.outletId), role: str(r.role), departmentId: department(str(r.department)),
    count: Number(r.count) || 0, resumptionDate: str(r.resumptionDate), reason: str(r.reason), notes: str(r.notes), status,
    submittedOn: localDay(r.submittedAt), updatedOn: localDay(r.updatedAt) || localDay(r.submittedAt), hasUpdate: r.hasUpdate === true,
    message: str(r.message) || null,
  };
}

/** The create body the server accepts (department as text, exactly the documented keys). */
export function requestBody(input: NewWorkforceRequest) {
  return {
    outletId: input.outletId, role: input.role.trim(), department: DEPT_LABEL[input.departmentId] ?? "", count: input.count,
    resumptionDate: input.resumptionDate, reason: input.reason, notes: input.notes.trim(),
  };
}

const MESSAGE: Record<string, string> = {
  invalid_request: "Check the details and try again.",
  agreement_required: "Accept the current Beeliv agreements first, then try again.",
  no_access: "You can't request staff for this outlet.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
};
const failed = (j: Rec | null, fallback: string) => new Error(MESSAGE[str(rec(j?.error)?.code)] ?? fallback);

const TTL_MS = 5_000;
let listCache: { at: number; p: Promise<{ items: WorkforceRequest[]; reasons: string[] }> } | null = null;

/** The user's requests (all their outlets) and the reason labels. Shared for a few seconds across the page's cards. */
export function liveRequests(): Promise<{ items: WorkforceRequest[]; reasons: string[] }> {
  if (listCache && Date.now() - listCache.at < TTL_MS) return listCache.p;
  const p = fetch("/api/client/requests", { credentials: "same-origin", cache: "no-store" }).then(async (res) => {
    const j = rec(await res.json().catch(() => null));
    if (j?.ok !== true || !Array.isArray(j.items)) throw failed(j, "Your requests could not be loaded. Please try again.");
    return {
      items: j.items.map(toWorkforceRequest).filter((x): x is WorkforceRequest => !!x),
      reasons: (Array.isArray(j.reasons) ? j.reasons : []).filter((x): x is string => typeof x === "string" && x.length > 0),
    };
  });
  const entry = { at: Date.now(), p };
  listCache = entry;
  p.catch(() => {
    if (listCache === entry) listCache = null; // a failed load can be retried
  });
  return p;
}
export function resetLiveRequests() {
  listCache = null;
}

export const scopedRequests = (items: WorkforceRequest[], scope: OutletScope) => (scope === "all" ? items : items.filter((r) => r.outletId === scope));

/** Sends the request; resolves with the new item as the server now lists it. */
export async function createLiveRequest(input: NewWorkforceRequest): Promise<WorkforceRequest> {
  const res = await fetch("/api/client/requests", {
    method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody(input)),
  });
  const j = rec(await res.json().catch(() => null));
  if (j?.ok !== true || !str(j.id)) throw failed(j, "We couldn't send your request. Please try again.");
  resetLiveRequests();
  const fresh = await liveRequests().catch(() => null);
  const found = fresh?.items.find((r) => r.id === j.id);
  if (found) return found;
  // Sent, but the list could not be read back: what the server confirmed plus what was sent.
  const today = toISODate(new Date());
  return { ...input, id: str(j.id), publicId: str(j.reference), status: "submitted", submittedOn: today, updatedOn: today, hasUpdate: false, message: null };
}

/** The user opened this request: clear its "Updated" mark on the server. Quiet: a failure only leaves the mark. */
export async function markLiveRequestSeen(id: string): Promise<void> {
  try {
    await fetch("/api/client/requests/seen", {
      method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id }),
    });
  } catch {
    // ignored: the mark stays until the next open
  }
  resetLiveRequests();
}

/* ------------------------------------------------------------ compliance ------------------------------------------------------------ */

const CLIENT_STATUS: Record<string, ComplianceState> = {
  verified: "complete",
  missing: "outstanding",
  // Uploaded and waiting for Beeliv's check: not complete yet, and nothing for the Client to do, so it counts as outstanding.
  "in-review": "outstanding",
  "needs-attention": "update-required",
};

/** Server rows (one per placed person) -> one ComplianceItem per ordinary document slot. memberId = the placement id. */
export function toComplianceItems(rows: unknown): ComplianceItem[] {
  return (Array.isArray(rows) ? rows : []).flatMap((raw): ComplianceItem[] => {
    const r = rec(raw);
    if (!r || !str(r.placementId) || !Array.isArray(r.items)) return [];
    return r.items.flatMap((x): ComplianceItem[] => {
      const i = rec(x);
      const state = i ? CLIENT_STATUS[str(i.status)] : undefined;
      if (!i || !state || !str(i.slot)) return [];
      return [{ id: `${str(r.placementId)}:${str(i.slot)}`, memberId: str(r.placementId), staffName: str(r.staffName), outletId: str(r.outletId), document: str(i.label), state, expiresOn: null }];
    });
  });
}

/** The same summary the Overview and Compliance use, from the same items (percent rounded DOWN). */
export function complianceSummary(items: ComplianceItem[]): ComplianceSummary {
  const n = (s: ComplianceState) => items.filter((i) => i.state === s).length;
  const complete = n("complete");
  return {
    total: items.length, complete, outstanding: n("outstanding"), updateRequired: n("update-required"), expiringSoon: n("expiring"),
    percentComplete: items.length ? Math.floor((complete / items.length) * 100) : 0, attention: items.filter((i) => i.state !== "complete"),
  };
}

let complianceCache: { at: number; p: Promise<ComplianceItem[]> } | null = null;
/** All compliance items the user may see. Shared for a few seconds (the summary and the list load together). */
export function liveCompliance(): Promise<ComplianceItem[]> {
  if (complianceCache && Date.now() - complianceCache.at < TTL_MS) return complianceCache.p;
  const p = fetch("/api/client/compliance", { credentials: "same-origin", cache: "no-store" }).then(async (res) => {
    const j = rec(await res.json().catch(() => null));
    if (j?.ok !== true || !Array.isArray(j.items)) throw new Error("Compliance could not be loaded. Please try again.");
    return toComplianceItems(j.items);
  });
  const entry = { at: Date.now(), p };
  complianceCache = entry;
  p.catch(() => {
    if (complianceCache === entry) complianceCache = null;
  });
  return p;
}
export function resetLiveCompliance() {
  complianceCache = null;
}
