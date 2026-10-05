"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, planKeyFromId } from "@/lib/billing/config";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const name = value(formData, "name");
  if (!name) throw new Error("Project name is required.");
  const productUrl = value(formData, "product_url");
  if (!productUrl) throw new Error("Product URL is required.");
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
  const { data, error } = await supabase.from("projects").insert({ user_id: user.id, name, product_url: productUrl, product_description: value(formData, "product_description") || null, ad_request: value(formData, "ad_request") || null }).select("id").single();
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
  const productUrl = value(formData, "product_url");
  if (!productUrl) throw new Error("Product URL is required.");
  const { error } = await supabase.from("projects").update({ name, product_url: productUrl, product_description: value(formData, "product_description") || null, ad_request: value(formData, "ad_request") || null }).eq("id", projectId).eq("user_id", user.id);
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
