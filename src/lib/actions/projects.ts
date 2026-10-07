"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, planKeyFromId } from "@/lib/billing/config";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function validateProductUrl(valueToValidate: string) {
  let parsed: URL;
  try {
    parsed = new URL(valueToValidate);
  } catch {
    throw new Error("Enter a valid product URL, for example https://yourproduct.com.");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) {
    throw new Error("Product URL must use HTTPS, for example https://yourproduct.com.");
  }
  return parsed.toString();
}

function competitorUrls(formData: FormData) {
  const urls = value(formData, "competitors")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  return urls.map((competitor) => {
    const normalized = /^[a-z][a-z\d+\-.]*:\/\//i.test(competitor)
      ? competitor
      : `https://${competitor}`;
    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new Error("Enter valid competitor URLs, for example https://competitor.com.");
    }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) {
      throw new Error("Competitor URLs must use HTTPS without credentials or custom ports.");
    }
    return parsed.toString();
  });
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const name = value(formData, "name");
  if (!name) throw new Error("Project name is required.");
  const productUrlValue = value(formData, "product_url");
  if (!productUrlValue) throw new Error("Product URL is required.");
  const productUrl = validateProductUrl(productUrlValue);
  const [{ count }, { data: subscription }] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("subscriptions").select("plan_id, status, cancelled").eq("user_id", user.id).maybeSingle(),
  ]);
  const activePlan = subscription && !subscription.cancelled && ["active", "on_trial", "paused"].includes(subscription.status)
    ? planKeyFromId(subscription.plan_id)
    : "free";
  if ((count ?? 0) >= PLAN_LIMITS[activePlan].projects) {
    throw new Error(`Your ${activePlan} plan allows up to ${PLAN_LIMITS[activePlan].projects} projects.`);
  }
  const { data, error } = await supabase.from("projects").insert({ user_id: user.id, name, product_url: productUrl, product_description: value(formData, "product_description") || null, ad_request: value(formData, "ad_request") || null, competitors: competitorUrls(formData) }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/projects/${data.id}`);
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const projectId = value(formData, "project_id");
  if (!projectId) throw new Error("Project ID is required.");
  const name = value(formData, "name");
  if (!name) throw new Error("Project name is required.");
  const productUrlValue = value(formData, "product_url");
  if (!productUrlValue) throw new Error("Product URL is required.");
  const productUrl = validateProductUrl(productUrlValue);
  const { error } = await supabase.from("projects").update({ name, product_url: productUrl, product_description: value(formData, "product_description") || null, ad_request: value(formData, "ad_request") || null, competitors: competitorUrls(formData) }).eq("id", projectId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const projectId = value(formData, "project_id");
  if (!projectId) throw new Error("Project ID is required.");
  const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
