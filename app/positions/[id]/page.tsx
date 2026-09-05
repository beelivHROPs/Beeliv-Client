import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { SAMPLE_JOB_LISTINGS } from "@/lib/placeholder-data";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { buttonVariants } from "@/components/ui/button";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = SAMPLE_JOB_LISTINGS.find((j) => j.id === id);
  return { title: job ? job.title : "Position" };
}

/**
 * Job Details — docs/architecture/ui-ux-framework.md §16, screen 03.
 * Answers "what am I applying for?" before any account/personal data is
 * requested — the approved sequencing principle for this flow. Solid
 * surface (no glass) — that's reserved for screen 01 only.
 */
export default async function JobDetailsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const job = SAMPLE_JOB_LISTINGS.find((j) => j.id === id);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader backHref="/positions" backLabel="Back to Open Positions" />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="animate-fade-up">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {job.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {job.location}
          </p>

          <section className="mt-8">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              About This Position
            </h2>
            <p className="mt-2 text-sm text-foreground">{job.description}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Requirements
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <Link href={`/apply/${job.id}`} className={buttonVariants({ size: "lg" })}>
              Apply Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
