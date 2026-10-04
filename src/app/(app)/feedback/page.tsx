import Link from "next/link";
import { submitFeedback } from "@/lib/actions/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";

const categoryLabels = {
  general: "General feedback",
  bug: "Report a bug",
  feature: "Feature request",
  improvement: "Product improvement",
} as const;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { submitted } = await searchParams;
  const { data: previousFeedback } = await supabase
    .from("feedback")
    .select("id, category, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm font-medium text-[#647068] hover:text-[#e45b35]">
        ← Back to projects
      </Link>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Help shape Pitlo</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Share your feedback</h1>
        <p className="mt-3 max-w-xl leading-7 text-[#647068]">
          Tell us what is working, what is confusing, or what you would like to see next.
          Your feedback helps us build a better product.
        </p>
      </div>

      {submitted === "1" && (
        <div className="mt-8 rounded-2xl border border-[#b9d7bf] bg-[#edf8ef] p-4 text-sm font-medium text-[#327044]">
          Thanks for your feedback. We appreciate you taking the time to help improve Pitlo.
        </div>
      )}

      <form action={submitFeedback} className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <label className="block text-sm font-semibold text-[#334038]" htmlFor="category">What is this about?</label>
        <select id="category" name="category" defaultValue="general" className="mt-2 w-full rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35]">
          {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="mt-6 block text-sm font-semibold text-[#334038]" htmlFor="message">Your feedback</label>
        <textarea id="message" name="message" required minLength={10} maxLength={2000} rows={7} placeholder="What would you like us to know?" className="mt-2 w-full resize-y rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 leading-6 outline-none focus:border-[#e45b35]" />
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-[#8b968d]">10–2,000 characters</p>
          <SubmitButton idleLabel="Send feedback" pendingLabel="Sending..." className="rounded-xl bg-[#17201b] px-5 py-3 font-semibold text-white hover:bg-[#2b3d32]" />
        </div>
      </form>

      {previousFeedback?.length ? (
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#e45b35]">Your previous feedback</p>
          <div className="mt-4 divide-y divide-[#e4e7e2]">
            {previousFeedback.map((item) => (
              <article key={item.id} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#334038]">{categoryLabels[item.category]}</p>
                  <time className="text-xs text-[#8b968d]" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("en-US")}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#647068]">{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
