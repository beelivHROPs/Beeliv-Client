"use client";

import { useState, type ReactNode } from "react";
import { liveClientAdapter } from "@/lib/client/adapters/live";
import { setRealClientAdapter } from "@/lib/client/service";

/** Live Client: the approved screens read the REAL adapter (own outlets and placed staff; empty where no backend yet). */
export function ClientLiveBoot({ children }: { children: ReactNode }) {
  useState(() => {
    setRealClientAdapter(liveClientAdapter); // before any child screen loads data
    return true;
  });
  return <>{children}</>;
}
