"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, Mail, MessageSquareText, Phone } from "@/components/applicant/icons";
import { Field, Pick } from "@/components/applicant/apply/parts";
import { invalidAttrs, useFlagInvalid } from "@/components/applicant/form-feedback";
import { PageHeading } from "@/components/applicant/primitives";
import { toast } from "@/components/ui/toast";
import { PilotLink } from "@/components/shared/PilotLink";
import { useClientSession } from "@/lib/client/hooks";
import { NEW_REQUEST_HREF } from "@/lib/client/links";
import { useOutletState } from "@/lib/client/outlet";
import { dayMonth, plural, timeAgo, toISODate } from "@/lib/client/format";
import { liveSupportMessages, sendLiveSupportMessage, type SupportMessage, type SupportStatus } from "@/lib/client/support-live";
import { errorMessage } from "@/lib/shared/error-messages";
import { AnalyticsPanel, ChartEmptyState, ChartErrorState, ChartSkeleton } from "../charts";
import { ClientAvatar } from "../ClientAvatar";
import { useClientLive } from "../ClientLiveBoot";
import { StatusChip, type ChipTone } from "../StatusChip";

/** Support reasons from the brief (section 30): the exact topics client_support_create accepts (client-support-messages.sql). */
const REASONS = ["Staffing request", "Recruitment question", "Staff concern", "Document / compliance issue", "Schedule issue", "Access change request", "Report a problem", "Other"] as const;
type Reason = (typeof REASONS)[number];

const MIN = 10;
const MAX = 1000;

/**
 * Client Support (brief section 30): personal to Beeliv, not a generic FAQ.
 * "Your Beeliv team" shows the assigned contact; channels appear ONLY when
 * Beeliv has approved them (currently null in the fixture), so nothing is
 * invented. In the LIVE Client the form really sends the message to Beeliv HR
 * (POST /api/client/support/create, docs/contracts/client-support-messages.sql)
 * and "Your messages" lists what was sent with Beeliv's replies. In sample mode
 * submitting only shows a confirmation toast and nothing is sent.
 */
export function SupportBody({ initialReason }: { initialReason?: string }) {
  const preset = (REASONS as readonly string[]).includes(initialReason ?? "") ? (initialReason as Reason) : "";
  const live = useClientLive();
  // Bumped after a live send so "Your messages" reloads and shows the new message.
  const [sent, setSent] = useState(0);
  return (
    <div>
      <PageHeading title="Support" subtitle="Reach your Beeliv team, or find a quick answer." />
      <div className="grid grid-cols-1 items-start gap-4 min-[1101px]:grid-cols-[minmax(0,1fr)_400px] min-[1101px]:gap-5">
        <div className="order-2 flex min-w-0 flex-col gap-4 min-[1101px]:order-1 min-[1101px]:gap-5">
          <ContactForm initialReason={preset} live={live} onSent={() => setSent((n) => n + 1)} />
          {live ? <YourMessages reload={sent} /> : null}
          <Faq />
        </div>
        <div className="order-1 min-w-0 min-[1101px]:order-2">
          <TeamCard reason="" />
        </div>
      </div>
    </div>
  );
}

