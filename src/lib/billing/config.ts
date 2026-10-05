import { plans } from "./plans";

export const PLAN_LIMITS = {
  free: { analyses: 10, projects: 3 },
  starter: { analyses: 50, projects: 20 },
  pro: { analyses: 200, projects: Number.POSITIVE_INFINITY },
  x: { analyses: 1000, projects: Number.POSITIVE_INFINITY },
} as const;

export function planForVariant(variantId: string) {
  if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) return plans.find((plan) => plan.key === "starter");
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return plans.find((plan) => plan.key === "pro");
  if (variantId === process.env.LEMONSQUEEZY_X_VARIANT_ID) return plans.find((plan) => plan.key === "x");
  return undefined;
}

export function planKeyForVariant(variantId: string) {
  return planForVariant(variantId)?.key ?? null;
}

export function planKeyFromId(planId: string | null | undefined) {
  if (planId === "starter" || planId === "pro" || planId === "x") return planId;
  if (planId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) return "starter";
  if (planId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  if (planId === process.env.LEMONSQUEEZY_X_VARIANT_ID) return "x";
  return "free";
}
