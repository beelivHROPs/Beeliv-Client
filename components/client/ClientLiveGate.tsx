"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ComingSoonScreen } from "@/components/shared/ComingSoonScreen";
import { liveSoonFor } from "@/lib/client/live-routes";

/**
 * Live Client (lead rule 2026-11-21): real data or "Coming soon", never sample data.
 * Screens without a Beeliv backend yet (lib/client/live-routes.ts) show Coming soon to real client users.
 */
export function ClientLiveGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soon = liveSoonFor(pathname);
  return soon ? <ComingSoonScreen title={soon.title} /> : <>{children}</>;
}
