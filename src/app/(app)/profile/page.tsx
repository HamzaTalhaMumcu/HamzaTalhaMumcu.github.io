import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { planKeyFromId } from "@/lib/billing/config";
import { plans } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Profile",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, status, cancelled, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const active = subscription && !subscription.cancelled && ["active", "on_trial", "paused"].includes(subscription.status);
  const planKey = active ? planKeyFromId(subscription.plan_id) : "free";
  const plan = plans.find((item) => item.key === planKey);
  const status = active ? subscription.status.replace("_", " ") : "free";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Account</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your profile</h1>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-[#d8ddd7] px-4 py-2 text-sm font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]">
          Back to dashboard
        </Link>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">Email</p>
          <p className="mt-3 break-words font-medium text-[#17201b]">{user.email ?? "—"}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">Member since</p>
          <p className="mt-3 font-medium text-[#17201b]">{formatDate(user.created_at)}</p>
        </div>
      </section>
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">Subscription</p>
            <h2 className="mt-2 text-2xl font-semibold">{plan?.name ?? "Free"}</h2>
          </div>
          <span className="rounded-full bg-[#d8eadb] px-3 py-1 text-sm font-semibold capitalize text-[#327044]">{status}</span>
        </div>
        <div className="mt-6 grid gap-4 border-t border-[#e4e7e2] pt-5 sm:grid-cols-2">
          <div><p className="text-sm text-[#647068]">Plan</p><p className="mt-1 font-medium">{plan?.description ?? "Free access to PITLO."}</p></div>
          <div><p className="text-sm text-[#647068]">Next renewal</p><p className="mt-1 font-medium">{active ? formatDate(subscription.current_period_end) : "—"}</p></div>
        </div>
      </section>
    </main>
  );
}
