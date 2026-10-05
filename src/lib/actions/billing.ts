"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { variantIdForPlan } from "@/lib/billing/config";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured on the server.`);
  return value;
}

export async function createCheckout(formData: FormData) {
  const variantId = String(formData.get("variant_id") ?? "").trim();
  const allowedVariants = [
    variantIdForPlan("starter"),
    variantIdForPlan("pro"),
  ].filter(Boolean);
  if (!variantId || !allowedVariants.includes(variantId)) {
    throw new Error("This plan is not available for checkout.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${requiredEnv("LEMONSQUEEZY_API_KEY")}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            custom: { user_id: user.id },
          },
          checkout_options: { embed: false },
        },
        relationships: {
          store: { data: { type: "stores", id: requiredEnv("LEMONSQUEEZY_STORE_ID") } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Lemon Squeezy checkout creation failed:", response.status, detail.slice(0, 500));
    throw new Error("Checkout could not be created. Please try again.");
  }
  const payload = await response.json() as {
    data?: {
      attributes?: {
        url?: string;
        urls?: { checkout?: string };
      };
    };
  };
  const checkoutUrl = payload.data?.attributes?.url || payload.data?.attributes?.urls?.checkout;
  if (!checkoutUrl) {
    console.error("Lemon Squeezy checkout response did not include a URL.");
    throw new Error("Lemon Squeezy returned no checkout URL.");
  }
  redirect(checkoutUrl);
}
