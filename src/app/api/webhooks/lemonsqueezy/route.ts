import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { planKeyForVariant } from "@/lib/billing/config";
import type { Database } from "@/lib/supabase/types";

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const actual = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let secret: string;
  try {
    secret = requiredEnv("LEMONSQUEEZY_WEBHOOK_SECRET");
  } catch {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }
  if (!verifySignature(rawBody, request.headers.get("x-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: {
    meta?: { event_name?: string; custom_data?: Record<string, unknown> | null };
    data?: { id?: string; attributes?: Record<string, unknown> };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const attributes = event.data?.attributes;
  const eventName = event.meta?.event_name ?? "";
  const subscriptionId = event.data?.id;
  const customData = event.meta?.custom_data;
  const userId = typeof customData?.user_id === "string" ? customData.user_id : undefined;
  if (!attributes || !subscriptionId) return NextResponse.json({ received: true });
  const variantId = String(attributes.variant_id ?? "");
  console.info("Lemon Squeezy webhook received:", { eventName, subscriptionId, variantId });
  const plan = planKeyForVariant(variantId);
  if (!plan || plan === "free") {
    console.warn("Ignoring Lemon Squeezy event for unknown variant:", variantId);
    return NextResponse.json({ received: true });
  }

  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient<Database>(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const cancelled = Boolean(attributes.cancelled) || eventName.includes("cancelled");
  const status = String(attributes.status ?? "active");
  if (eventName === "subscription_created" && !userId) {
    return NextResponse.json({ error: "Missing checkout user metadata." }, { status: 400 });
  }

  const existingByProvider = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("provider_subscription_id", subscriptionId)
    .limit(1)
    .maybeSingle();
  if (existingByProvider.error) {
    console.error("Could not find Lemon Squeezy subscription:", {
      code: existingByProvider.error.code,
      message: existingByProvider.error.message,
    });
    return NextResponse.json({ error: "Could not persist subscription." }, { status: 500 });
  }

  const existingByUser = !existingByProvider.data && userId
    ? await supabase
        .from("subscriptions")
        .select("id, user_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };
  if (existingByUser.error) {
    console.error("Could not find user's existing subscription:", {
      code: existingByUser.error.code,
      message: existingByUser.error.message,
    });
    return NextResponse.json({ error: "Could not persist subscription." }, { status: 500 });
  }

  const existing = existingByProvider.data ?? existingByUser.data;
  const resolvedUserId = userId ?? existing?.user_id;
  if (!resolvedUserId) return NextResponse.json({ error: "Subscription owner not found." }, { status: 400 });

  const subscriptionFields = {
    plan_id: plan,
    status,
    provider_customer_id: attributes.customer_id ? String(attributes.customer_id) : null,
    provider_subscription_id: subscriptionId,
    current_period_end: attributes.renews_at ? String(attributes.renews_at) : null,
    cancelled,
  };
  const result = existing
    ? await supabase.from("subscriptions").update(subscriptionFields).eq("id", existing.id)
    : await supabase.from("subscriptions").insert({ user_id: resolvedUserId, ...subscriptionFields });
  const { error } = result;
  if (error) {
    console.error("Could not persist Lemon Squeezy subscription:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json({ error: "Could not persist subscription." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
