import { ClientLiveBoot } from "@/components/client/ClientLiveBoot";
import { authMode } from "@/lib/auth/mode";
import { sampleDataOn } from "@/lib/env/sample-data";
import { ClientShell } from "@/components/client/ClientShell";
import { AreaNotOpen } from "@/components/shared/AreaGate";
import { PilotMenuProvider } from "@/lib/pilot/context";
import { pilotMenuState } from "@/lib/pilot/server";
import { areaOpen, publicSiteUrl } from "@/lib/env/sample-data";

export const dynamic = "force-dynamic";

// Everything in Client except sign-in, invitation, reset and setup (outside this group, never gated; URLs unchanged).
// A closed area returns the not-open page WITHOUT rendering {children}.
export default async function ClientBusinessLayout({ children }: LayoutProps<"/">) {
  if (!areaOpen("client")) return <AreaNotOpen siteUrl={publicSiteUrl()} />;
  // Live: the APPROVED Client app on real data only (lib/client/adapters/live.ts). Sample screens only in preview.
  if (authMode() === "live" || !sampleDataOn()) {
    const pilot = await pilotMenuState();
    return (
      <PilotMenuProvider on={pilot.on} devSwitch={pilot.devSwitch}>
        <ClientLiveBoot>
          <ClientShell>{children}</ClientShell>
        </ClientLiveBoot>
      </PilotMenuProvider>
    );
  }
  const pilot = await pilotMenuState();
  return (
    <PilotMenuProvider on={pilot.on} devSwitch={pilot.devSwitch}>
      <ClientShell>{children}</ClientShell>
    </PilotMenuProvider>
  );
}
