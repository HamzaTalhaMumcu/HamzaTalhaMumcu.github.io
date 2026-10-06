import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignEditForm } from "@/components/projects/campaign-edit-form";
import type { Campaign, CampaignAd, CampaignAdSet } from "@/lib/supabase/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function snapshotEntries(value: Record<string, unknown>) {
  return Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== "");
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; campaignId: string }>;
}) {
  const { projectId, campaignId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: project }, { data: campaign }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).eq("user_id", user.id).single(),
    supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!project || !campaign) notFound();

  const { data: adSets } = await supabase
    .from("campaign_ad_sets")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const adSetIds = (adSets ?? []).map((adSet) => adSet.id);
  const { data: ads } = adSetIds.length
    ? await supabase.from("campaign_ads").select("*").in("ad_set_id", adSetIds).eq("user_id", user.id).order("created_at", { ascending: true })
    : { data: [] };

  const campaignRecord = campaign as Campaign;
  const adSetRecords = (adSets ?? []) as CampaignAdSet[];
  const adRecords = (ads ?? []) as CampaignAd[];
  const strategyEntries = snapshotEntries(campaignRecord.strategy_snapshot);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-12">
      <Link href={`/projects/${projectId}`} className="text-sm font-medium text-[#647068] hover:text-[#e45b35]">
        ← Back to {project.name}
      </Link>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e45b35]">Campaign detail</p>
        <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight sm:text-4xl">{campaignRecord.name}</h1>
        <p className="mt-2 text-sm text-[#647068]">Built from the strategy and creative generated for {project.name}.</p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Status", campaignRecord.status],
          ["Platform", campaignRecord.platform],
          ["Objective", campaignRecord.objective || "—"],
          ["Created", formatDate(campaignRecord.created_at)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b968d]">{label}</p>
            <p className="mt-3 break-words font-medium capitalize text-[#17201b]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#e45b35]">Campaign settings</p>
        <h2 className="mt-2 text-2xl font-semibold">Manage draft details</h2>
        <CampaignEditForm campaignId={campaignId} projectId={projectId} name={campaignRecord.name} status={campaignRecord.status} />
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#e45b35]">Strategy snapshot</p>
        <h2 className="mt-2 text-2xl font-semibold">Strategy used to create this campaign</h2>
        {strategyEntries.length ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {strategyEntries.map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-[#f1f1ec] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#8b968d]">{key.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#334038]">{Array.isArray(value) ? value.join(" · ") : String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="mt-5 text-sm text-[#647068]">No strategy snapshot was saved.</p>}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#e45b35]">Ad sets and creatives</p>
        <h2 className="mt-2 text-2xl font-semibold">Campaign content</h2>
        <div className="mt-6 space-y-5">
          {adSetRecords.length ? adSetRecords.map((adSet) => {
            const adSetAds = adRecords.filter((ad) => ad.ad_set_id === adSet.id);
            return (
              <article key={adSet.id} className="rounded-2xl border border-[#e4e7e2] p-5">
                <h3 className="text-lg font-semibold">{adSet.name}</h3>
                {adSet.targeting_notes && <p className="mt-2 text-sm text-[#647068]">{adSet.targeting_notes}</p>}
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {adSetAds.length ? adSetAds.map((ad) => (
                    <div key={ad.id} className="rounded-xl bg-[#f1f1ec] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8b968d]">{ad.kind}</p>
                      <h4 className="mt-2 font-semibold">{ad.content.title || "Untitled creative"}</h4>
                      {ad.content.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#647068]">{ad.content.body}</p>}
                      {ad.content.angle && <p className="mt-3 text-sm text-[#647068]"><strong className="text-[#334038]">Angle:</strong> {ad.content.angle}</p>}
                      {ad.content.cta && <p className="mt-3 text-sm font-semibold text-[#8f4a31]">{ad.content.cta}</p>}
                    </div>
                  )) : <p className="text-sm text-[#647068]">No creatives in this ad set.</p>}
                </div>
              </article>
            );
          }) : <p className="text-sm text-[#647068]">No ad sets were saved for this campaign.</p>}
        </div>
      </section>
    </main>
  );
}
