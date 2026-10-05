import { plans } from "./plans";

export const PLAN_LIMITS = {
  free: { analyses: 10, projects: 3 },
  starter: { analyses: 50, projects: 20 },
  pro: { analyses: 200, projects: Number.POSITIVE_INFINITY },
  x: { analyses: 1000, projects: Number.POSITIVE_INFINITY },
} as const;

export function variantIdForPlan(plan: "starter" | "pro" | "x") {
  const names = {
    starter: ["LEMONSQUEEZY_STARTER_VARIANT_ID", "NEXT_PUBLIC_VARIANT_STARTER"],
    pro: ["LEMONSQUEEZY_PRO_VARIANT_ID", "NEXT_PUBLIC_VARIANT_PRO"],
    x: ["LEMONSQUEEZY_X_VARIANT_ID", "NEXT_PUBLIC_VARIANT_X"],
  }[plan];
  return names.map((name) => process.env[name]?.trim()).find(Boolean) || "";
}

export function planForVariant(variantId: string) {
  if (variantId === variantIdForPlan("starter")) return plans.find((plan) => plan.key === "starter");
  if (variantId === variantIdForPlan("pro")) return plans.find((plan) => plan.key === "pro");
  if (variantId === variantIdForPlan("x")) return plans.find((plan) => plan.key === "x");
  return undefined;
}

export function planKeyForVariant(variantId: string) {
  return planForVariant(variantId)?.key ?? null;
}

export function planKeyFromId(planId: string | null | undefined) {
  if (planId === "starter" || planId === "pro" || planId === "x") return planId;
  if (planId === variantIdForPlan("starter")) return "starter";
  if (planId === variantIdForPlan("pro")) return "pro";
  if (planId === variantIdForPlan("x")) return "x";
  return "free";
}
