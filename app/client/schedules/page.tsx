import type { Metadata } from "next";
import { ComingSoonScreen } from "@/components/shared/ComingSoonScreen";

export const metadata: Metadata = { title: "Schedules" };

export default function ClientSchedulesPage() {
  return (
    <ComingSoonScreen
      title="Schedules"
      description="Read-only staff schedule visibility (Stage 2 build)."
    />
  );
}
