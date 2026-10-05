import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/billing/plans";
import { PLAN_LIMITS, planKeyFromId } from "@/lib/billing/config";
import { createCheckout } from "@/lib/actions/billing";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { q } = await searchParams;
  const search = q?.trim().toLowerCase() ?? "";
  const [{ data: allProjects, error }, { data: usage }, { data: subscription }] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", user?.id ?? "").order("updated_at", { ascending: false }),
    supabase.from("ai_usage").select("generations, period_start").eq("user_id", user?.id ?? "").maybeSingle(),
    supabase.from("subscriptions").select("plan_id, status, cancelled").eq("user_id", user?.id ?? "").maybeSingle(),
  ]);
  const projects = search
    ? allProjects?.filter((project) => [project.name, project.product_url, project.product_description, project.ad_request].some((value) => value?.toLowerCase().includes(search)))
    : allProjects;
  const activePlan = subscription && !subscription.cancelled && ["active", "on_trial", "paused"].includes(subscription.status)
    ? planKeyFromId(subscription.plan_id)
    : "free";
  const quota = PLAN_LIMITS[activePlan].analyses;
  const used = usage?.generations ?? 0;

  return <main className="min-h-screen mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#17201b] px-6 py-8 text-white shadow-xl shadow-[#17201b]/10 sm:px-10 sm:py-10">
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#e45b35]/25 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f0a084]">Your workspace</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Turn your next idea into a campaign.</h1>
          <p className="mt-4 max-w-xl leading-7 text-[#c7d0c9]">Start with a product URL. PITLO will help you find the angle, audience, and creative direction.</p>
        </div>
        <Link href="/projects/new" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#f0714e]">New project <span className="ml-2 text-lg">+</span></Link>
      </div>
    </section>

    <section className="mt-6 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">Projects</p><p className="mt-2 text-3xl font-semibold text-[#17201b]">{allProjects?.length ?? 0}</p><p className="mt-1 text-sm text-[#647068]">Ideas in your workspace</p></div>
      <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">AI analyses this month</p><p className="mt-2 text-3xl font-semibold text-[#17201b]">{used}<span className="text-lg text-[#8b968d]"> / {quota}</span></p><p className="mt-1 text-sm text-[#647068]">Generations used</p></div>
      <div className="rounded-2xl bg-[#f0e5d8] p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8f4a31]">Remaining</p><p className="mt-2 text-3xl font-semibold text-[#a14a36]">{Math.max(0, quota - used)}</p><p className="mt-1 text-sm text-[#8f4a31]">AI analyses available</p></div>
    </section>

    <section className="mt-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Plans</p><h2 className="mt-1 text-2xl font-semibold">Choose the level that fits your business</h2></div>
        <p className="text-sm text-[#647068]">Paid plans will open after the test checkout is ready.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = plan.key === activePlan;
          const isCheckoutReady = plan.key === "starter" || plan.key === "pro";
          const locked = !isCurrent && !isCheckoutReady;
          return <article key={plan.name} className={`relative rounded-2xl border p-5 shadow-sm ${plan.status === "coming-soon" ? "border-[#d8c7e8] bg-[#f6f0fb]" : plan.status === "current" ? "border-[#b9d7bf] bg-[#edf8ef]" : "border-[#e4e7e2] bg-white"}`}>
            {locked && <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#17201b] px-2.5 py-1 text-xs font-semibold text-white"><span aria-hidden="true">🔒</span>{plan.status === "coming-soon" ? "Coming soon" : "Test mode"}</div>}
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8b968d]">{plan.badge}</p>
            <div className="mt-3 flex items-baseline gap-2"><h3 className="text-2xl font-semibold">{plan.name}</h3><span className="text-3xl font-semibold text-[#17201b]">{plan.price}</span>{plan.cadence && <span className="text-sm text-[#647068]">{plan.cadence}</span>}</div>
            <p className="mt-2 min-h-12 text-sm leading-6 text-[#647068]">{plan.description}</p>
            <div className="mt-5 space-y-2 text-sm font-medium text-[#334038]"><p>✦ {plan.analyses}</p><p>▦ {plan.projects}</p></div>
            <ul className="mt-5 space-y-2 border-t border-black/5 pt-4 text-sm text-[#647068]">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
            {isCurrent ? <div className="mt-6 w-full rounded-xl bg-[#327044] px-4 py-3 text-center text-sm font-semibold text-white">Current plan</div> : locked ? <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#e6e8e4] px-4 py-3 text-sm font-semibold text-[#8b968d]">{plan.status === "coming-soon" ? "Coming in a future update" : "Not available yet"}</button> : <form action={createCheckout}><input type="hidden" name="variant_id" value={plan.key === "starter" ? process.env.LEMONSQUEEZY_STARTER_VARIANT_ID : process.env.LEMONSQUEEZY_PRO_VARIANT_ID} /><button type="submit" className="mt-6 w-full rounded-xl bg-[#17201b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2b3d32]">Start {plan.name}</button></form>}
          </article>;
        })}
      </div>
    </section>

    <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Projects</p><h2 className="mt-1 text-2xl font-semibold">Your active work</h2></div>
      <form className="flex w-full gap-3 sm:w-auto" method="get"><input name="q" defaultValue={q ?? ""} placeholder="Search projects..." className="min-w-0 flex-1 rounded-xl border border-[#d8ddd7] bg-white px-4 py-3 outline-none focus:border-[#e45b35] sm:w-64" /><button className="rounded-xl border border-[#d8ddd7] px-4 py-3 font-semibold text-[#334038] hover:border-[#e45b35] hover:text-[#e45b35]">Search</button></form>
    </div>

    {error ? <p className="mt-6 rounded-xl bg-[#fff0eb] p-4 text-[#b44325]">Could not load projects. Please try again.</p> : projects?.length ? <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{projects.map((project) => <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-2xl border border-[#e4e7e2] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:border-[#e45b35] hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e5d8] text-lg text-[#a14a36]">✦</div><div className="min-w-0"><h3 className="truncate font-semibold group-hover:text-[#e45b35]">{project.name}</h3><span className="mt-1 inline-flex rounded-full bg-[#d8eadb] px-2.5 py-1 text-xs font-semibold text-[#327044]">Active</span></div></div><span className="text-[#a5afa7]">→</span></div><p className="mt-6 line-clamp-2 text-sm leading-6 text-[#647068]">{project.product_description || project.product_url || "Add product details to get started."}</p><div className="mt-5 flex items-center justify-between gap-3 text-xs text-[#8b968d]"><span>Created {new Date(project.created_at).toLocaleDateString("en-US")}</span><span>{new Date(project.updated_at).toLocaleDateString("en-US")}</span></div></Link>)}</div> : <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-3xl bg-white p-8 shadow-sm sm:p-12"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e5d8] text-xl text-[#a14a36]">✦</div><h2 className="mt-6 text-2xl font-semibold">{search ? "No matching projects" : "Your first project starts here"}</h2><p className="mt-2 max-w-md leading-7 text-[#647068]">{search ? "Try a different search term." : "Add a product URL and let PITLO turn it into a clear, actionable advertising direction."}</p>{search ? <Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#c94b29]">Clear search</Link> : <Link href="/projects/new" className="mt-6 inline-flex rounded-xl bg-[#e45b35] px-5 py-3 font-semibold text-white hover:bg-[#c94b29]">Create a project</Link>}</div><div className="rounded-3xl bg-[#d8eadb] p-8"><p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#327044]">How it works</p><div className="mt-6 space-y-5 text-sm text-[#334038]"><div><p className="font-semibold">01. Add your product</p><p className="mt-1 leading-6 text-[#52725a]">Share a URL and a little context.</p></div><div><p className="font-semibold">02. Find your angle</p><p className="mt-1 leading-6 text-[#52725a]">Get audience and positioning insights.</p></div><div><p className="font-semibold">03. Build the campaign</p><p className="mt-1 leading-6 text-[#52725a]">Start with hooks and ad copy.</p></div></div></div></div>}
  </main>;
}
