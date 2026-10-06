"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

export async function saveBrandProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    brand_name: text(formData, "brand_name"),
    brand_description: text(formData, "brand_description"),
    brand_voice: text(formData, "brand_voice"),
    brand_values: text(formData, "brand_values"),
    preferred_words: text(formData, "preferred_words"),
    avoid_words: text(formData, "avoid_words"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}
