import { AppShell } from "@/components/layout/AppShell";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/nav-config";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      roleLabel={ROLE_LABELS.client}
      scopeLabel="Sample Outlet 1"
      navItems={NAV_ITEMS.client}
      userName="Sample Business Contact"
      navTone="slate"
    >
      {children}
    </AppShell>
  );
}
