"use client";

import { useState } from "react";
import { initials } from "@/lib/client/format";

/**
 * Client-app avatar: a photo when the backend supplies one, otherwise the
 * person's initials on a soft plum tile. Decorative (the name is always
 * written next to it).
 */
export function ClientAvatar({ name, photoUrl, size = 38, className = "" }: { name: string; photoUrl?: string | null; size?: number; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (photoUrl && photoUrl !== failed) {
    return (
      <span aria-hidden="true" className={`inline-flex shrink-0 overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed storage links; the image optimiser would cache them past expiry */}
        <img src={photoUrl} alt={name} width={size} height={size} referrerPolicy="no-referrer" onError={() => setFailed(photoUrl)} className="size-full rounded-full object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-(--ap-tint-2) font-bold text-(--ap-violet) ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
    >
      {initials(name)}
    </span>
  );
}
