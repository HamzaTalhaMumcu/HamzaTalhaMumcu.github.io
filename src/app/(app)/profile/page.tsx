import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, planKeyFromId, variantIdForPlan } from "@/lib/billing/config";
import { plans } from "@/lib/billing/plans";
import { createCheckout } from "@/lib/actions/billing";
import { saveBrandProfile } from "@/lib/actions/brand";

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

  const [{ data: subscription }, { data: brand }] = await Promise.all([
    supabase
    .from("subscriptions")
    .select("plan_id, status, cancelled, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle(),
    supabase.from("profiles").select("brand_name, brand_description, brand_voice, brand_values, preferred_words, avoid_words").eq("id", user.id).maybeSingle(),
  ]);
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
      <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">Brand Brain</p>
        <h2 className="mt-2 text-2xl font-semibold">Give PITLO a consistent brand context</h2>
        <p className="mt-2 text-sm leading-6 text-[#647068]">Saved brand guidance will be used in future product analyses, strategies, and creative generations.</p>
        <form action={saveBrandProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#334038]">Brand name<input name="brand_name" defaultValue={brand?.brand_name ?? ""} className="mt-2 w-full rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <label className="text-sm font-medium text-[#334038]">Brand voice<input name="brand_voice" defaultValue={brand?.brand_voice ?? ""} placeholder="e.g. clear, warm, confident" className="mt-2 w-full rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <label className="text-sm font-medium text-[#334038] sm:col-span-2">Brand description<textarea name="brand_description" rows={3} defaultValue={brand?.brand_description ?? ""} className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <label className="text-sm font-medium text-[#334038]">Brand values<textarea name="brand_values" rows={3} defaultValue={brand?.brand_values ?? ""} placeholder="One value per line" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <label className="text-sm font-medium text-[#334038]">Preferred words<textarea name="preferred_words" rows={3} defaultValue={brand?.preferred_words ?? ""} placeholder="Words and phrases to prefer" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <label className="text-sm font-medium text-[#334038] sm:col-span-2">Words or claims to avoid<textarea name="avoid_words" rows={3} defaultValue={brand?.avoid_words ?? ""} placeholder="Words, claims, or tones to avoid" className="mt-2 w-full resize-none rounded-xl border border-[#d8ddd7] px-4 py-3 outline-none focus:border-[#e45b35]" /></label>
          <button type="submit" className="w-fit rounded-xl bg-[#17201b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2b3d32]">Save brand context</button>
        </form>
      </section>
      <section className="mt-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Plans</p>
            <h2 className="mt-1 text-2xl font-semibold">Manage your subscription</h2>
          </div>
          <Link href="/support" className="text-sm font-semibold text-[#e45b35] hover:text-[#c94b29]">Support PITLO →</Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {plans.map((item) => {
            const isCurrent = item.key === planKey;
            const isCheckoutReady = item.key === "starter" || item.key === "pro";
            const locked = !isCurrent && !isCheckoutReady;
            return (
              <article key={item.key} className={`relative rounded-2xl border p-5 shadow-sm ${item.status === "coming-soon" ? "border-[#d8c7e8] bg-[#f6f0fb]" : isCurrent ? "border-[#b9d7bf] bg-[#edf8ef]" : "border-[#e4e7e2] bg-white"}`}>
                {locked && <div className="absolute right-4 top-4 rounded-full bg-[#17201b] px-2.5 py-1 text-xs font-semibold text-white">{item.status === "coming-soon" ? "Coming soon" : "Unavailable"}</div>}
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8b968d]">{item.badge}</p>
                <div className="mt-3 flex items-baseline gap-2"><h3 className="text-2xl font-semibold">{item.name}</h3><span className="text-3xl font-semibold text-[#17201b]">{item.price}</span>{item.cadence && <span className="text-sm text-[#647068]">{item.cadence}</span>}</div>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#647068]">{item.description}</p>
                <div className="mt-5 space-y-2 text-sm font-medium text-[#334038]"><p>✦ {item.analyses}</p><p>▦ {item.projects}</p><p>Monthly limit: {PLAN_LIMITS[item.key].analyses} analyses</p></div>
                <ul className="mt-5 space-y-2 border-t border-black/5 pt-4 text-sm text-[#647068]">{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
                {isCurrent ? <div className="mt-6 w-full rounded-xl bg-[#327044] px-4 py-3 text-center text-sm font-semibold text-white">Current plan</div> : locked ? <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#e6e8e4] px-4 py-3 text-sm font-semibold text-[#8b968d]">{item.status === "coming-soon" ? "Coming in a future update" : "Not available yet"}</button> : <form action={createCheckout}><input type="hidden" name="variant_id" value={variantIdForPlan(item.key as "starter" | "pro")} /><button type="submit" className="mt-6 w-full rounded-xl bg-[#17201b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2b3d32]">Choose {item.name}</button></form>}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
