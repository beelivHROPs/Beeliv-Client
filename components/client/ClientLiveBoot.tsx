"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { liveClientAdapter } from "@/lib/client/adapters/live";
import { liveSoonFor } from "@/lib/client/live-routes";
import { setRealClientAdapter } from "@/lib/client/service";

/** True inside the LIVE Client (real signed-in client user). Default false: sample/preview screens behave as before. */
const ClientLiveContext = createContext(false);

/** Live Client: the approved screens read the REAL adapter (own outlets and placed staff; empty where no backend yet). */
export function ClientLiveBoot({ children }: { children: ReactNode }) {
  useState(() => {
    setRealClientAdapter(liveClientAdapter); // before any child screen loads data
    return true;
  });
  return <ClientLiveContext.Provider value={true}>{children}</ClientLiveContext.Provider>;
}

/** True when the screen is showing a real client user's data (never sample data). */
export function useClientLive(): boolean {
  return useContext(ClientLiveContext);
}

/**
 * Live only: true when this href's figures have no backend yet (its screen shows Coming soon), so Home must not show
 * them as a real number (no fake "0 present" or "0 open positions"). Always false outside live.
 */
export function useLiveNoData(): (hrefOrPath: string) => boolean {
  const live = useClientLive();
  return useCallback((h: string) => live && liveSoonFor(h) !== undefined, [live]);
}
