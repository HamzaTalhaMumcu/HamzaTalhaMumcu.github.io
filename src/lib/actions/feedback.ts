"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedCategories = ["general", "bug", "feature", "improvement"] as const;
type FeedbackCategory = (typeof allowedCategories)[number];

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const message = value(formData, "message");
  if (message.length < 10) {
    throw new Error("Please share at least 10 characters of feedback.");
  }
  if (message.length > 2000) {
    throw new Error("Feedback must be 2,000 characters or fewer.");
  }

  const category = value(formData, "category") || "general";
  if (!(allowedCategories as readonly string[]).includes(category)) {
    throw new Error("Please choose a valid feedback category.");
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    email: user.email ?? "",
    category: category as FeedbackCategory,
    message,
  });
  if (error) throw new Error(error.message);

  redirect("/feedback?submitted=1");
}
