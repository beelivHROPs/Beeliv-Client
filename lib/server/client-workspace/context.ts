import "server-only";
import { sessionClient, adminClient } from "../auth/session";
import { readAccess, hasAccess } from "../auth/policy";
import { limitAuth } from "../auth/rate";
import { parseShiftRange, projectClientShifts, type ClientShift } from "./shifts";
import { parseNewStaffRequest, parseRequestId, projectClientRequests, projectReasons, type ClientStaffRequest } from "./requests";
import { parseNewSupportMessage, projectClientSupport, type ClientSupportMessage } from "./support";
import { projectClientCompletion } from "../staff-documentation/project";
import type { ClientCompletionDto, ClientStatus } from "../staff-documentation/types";

export type ClientWorkspace = { name: string; scopes: { clientName: string; outletName: string | null }[]; truncated: boolean };

/** Verified Client actor (provider user + claims + active client access), or throws. Shared by every Client read. */
async function verifiedClientActor(bucket = "client-portal", action: "org_read" | "org_write" = "org_read") {
  if (process.env.CLIENT_WORKSPACE_SCHEMA_READY !== "true") throw new Error("client_workspace_unavailable");
  const client = await sessionClient("client", undefined, true);
  const [{ data: identity, error: identityError }, { data: proof, error: proofError }] = await Promise.all([client.auth.getUser(), client.auth.getClaims()]);
  const user = identity.user, claims = proof?.claims;
  if (identityError || proofError || !user?.email_confirmed_at || claims?.sub !== user.id || typeof claims.session_id !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(claims.session_id) || typeof claims.exp !== "number" || claims.exp <= Date.now() / 1000) throw new Error("client_workspace_unavailable");
  const access = await client.rpc("auth_access_context", { p_app: "client" });
  const context = readAccess(access.data, "client");
  if (access.error || !hasAccess(context) || context?.role !== "client") throw new Error("client_workspace_unavailable");
  await limitAuth("client", action, `${bucket}:${user.id}`);
  return { uid: user.id, email: user.email ?? "", sessionId: claims.session_id as string };
}

export type ClientPortalOutlet = { outletId: string; outletName: string; clientId: string; clientName: string; city: string };
export type ClientPortalMember = { placementId: string; clientId: string; clientName: string; outletId: string; outletName: string; name: string; role: string; department: string; startDate: string; status: string };
export type ClientPortalProfile = { phone: string; jobTitle: string; notifications: Record<string, boolean> };
export type ClientPortal = { fullName: string; email: string; outlets: ClientPortalOutlet[]; workforce: ClientPortalMember[]; workforceAvailable: boolean; profile: ClientPortalProfile | null };

const str = (v: unknown) => (typeof v === "string" ? v : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The signed-in client user's OWN details, outlets and currently placed staff (data-visibility-matrix: name, role,
 * department, outlet, start date, status only). Uses client_portal_workforce when installed; before that, outlets come
 * from the installed client_workspace_context and the workforce is reported unavailable (never sample).
 */
