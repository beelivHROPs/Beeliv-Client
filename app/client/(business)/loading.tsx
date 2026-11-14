// Dashboard skeleton for the Client business pages only. Lives inside (business) so it never flashes over
// sign-in, invitation, recovery, setup or account-state pages (lead report 2026-11-14).
import { OverviewSkeleton } from "@/components/client/overview/OverviewStates";

export default function Loading() {
  return <OverviewSkeleton />;
}
