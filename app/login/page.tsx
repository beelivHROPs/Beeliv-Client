import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/LoginForm";

export const metadata: Metadata = { title: "Log In" };

/**
 * Login — docs/architecture/ui-ux-framework.md §16, screen 07.
 *
 * PROPOSED direction (not yet Beeliv-approved): one unified login for all
 * five roles, with role-based routing after authentication. Structural only
 * — no real Supabase Auth is wired up in this implementation slice.
 *
 * The actual layout/interaction lives in components/shared/LoginForm.tsx
 * (a client component, for its email -> password step state) — this file
 * stays a server component so it can export `metadata`.
 */
export default function LoginPage() {
  return <LoginForm />;
}
