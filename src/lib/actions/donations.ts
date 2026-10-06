"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured on the server.`);
  return value;
}

export async function createDonationCheckout(formData: FormData) {
  const amount = String(formData.get("amount") ?? "").trim().replace(",", ".");
  const amountInCents = Math.round(Number(amount) * 100);
  if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isSafeInteger(amountInCents) || amountInCents < 100) {
    throw new Error("Choose a donation amount of at least $1.00.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const custom = user ? { user_id: user.id, donation_amount: amount } : { donation_amount: amount };

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
          custom_price: amountInCents,
          checkout_data: {
            ...(user?.email ? { email: user.email } : {}),
            custom,
          },
          checkout_options: { embed: false },
        },
        relationships: {
          store: { data: { type: "stores", id: requiredEnv("LEMONSQUEEZY_STORE_ID") } },
          variant: { data: { type: "variants", id: requiredEnv("LEMONSQUEEZY_DONATION_VARIANT_ID") } },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Lemon Squeezy donation checkout failed:", response.status, detail.slice(0, 500));
    throw new Error("Donation checkout could not be created. Please try again.");
  }

  const payload = await response.json() as {
    data?: { attributes?: { url?: string; urls?: { checkout?: string } } };
  };
  const checkoutUrl = payload.data?.attributes?.url || payload.data?.attributes?.urls?.checkout;
  if (!checkoutUrl) {
    console.error("Lemon Squeezy donation checkout response did not include a URL.");
    throw new Error("Lemon Squeezy returned no donation checkout URL.");
  }

  redirect(checkoutUrl);
}
