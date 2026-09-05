import type { Metadata } from "next";
import { ComingSoonScreen } from "@/components/shared/ComingSoonScreen";

export const metadata: Metadata = { title: "Attendance" };

export default function ClientAttendancePage() {
  return (
    <ComingSoonScreen
      title="Attendance"
      description="Read-only attendance/lateness overview (Stage 2 build)."
    />
  );
}
