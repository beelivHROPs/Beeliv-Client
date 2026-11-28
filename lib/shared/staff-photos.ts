/**
 * Browser side of staff profile pictures (POST /api/admin/staff-photos, POST /api/client/staff-photos;
 * docs/contracts/staff-photos.sql). One request per app per page session, kept in a module-level store and refreshed
 * about every 50 minutes (the signed links last 60). Anything that goes wrong is an empty index: avatars keep their
 * initials. Only the LIVE apps turn this on; mock/prototype screens never call it.
 * Only relative imports so it can be unit-tested offline.
 */
import { useCallback, useSyncExternalStore } from "react";

export type PhotoIndex = {
  byPerson: Map<string, string>;
  byReference: Map<string, string>;
  byPlacement: Map<string, string>;
  /** Lower-cased name -> placement id, only when exactly one person has that name (null = more than one). */
  byName: Map<string, string | null>;
};
export type PhotoKeys = { personId?: string | null; reference?: string | null; placementId?: string | null; name?: string | null };
export type PhotoLookup = (keys: PhotoKeys) => string | null;

const REFRESH_MS = 50 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");
export const nameKey = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export const emptyIndex = (): PhotoIndex => ({ byPerson: new Map(), byReference: new Map(), byPlacement: new Map(), byName: new Map() });

/** Reads the server's { ok, photos } answer; only https links are kept. */
export async function fetchPhotoIndex(endpoint: string): Promise<PhotoIndex> {
  const index = emptyIndex();
  try {
    const res = await fetch(endpoint, { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: "{}" });
    const j = rec(await res.json().catch(() => null));
    if (j?.ok !== true || !Array.isArray(j.photos)) return index;
    for (const raw of j.photos) {
      const p = rec(raw);
      const url = str(p?.url);
      if (!p || !/^https:\/\//.test(url)) continue;
      const personId = str(p.personId).toLowerCase();
      if (UUID.test(personId)) index.byPerson.set(personId, url);
      const reference = str(p.staffReference).trim().toUpperCase();
      if (reference) index.byReference.set(reference, url);
      for (const id of Array.isArray(p.placementIds) ? p.placementIds : []) if (UUID.test(str(id))) index.byPlacement.set(str(id).toLowerCase(), url);
    }
  } catch {
    /* empty index: initials stay */
  }
  return index;
}

/** A module-level store around one loader: loads on first use, then again about every 50 minutes while in use. */
export function createPhotoStore(load: () => Promise<PhotoIndex>) {
  let index: PhotoIndex | null = null;
  let loadedAt = 0;
  let pending: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function refresh() {
    if (pending) return;
    pending = load().catch(() => emptyIndex()).then((next) => {
      index = next;
      loadedAt = Date.now();
      pending = null;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        if (listeners.size) refresh(); // nobody looking: the next screen that subscribes refreshes it
      }, REFRESH_MS);
      for (const l of listeners) l();
    });
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!index || Date.now() - loadedAt > REFRESH_MS) refresh();
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: (): PhotoIndex | null => index,
  };
}

const off = () => () => {};
const none = (): PhotoIndex | null => null;

/** The photo for a person by id, staff reference, placement id or (when unique) name; null = show initials. */
export function lookupIn(index: PhotoIndex | null, keys: PhotoKeys): string | null {
  if (!index) return null;
  const person = keys.personId ? index.byPerson.get(keys.personId.toLowerCase()) : undefined;
  if (person) return person;
  const placement = keys.placementId ? index.byPlacement.get(keys.placementId.toLowerCase()) : undefined;
  if (placement) return placement;
  const reference = keys.reference ? index.byReference.get(keys.reference.trim().toUpperCase()) : undefined;
  if (reference) return reference;
  const named = keys.name ? index.byName.get(nameKey(keys.name)) : undefined;
  return named ? (index.byPlacement.get(named) ?? null) : null;
}

/** React binding: subscribes only when `enabled`; otherwise it never fetches and always answers null. */
export function usePhotoLookup(store: ReturnType<typeof createPhotoStore>, enabled: boolean): PhotoLookup {
  const index = useSyncExternalStore(enabled ? store.subscribe : off, enabled ? store.getSnapshot : none, none);
  return useCallback((keys: PhotoKeys) => lookupIn(index, keys), [index]);
}
