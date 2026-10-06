"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCampaign(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!projectId || !name) throw new Error("Campaign name and project are required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: strategy }, { data: variants }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).eq("user_id", user.id).single(),
    supabase.from("advertising_strategies").select("result").eq("project_id", projectId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("ad_variants").select("kind, content, position").eq("project_id", projectId).eq("user_id", user.id).order("kind").order("position"),
  ]);
  if (!project) throw new Error("Project could not be found.");
  if (!strategy) throw new Error("Generate a strategy before creating a campaign.");
  const { data: campaign, error } = await supabase.from("campaigns").insert({
    project_id: projectId,
    user_id: user.id,
    name,
    platform: "meta",
    objective: strategy.result.objective ?? null,
    strategy_snapshot: strategy.result,
    creative_snapshot: variants ?? [],
    status: "draft",
  }).select("id").single();
  if (error || !campaign) throw new Error(error?.message ?? "Campaign could not be created.");
  const { data: adSet, error: adSetError } = await supabase.from("campaign_ad_sets").insert({
    campaign_id: campaign.id,
    user_id: user.id,
    name: `${name} audience`,
    targeting_notes: "Define audience targeting before publishing.",
  }).select("id").single();
  if (adSetError || !adSet) throw new Error(adSetError?.message ?? "Campaign ad set could not be created.");
  if (variants?.length) {
    const { error: adsError } = await supabase.from("campaign_ads").insert(
      variants.map((variant) => ({ ad_set_id: adSet.id, user_id: user.id, kind: variant.kind, content: variant.content })),
    );
    if (adsError) throw new Error(adsError.message);
  }
  revalidatePath(`/projects/${projectId}`);
}

export async function createCampaignWithState(
  _previousState: { error?: string; success?: string },
  formData: FormData,
) {
  try {
    await createCampaign(formData);
    return { success: "Draft campaign created." };
  } catch (error) {
    console.error("Could not create draft campaign:", error);
    return { error: error instanceof Error ? error.message : "Could not create draft campaign." };
  }
}

export async function updateCampaign(
  _previousState: { error?: string; success?: string },
  formData: FormData,
) {
  const campaignId = String(formData.get("campaign_id") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const validStatuses = ["draft", "ready", "archived"] as const;
  if (!campaignId || !projectId || !name) return { error: "Campaign ID, project, and name are required." };
  if (!validStatuses.includes(status as (typeof validStatuses)[number])) return { error: "Invalid campaign status." };
  if (name.length > 120) return { error: "Campaign name must be 120 characters or fewer." };
  const nextStatus = status as (typeof validStatuses)[number];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to update a campaign." };

  const { error } = await supabase
    .from("campaigns")
    .update({ name, status: nextStatus })
    .eq("id", campaignId)
    .eq("project_id", projectId)
    .eq("user_id", user.id);
  if (error) {
    console.error("Could not update campaign:", error);
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/campaigns/${campaignId}`);
  return { success: "Campaign updated." };
}
