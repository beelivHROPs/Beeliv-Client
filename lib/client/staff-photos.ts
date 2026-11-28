"use client";

/**
 * Staff profile pictures in the Client app (POST /api/client/staff-photos): only VERIFIED Passport photographs of the
 * staff placed at the user's outlets (the database decides). LIVE only (ClientLiveBoot); preview screens never fetch.
 * Rows that carry only a name (Attendance, Home) are matched to the user's own staff list by name, and only when exactly
 * one placed person has that name, the same rule the live adapter uses to link a shift to a staff page.
 */
import { createPhotoStore, fetchPhotoIndex, nameKey, usePhotoLookup, type PhotoLookup } from "../shared/staff-photos";
import { useClientLive } from "@/components/client/ClientLiveBoot";
import { getWorkforce } from "./service";

const store = createPhotoStore(async () => {
  const [index, workforce] = await Promise.all([fetchPhotoIndex("/api/client/staff-photos"), getWorkforce("all").catch(() => [])]);
  for (const m of workforce) {
    const key = nameKey(m.name || "");
    if (key) index.byName.set(key, index.byName.has(key) ? null : m.id.toLowerCase());
  }
  return index;
});

/** photoFor({ placementId?, name? }) -> signed link or null. `wanted` = false never fetches. */
export function useClientStaffPhotos(wanted = true): PhotoLookup {
  const live = useClientLive();
  return usePhotoLookup(store, wanted && live);
}