function TeamCard({ reason }: { reason: Reason | "" }) {
  const { data, status, retry } = useClientSession();
  const team = data?.team;
  const live = useClientLive();
  const subject = reason ? `?subject=${encodeURIComponent(reason)}` : "";
  return (
    <AnalyticsPanel title="Your Beeliv team" subtitle="Your main contact at Beeliv">
      {status === "loading" ? <ChartSkeleton height={150} label="Loading your Beeliv team" /> : null}
      {status === "error" || status === "restricted" ? <ChartErrorState retry={retry} height={150} title="We couldn't load your team" /> : null}
      {status === "ready" && team ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5">
            <ClientAvatar name={team.name} size={56} />
            <div className="min-w-0 leading-tight">
              <b className="block truncate text-[18px] text-(--ap-ink)">{team.name}</b>
              <span className="block text-[14px] text-(--ap-muted)">{team.role}, Beeliv Hospitality</span>
            </div>
          </div>
          {team.phone || team.email ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {team.phone ? (
                <li>
                  <a href={`tel:${team.phone.replace(/\s/g, "")}`} className="ap-btn ap-btn-s w-full justify-start">
                    <Phone className="size-4" aria-hidden="true" /> {team.phone}
                  </a>
                </li>
              ) : null}
              {team.email ? (
                <li>
                  <a href={`mailto:${team.email}${subject}`} className="ap-btn ap-btn-s w-full justify-start wrap-anywhere">
                    <Mail className="size-4 shrink-0" aria-hidden="true" /> {team.email}
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="rounded-xl bg-(--ap-tint-soft) px-3.5 py-3 text-[14px] leading-snug text-(--ap-ink-2)">Contact details are shared by Beeliv. Use the form to reach your team in the meantime.</p>
          )}
          {/* Live: Workforce Requests is still Coming soon, so email is the way to ask for staff. */}
          {live ? null : (
            <p className="border-t border-(--ap-line-2) pt-3 text-[13px] text-(--ap-muted)">
              Need more people?{" "}
              <Link href={NEW_REQUEST_HREF} className="font-bold text-(--ap-violet)">
                Request staff
              </Link>{" "}
              instead of messaging.
            </p>
          )}
        </div>
      ) : null}
    </AnalyticsPanel>
  );
}

