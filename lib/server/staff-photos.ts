import "server-only";
import { adminClient, sessionClient } from "./auth/session";
import { AuthFailure } from "./auth/service";
import { limitAuth } from "./auth/rate";

/**
 * Staff profile pictures (docs/contracts/staff-photos.sql): a staff member's picture is their Passport photograph
 * document. staff_photo_list returns, for the people the viewer may already see, where the clean copy is stored; this
 * file signs short-lived read links for those keys. Only the link, the person id, the staff reference and the current
 * placement ids leave the server (never the object key, version id or anything from the service-role client).
 * Any failure of the feature itself (function not installed yet, storage error, bad data) returns an EMPTY list,
 * so the screens simply keep showing initials.
 */
export type StaffPhoto = { personId: string; staffReference: string; placementIds: string[]; url: string };

const BUCKET = "staff-document-clean";
const KEY = /^[0-9a-f-]{36}\/source\.(jpg|jpeg|png)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGN_SECONDS = 3600;
const MAX = 500;
type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Calls the read-only function and signs the photos. Never throws: a failure is an empty list. */
export async function signStaffPhotos(app: "admin" | "client", uid: string, sessionId: string): Promise<StaffPhoto[]> {
  try {
    const server = adminClient(app);
    const { data, error } = await server.rpc("staff_photo_list", { p_actor_uid: uid, p_session_id: sessionId, p_app: app });
    const d = rec(data);
    if (error || d?.ok !== true || !Array.isArray(d.items)) return [];
    const items = d.items.slice(0, MAX).flatMap((raw) => {
      const r = rec(raw);
      const personId = str(r?.personId), objectKey = str(r?.objectKey);
      if (!r || !UUID.test(personId) || !KEY.test(objectKey)) return [];
      const placementIds = (Array.isArray(r.placementIds) ? r.placementIds : []).map(str).filter((x) => UUID.test(x)).map((x) => x.toLowerCase());
      return [{ personId: personId.toLowerCase(), staffReference: str(r.staffReference).slice(0, 40), placementIds, objectKey }];
    });
    if (!items.length) return [];
    const signed = await server.storage.from(BUCKET).createSignedUrls([...new Set(items.map((i) => i.objectKey))], SIGN_SECONDS);
    if (signed.error || !Array.isArray(signed.data)) return [];
    const urlOf = new Map<string, string>();
    for (const s of signed.data) if (!s.error && typeof s.path === "string" && typeof s.signedUrl === "string" && /^https:\/\//.test(s.signedUrl)) urlOf.set(s.path, s.signedUrl);
    return items.flatMap(({ objectKey, ...rest }) => {
      const url = urlOf.get(objectKey);
      return url ? [{ ...rest, url }] : [];
    });
  } catch {
    return [];
  }
}

/** Admin: same identity proof as the other Admin reads (confirmed email, matching claims, AAL2), then the photo list. */
export async function adminStaffPhotos(): Promise<StaffPhoto[]> {
  const client = await sessionClient("admin");
  const { data: identity, error: identityError } = await client.auth.getUser();
  const { data: proof, error: proofError } = await client.auth.getClaims();
  const user = identity.user, claims = proof?.claims;
  if (identityError || proofError || !user?.email_confirmed_at || claims?.sub !== user.id || typeof claims.session_id !== "string" || !UUID.test(claims.session_id)) throw new AuthFailure("unauthenticated", 401);
  if (claims.aal !== "aal2") throw new AuthFailure("mfa_required", 403);
  await limitAuth("admin", "org_read", `photos:${user.id}`);
  return signStaffPhotos("admin", user.id, claims.session_id as string);
}