export async function readClientPortal(): Promise<ClientPortal> {
  const actor = await verifiedClientActor();
  const server = adminClient("client");
  const ws = await server.rpc("client_workspace_context", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  if (ws.error || ws.data?.ok !== true || typeof ws.data.fullName !== "string" || !Array.isArray(ws.data.scopes)) throw new Error("client_workspace_unavailable");
  const fullName: string = ws.data.fullName;
  // Own profile (client-portal-profile.sql); null before it is installed.
  const prof = await server.rpc("client_portal_profile", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  const profile: ClientPortalProfile | null = !prof.error && prof.data?.ok === true ? {
    phone: str(prof.data.phone), jobTitle: str(prof.data.jobTitle),
    notifications: Object.fromEntries(Object.entries((prof.data.notifications ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === "boolean")) as Record<string, boolean>,
  } : null;
  const portal = await server.rpc("client_portal_workforce", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  if (!portal.error && portal.data?.ok === true && Array.isArray(portal.data.outlets) && Array.isArray(portal.data.items)) {
    const outlets = (portal.data.outlets as Record<string, unknown>[]).filter((o) => UUID.test(str(o.outletId)) && UUID.test(str(o.clientId)))
      .map((o) => ({ outletId: str(o.outletId), outletName: str(o.outletName), clientId: str(o.clientId), clientName: str(o.clientName), city: str(o.city) }));
    const workforce = (portal.data.items as Record<string, unknown>[]).filter((m) => UUID.test(str(m.placementId)) && UUID.test(str(m.outletId)))
      .map((m) => ({ placementId: str(m.placementId), clientId: str(m.clientId), clientName: str(m.clientName), outletId: str(m.outletId), outletName: str(m.outletName), name: str(m.name), role: str(m.role), department: str(m.department), startDate: str(m.startDate), status: str(m.status) }));
    return { fullName: profile ? str(prof.data.fullName) || fullName : fullName, email: actor.email, outlets, workforce, workforceAvailable: true, profile };
  }
  // Not installed yet: outlets from the workspace scopes that name an outlet; whole-client scopes list none.
  const outlets = (ws.data.scopes as Record<string, unknown>[]).filter((x) => UUID.test(str(x.outletId)) && UUID.test(str(x.clientId)))
    .map((x) => ({ outletId: str(x.outletId), outletName: str(x.outletName), clientId: str(x.clientId), clientName: str(x.clientName), city: "" }));
  return { fullName, email: actor.email, outlets, workforce: [], workforceAvailable: false, profile };
}

export async function readClientWorkspace(): Promise<ClientWorkspace> {
  if (process.env.CLIENT_WORKSPACE_SCHEMA_READY !== "true") throw new Error("client_workspace_unavailable");
  const client = await sessionClient("client", undefined, true);
  const [{ data: identity, error: identityError }, { data: proof, error: proofError }] = await Promise.all([client.auth.getUser(), client.auth.getClaims()]);
  const user = identity.user, claims = proof?.claims;
  if (identityError || proofError || !user?.email_confirmed_at || claims?.sub !== user.id || typeof claims.session_id !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(claims.session_id) || typeof claims.exp !== "number" || claims.exp <= Date.now() / 1000) throw new Error("client_workspace_unavailable");
  const access = await client.rpc("auth_access_context", { p_app: "client" });
  const context = readAccess(access.data, "client");
  if (access.error || !hasAccess(context) || context?.role !== "client") throw new Error("client_workspace_unavailable");
  await limitAuth("client", "org_read", `client-portal:${user.id}`);
  const { data, error } = await adminClient("client").rpc("client_workspace_context", { p_actor_uid: user.id, p_session_id: claims.session_id });
  if (error || data?.ok !== true || typeof data.fullName !== "string" || !Array.isArray(data.scopes) || data.scopes.length > 100 || typeof data.truncated !== "boolean") throw new Error("client_workspace_unavailable");
  const scopes = data.scopes.map((item: { clientName?: unknown; outletName?: unknown }) => {
    if (typeof item.clientName !== "string" || !(item.outletName === null || typeof item.outletName === "string")) throw new Error("client_workspace_unavailable");
    return { clientName: item.clientName, outletName: item.outletName };
  });
  return { name: data.fullName, scopes, truncated: data.truncated };
}

/** Save the signed-in client user's OWN profile / preferences. Throws "phone_in_use" / "invalid_request" / "unavailable". */
export async function saveClientProfile(input: { fullName?: string; phone?: string; jobTitle?: string; notifications?: Record<string, boolean> }) {
  const actor = await verifiedClientActor();
  const { data, error } = await adminClient("client").rpc("client_portal_profile_save", {
    p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_full_name: input.fullName ?? null, p_phone: input.phone ?? null,
    p_job_title: input.jobTitle ?? null, p_notifications: input.notifications ?? null,
  });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) throw new Error(typeof data?.reason === "string" ? data.reason : "unavailable");
}

/**
 * The signed-in client user's PUBLISHED shifts and check-ins at the outlets they may see, for a window of at most 62 days
 * (day1-assignment-client-shifts.sql: staff name, role, section, times and a status only). The range is checked before any
 * sign-in work. Own rate-limit key, so browsing Attendance / Schedules never uses up the portal reads.
 * Throws "invalid_request" | "client_workspace_unavailable" | "agreement_required" | "no_access" | "unavailable".
 */
export async function readClientShifts(input: unknown): Promise<ClientShift[]> {
  const range = parseShiftRange(input);
  if (!range) throw new Error("invalid_request");
  const actor = await verifiedClientActor("client-shifts");
  const { data, error } = await adminClient("client").rpc("client_portal_shifts", { p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_from: range.from, p_to: range.to });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) {
    const reason = typeof data?.reason === "string" ? data.reason : "";
    throw new Error(["invalid_request", "agreement_required", "no_access"].includes(reason) ? reason : "unavailable");
  }
  return projectClientShifts(data.items);
}

/* ------------------------------------ Staff requests (day2-warnings-requests.sql, part B) ------------------------------------ */

const REQUEST_REASONS = ["invalid_request", "agreement_required", "no_access"];
function requestRefusal(data: { reason?: unknown } | null | undefined): never {
  const reason = typeof data?.reason === "string" ? data.reason : "";
  throw new Error(REQUEST_REASONS.includes(reason) ? reason : "unavailable");
}

/** The signed-in client user's staff requests at the outlets they may see, and the reason labels for the form. */
export async function readClientRequests(): Promise<{ items: ClientStaffRequest[]; reasons: string[] }> {
  const actor = await verifiedClientActor("client-requests");
  const { data, error } = await adminClient("client").rpc("client_staff_request_list", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) requestRefusal(data);
  return { items: projectClientRequests(data.items), reasons: projectReasons(data.reasons) };
}

/** Sends a new staff request to Beeliv HR. The input is checked before any sign-in work. Returns the id and reference. */
export async function createClientRequest(input: unknown): Promise<{ id: string; reference: string }> {
  const r = parseNewStaffRequest(input);
  if (!r) throw new Error("invalid_request");
  const actor = await verifiedClientActor("client-requests");
  const { data, error } = await adminClient("client").rpc("client_staff_request_create", {
    p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_outlet_id: r.outletId, p_role: r.role, p_department: r.department,
    p_count: r.count, p_resumption_date: r.resumptionDate, p_reason: r.reason, p_notes: r.notes,
  });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) requestRefusal(data);
  if (typeof data.id !== "string" || !UUID.test(data.id) || typeof data.reference !== "string") throw new Error("unavailable");
  return { id: data.id, reference: data.reference.slice(0, 40) };
}

/** Marks one of the user's requests as seen (clears its "Updated" mark). Out-of-scope ids change nothing. */
export async function markClientRequestSeen(input: unknown): Promise<void> {
  const requestId = parseRequestId(input);
  if (!requestId) throw new Error("invalid_request");
  const actor = await verifiedClientActor("client-requests");
  const { data, error } = await adminClient("client").rpc("client_staff_request_seen", { p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_request_id: requestId });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) requestRefusal(data);
}

