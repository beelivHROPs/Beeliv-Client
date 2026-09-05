import { Skeleton } from "@/components/shared/Skeleton";
import { AuthPageShell } from "@/components/shared/AuthPageShell";

/** Mirrors app/apply/[id]/page.tsx's mobile/desktop split — see that file's
 *  own comment for why the two layouts differ. */
export default function Loading() {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-background sm:hidden">
        <div className="bg-auth-glow rounded-b-4xl px-4 pt-12 pb-28">
          <div className="flex justify-center">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/40" />
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-8 w-full max-w-sm flex-1 px-4 pb-10">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lg">
            <Skeleton className="h-5 w-48 max-w-full" />
            <Skeleton className="mt-2 h-3 w-64 max-w-full" />
            <div className="mt-6 space-y-4">
              {["Full Name", "Email Address", "Phone Number", "Password", "Confirm Password"].map((label) => (
                <div key={label}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1.5 h-11 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-13 w-full rounded-xl" />
            </div>
            <Skeleton className="mx-auto mt-4 h-3 w-40" />
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <AuthPageShell>
          <div className="flex flex-col items-center">
            <Skeleton inverse className="h-5 w-48 max-w-full" />
            <Skeleton inverse className="mt-2 h-3 w-64 max-w-full" />
          </div>

          <div className="mt-6 space-y-4">
            {["Full Name", "Email Address", "Phone Number", "Password", "Confirm Password"].map((label) => (
              <div key={label}>
                <Skeleton inverse className="h-3 w-24" />
                <Skeleton className="mt-1.5 h-11 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-13 w-full rounded-xl" />
          </div>

          <div className="mt-4 flex justify-center">
            <Skeleton inverse className="h-3 w-40" />
          </div>
        </AuthPageShell>
      </div>
    </>
  );
}