function ContactForm({ initialReason, live, onSent }: { initialReason: Reason | ""; live: boolean; onSent: () => void }) {
  const ref = useRef<HTMLFormElement>(null);
  const outlet = useOutletState();
  const [busy, setBusy] = useState(false);
  const flag = useFlagInvalid(ref);
  const [reason, setReason] = useState<Reason | "">(initialReason);
  const [message, setMessage] = useState("");
  const [tried, setTried] = useState(false);
  const msgId = useId();

  const reasonErr = tried && !reason ? "Choose what this is about." : undefined;
  const trimmed = message.trim();
  const msgErr = tried && trimmed.length === 0 ? "Write a short message." : tried && trimmed.length < MIN ? `Add a little more detail (at least ${MIN} characters).` : undefined;

  function reset() {
    setReason("");
    setMessage("");
    setTried(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setTried(true);
    if (!reason || trimmed.length < MIN) {
      flag();
      return;
    }
    if (!live) {
      // Sample mode: nothing is sent. The wording says so.
      toast.add({ title: "Message noted", description: "Messages reach the Beeliv team once Support is connected to the live system." });
      reset();
      return;
    }
    setBusy(true);
    try {
      // A single selected outlet is sent along; "All outlets" sends none (the server picks the client).
      const outletId = outlet.scope && outlet.scope !== "all" ? outlet.scope : null;
      const { reference } = await sendLiveSupportMessage({ topic: reason, message: trimmed, outletId });
      toast.add({ title: "Message sent to Beeliv", description: reference ? `Your reference is ${reference}. Replies appear under Your messages.` : "Replies appear under Your messages.", type: "success" });
      reset();
      onSent();
    } catch (err) {
      toast.add({ title: "We couldn't send your message", description: `${errorMessage(err, "Please try again.")} Your text is still here.`, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnalyticsPanel title="Contact Beeliv" subtitle="Tell us what it's about so the right person picks it up">
      <form ref={ref} onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="What is this about?" error={reasonErr}>
          <div role="group" aria-label="Reason for contacting Beeliv" className="flex flex-wrap gap-2" {...invalidAttrs(!!reasonErr)}>
            {REASONS.map((r) => (
              <Pick key={r} pressed={reason === r} onClick={() => setReason(r)}>
                {r}
              </Pick>
            ))}
          </div>
        </Field>
        <Field label="Message" htmlFor={msgId} error={msgErr}>
          <textarea
            id={msgId}
            rows={5}
            maxLength={MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Give us the details, such as the outlet, role or date involved."
            className="ap-input resize-y text-base"
            aria-invalid={msgErr ? true : undefined}
            aria-describedby={msgErr ? `${msgId}-err` : undefined}
          />
          <span className="text-right text-[12px] text-(--ap-faint) tabular-nums">
            {message.length} / {MAX}
          </span>
        </Field>
        <p className="text-[13px] text-(--ap-muted)">Please don&apos;t include passwords or bank details.</p>
        <button type="submit" disabled={busy} className="ap-btn ap-btn-p h-12 self-start text-white! disabled:opacity-60 max-[480px]:w-full">
          <MessageSquareText className="size-4" aria-hidden="true" /> {busy ? "Sending..." : "Send message"}
        </button>
      </form>
    </AnalyticsPanel>
  );
}

/* ------------------------------------------------------------ Your messages (live only) */

const SUPPORT_LABEL: Record<SupportStatus, string> = { open: "Open", answered: "Answered", closed: "Closed" };
const SUPPORT_TONE: Record<SupportStatus, ChipTone> = { open: "info", answered: "ok", closed: "mute" };
const day = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : dayMonth(toISODate(new Date(t)));
};

/** The user's Support messages and Beeliv's replies. Real data only: never sample. */
function YourMessages({ reload }: { reload: number }) {
  const [items, setItems] = useState<SupportMessage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    liveSupportMessages().then(
      (list) => {
        if (cancelled) return;
        setItems(list);
        setFailed(false);
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [reload, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setItems(null);
    setAttempt((a) => a + 1);
  }, []);

  return (
    <AnalyticsPanel title="Your messages" subtitle={items?.length ? plural(items.length, "message") : undefined}>
      {failed ? <ChartErrorState retry={retry} height={150} title="We couldn't load your messages" /> : null}
      {!failed && !items ? <ChartSkeleton height={150} label="Loading your messages" /> : null}
      {!failed && items && items.length === 0 ? (
        <ChartEmptyState icon={MessageSquareText} title="No messages yet" description="Messages you send to Beeliv, and their replies, appear here." height={150} />
      ) : null}
      {!failed && items && items.length > 0 ? (
        <ul className="m-0 flex list-none flex-col p-0 max-[767px]:gap-2.5">
          {items.map((m) => (
            <MessageItem key={m.id} m={m} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} />
          ))}
        </ul>
      ) : null}
    </AnalyticsPanel>
  );
}

function MessageItem({ m, open, onToggle }: { m: SupportMessage; open: boolean; onToggle: () => void }) {
  const id = useId();
  const newReply = m.hasUpdate && m.replies.length > 0;
  return (
    <li className="border-t border-(--ap-line-2) first:border-t-0 max-[767px]:rounded-[20px] max-[767px]:border max-[767px]:border-(--ap-line) max-[767px]:bg-(--ap-surface)">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="flex min-h-14 w-full items-center gap-3 py-2.5 text-left min-[768px]:hover:bg-(--ap-tint-soft) max-[767px]:p-3.5">
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] text-(--ap-ink)">{m.topic}</b>
          <span className="mt-0.5 block truncate text-[13px] text-(--ap-muted)">
            {m.reference ? `${m.reference} · ` : ""}Sent {day(m.sentAt)}
            {m.replies.length ? ` · ${plural(m.replies.length, "reply", "replies")}` : ""}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 min-[768px]:flex-row min-[768px]:items-center">
          {newReply ? <StatusChip tone="plum">New reply</StatusChip> : null}
          <StatusChip tone={SUPPORT_TONE[m.status]}>{SUPPORT_LABEL[m.status]}</StatusChip>
        </span>
        <ChevronDown className={`size-[18px] shrink-0 text-(--ap-muted) transition-transform duration-200 ${open ? "rotate-180 text-(--ap-violet)" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div id={id} key="m" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 38 }} style={{ overflow: "hidden" }}>
            <div className="flex flex-col gap-3 pb-4 max-[767px]:px-3.5">
              <div>
                <h3 className="text-[12px] font-bold tracking-wide text-(--ap-muted) uppercase">Your message{m.outletName ? ` · ${m.outletName}` : ""}</h3>
                <p className="mt-0.5 text-[15px] leading-snug whitespace-pre-wrap wrap-anywhere text-(--ap-ink-2)">{m.message}</p>
              </div>
              {m.replies.length ? (
                <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {m.replies.map((r, i) => (
                    <li key={`${r.at}:${i}`} className="rounded-xl bg-(--ap-tint-soft) px-3.5 py-3">
                      <span className="block text-[12px] font-bold text-(--ap-violet)">
                        {r.by} <span className="font-semibold text-(--ap-muted)">· {timeAgo(r.at)}</span>
                      </span>
                      <p className="mt-0.5 text-[15px] leading-snug whitespace-pre-wrap wrap-anywhere text-(--ap-ink-2)">{r.body}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[13px] text-(--ap-muted)">{m.status === "closed" ? "This message is closed." : "No reply yet. Beeliv will answer here."}</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export type Q = { q: string; a: ReactNode };
export const FAQ: Q[] = [
  {
    q: "How do I ask Beeliv for more staff?",
    a: (
      <p>
        Open <Link href={NEW_REQUEST_HREF}>Workforce Requests</Link> and start a request. It doesn&apos;t publish a vacancy; Beeliv reviews it and updates you there.
      </p>
    ),
  },
  {
    q: "Where do I see candidates Beeliv has shortlisted?",
    a: (
      <p>
        In <PilotLink href="/client/recruitment">Recruitment</PilotLink>. Only candidates Beeliv HR deliberately submits for your review appear, and your feedback informs Beeliv&apos;s final decision.
      </p>
    ),
  },
  {
    q: "What do the attendance figures mean?",
    a: (
      <p>
        They show your scheduled staff for a day by status. Open <PilotLink href="/client/attendance">Attendance</PilotLink> to see who is behind each number.
      </p>
    ),
  },
  {
    q: "Why can't I see identity or bank details for my staff?",
    a: (
      <p>
        Identity and banking documents are kept by Beeliv and aren&apos;t shown to clients. <PilotLink href="/client/compliance">Documents &amp; Compliance</PilotLink> lists operational documents such as food-safety certificates.
      </p>
    ),
  },
  {
    q: "Can I see or make payments here?",
    a: (
      <p>
        <PilotLink href="/client/payroll">Payroll</PilotLink> shows the pay schedule only. Payment amounts are not shown and payments are not made from this app.
      </p>
    ),
  },
];

function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div id="faq" className="scroll-mt-[90px]">
    <AnalyticsPanel title="Quick answers">
      <ul className="m-0 list-none p-0">
        {FAQ.map((f) => (
          <FaqItem key={f.q} faq={f} open={open === f.q} onToggle={() => setOpen(open === f.q ? null : f.q)} />
        ))}
      </ul>
    </AnalyticsPanel>
    </div>
  );
}

function FaqItem({ faq, open, onToggle }: { faq: Q; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className="border-t border-(--ap-line-2) first:border-t-0">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="flex min-h-12 w-full items-center gap-3 py-3 text-left">
        <b className="flex-1 text-[15px] font-bold text-(--ap-ink)">{faq.q}</b>
        <ChevronDown className={`size-[18px] shrink-0 text-(--ap-muted) transition-transform duration-200 ${open ? "rotate-180 text-(--ap-violet)" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div id={id} key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 38 }} style={{ overflow: "hidden" }}>
            <div className="pb-4 text-[15px] leading-[1.65] text-(--ap-ink-2) [&_a]:font-bold [&_a]:text-(--ap-violet)">{faq.a}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
