"use client";

/**
 * One attendance record, opened from any row on the Attendance page. Side panel on desktop,
 * bottom sheet on phones (same pattern as Admin's assignment details). Read-only: Beeliv HR
 * owns corrections; the Client sees what was recorded and can jump to the staff profile.
 */
import Link from "next/link";
import { useEffect } from "react";
import { X } from "@/components/applicant/icons";
import { staffHref } from "@/lib/client/links";
import { formatClock, fullDay } from "@/lib/client/format";
import { DEPARTMENT_LABEL, SHIFTS } from "@/lib/client/labels";
import type { AttendanceRecord } from "@/lib/client/types";
import { PersonPhoto } from "../PersonPhoto";
import { AttendanceChip } from "../StatusChip";

const NOTE: Record<AttendanceRecord["status"], string> = {
  present: "Clocked in on time for this shift.",
  late: "Clocked in after the shift start time.",
  absent: "No check-in was recorded for this shift.",
  "on-leave": "On approved leave for this day.",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-(--ap-line-2) py-3 first:border-t-0">
      <span className="text-[13px] font-semibold text-(--ap-muted)">{label}</span>
      <span className="text-right text-[15px] font-semibold text-(--ap-ink)">{children}</span>
    </div>
  );
}

export function AttendanceDetailSheet({ r, outletName, onClose }: { r: AttendanceRecord; outletName: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Attendance for ${r.staffName}`}>
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-y-0 right-0 flex w-[min(400px,100vw)] flex-col bg-(--ap-surface) text-(--ap-ink) shadow-2xl max-[767px]:inset-x-0 max-[767px]:top-auto max-[767px]:max-h-[85dvh] max-[767px]:w-full max-[767px]:rounded-t-[22px] max-[767px]:pb-[env(safe-area-inset-bottom,0px)]">
        <span className="mx-auto mt-2 hidden h-1 w-10 rounded-full bg-(--ap-line) max-[767px]:block" aria-hidden="true" />
        <div className="flex items-center justify-between border-b border-(--ap-line) px-5 py-3">
          <h2 className="m-0 text-[17px] font-extrabold">Attendance details</h2>
          <button type="button" autoFocus onClick={onClose} className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-(--ap-line-2)" aria-label="Close details">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3.5">
            <PersonPhoto name={r.staffName} placementId={r.memberId} size={56} />
            <div className="min-w-0 leading-tight">
              <b className="block truncate text-[18px]">{r.staffName}</b>
              <span className="mt-0.5 block truncate text-[14px] text-(--ap-muted)">{r.role}</span>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-(--ap-tint-soft) p-4">
            <AttendanceChip status={r.status} />
            <p className="mt-2 text-[14px] text-(--ap-ink-2)">{NOTE[r.status]}</p>
          </div>
          <div className="mt-4">
            <Field label="Date">{fullDay(r.date)}</Field>
            <Field label="Shift">{SHIFTS[r.shift]?.label ?? "—"}</Field>
            <Field label="Clock-in">{r.clockIn ? formatClock(r.clockIn) : "Not recorded"}</Field>
            <Field label="Department">{DEPARTMENT_LABEL[r.departmentId] ?? "—"}</Field>
            {outletName ? <Field label="Outlet">{outletName}</Field> : null}
          </div>
          <p className="mt-4 text-[13px] text-(--ap-muted)">Something not right? Contact Beeliv from Support and we&apos;ll correct it.</p>
        </div>
        <div className="border-t border-(--ap-line) px-5 py-3">
          <Link href={staffHref(r.memberId)} className="ap-btn ap-btn-p w-full justify-center">
            View staff profile
          </Link>
        </div>
      </div>
    </div>
  );
}
