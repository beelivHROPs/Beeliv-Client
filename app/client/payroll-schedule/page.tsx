import type { Metadata } from "next";
import { ComingSoonScreen } from "@/components/shared/ComingSoonScreen";

export const metadata: Metadata = { title: "Payroll Schedule" };

export default function ClientPayrollSchedulePage() {
  return (
    <ComingSoonScreen
      title="Payroll Schedule"
      description="Schedule visibility only — no payment data or processing, ever (Stage 2 build)."
    />
  );
}