/* ------------------------------------ Support messages (client-support-messages.sql) ------------------------------------ */

/** The signed-in client user's Support messages (and Beeliv's replies). Opening the list counts as seeing the replies. */
export async function readClientSupport(): Promise<ClientSupportMessage[]> {
  const actor = await verifiedClientActor("support", "org_read");
  const { data, error } = await adminClient("client").rpc("client_support_list", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) requestRefusal(data);
  return projectClientSupport(data.items);
}

/** Sends a Support message to Beeliv HR. The input is checked before any sign-in work. Returns the id and reference. */
export async function createClientSupport(input: unknown): Promise<{ id: string; reference: string }> {
  const m = parseNewSupportMessage(input);
  if (!m) throw new Error("invalid_request");
  const actor = await verifiedClientActor("support", "org_write");
  const { data, error } = await adminClient("client").rpc("client_support_create", {
    p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_topic: m.topic, p_message: m.message, p_outlet_id: m.outletId,
  });
  if (error) throw new Error("unavailable");
  if (data?.ok !== true) requestRefusal(data);
  if (typeof data.id !== "string" || !UUID.test(data.id) || typeof data.reference !== "string") throw new Error("unavailable");
  return { id: data.id, reference: data.reference.slice(0, 40) };
}

/* ------------------------------------ Compliance (staff_doc_completion, client audience) ------------------------------------ */

export type ClientComplianceRow = { placementId: string; outletId: string; staffName: string; items: { slot: string; label: string; status: ClientStatus }[] };

/**
 * Document STATUS (missing / in review / verified / needs attention) of the ORDINARY slots for the staff currently placed
 * at the user's outlets. Person ids never come from (or go to) the browser: the server reads the user's own placed staff
 * (client_portal_workforce), looks up those placements' people itself, and asks staff_doc_completion (client audience),
 * which re-checks the session and that each person is currently placed in the user's scope. No file, reason or sensitive
 * slot is ever returned (projectClientCompletion refuses a sensitive slot outright).
 */
export async function readClientCompliance(): Promise<ClientComplianceRow[]> {
  // Read-only document STATUS (no files, no storage): it only needs the database function, which is live, so it no
  // longer depends on the STAFF_DOCUMENTATION_* upload/storage switches (lead 2026-11-25: Compliance kept failing on Client).
  const actor = await verifiedClientActor("client-compliance");
  const server = adminClient("client");
  const portal = await server.rpc("client_portal_workforce", { p_actor_uid: actor.uid, p_session_id: actor.sessionId });
  if (portal.error) throw new Error("unavailable");
  if (portal.data?.ok !== true || !Array.isArray(portal.data.items)) requestRefusal(portal.data);
  const members = (portal.data.items as Record<string, unknown>[]).filter((m) => UUID.test(str(m.placementId)) && UUID.test(str(m.outletId))).slice(0, 1000);
  if (!members.length) return [];
  const { data: placements, error } = await server.from("org_staff_placements").select("id, person_id").in("id", members.map((m) => str(m.placementId))).is("end_date", null);
  if (error || !Array.isArray(placements)) throw new Error("unavailable");
  const personOf = new Map<string, string>();
  for (const p of placements as { id?: unknown; person_id?: unknown }[]) if (UUID.test(str(p.id)) && UUID.test(str(p.person_id))) personOf.set(str(p.id).toLowerCase(), str(p.person_id).toLowerCase());
  const people = [...new Set(personOf.values())];
  const byPerson = new Map<string, ClientCompletionDto["people"][number]>();
  for (let i = 0; i < people.length; i += 50) {
    const { data, error: rpcError } = await server.rpc("staff_doc_completion", { p_actor_uid: actor.uid, p_session_id: actor.sessionId, p_audience: "client", p_person_ids: people.slice(i, i + 50) });
    if (rpcError) throw new Error("unavailable");
    if (data?.ok !== true) requestRefusal(data);
    const projected = projectClientCompletion(data);
    if (!projected) throw new Error("unavailable");
    for (const p of projected.people) byPerson.set(p.personId, p);
  }
  return members.flatMap((m) => {
    const person = personOf.get(str(m.placementId).toLowerCase());
    const done = person ? byPerson.get(person) : undefined;
    return done ? [{ placementId: str(m.placementId), outletId: str(m.outletId), staffName: str(m.name), items: done.items.map((x) => ({ slot: x.slot, label: x.label, status: x.status })) }] : [];
  });
}
