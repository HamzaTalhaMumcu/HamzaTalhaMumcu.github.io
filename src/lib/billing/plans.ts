export type Plan = {
  key: "free" | "starter" | "pro" | "x";
  name: string;
  price: string;
  cadence?: string;
  description: string;
  analyses: string;
  projects: string;
  features: string[];
  status: "current" | "planned" | "coming-soon";
  badge?: string;
};

export const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Explore the workflow and find your first strong angle.",
    analyses: "10 AI analyses / month",
    projects: "Up to 3 projects",
    features: ["Product insights", "Campaign strategy", "Starter hooks and ad copy"],
    status: "current",
    badge: "Your current plan",
  },
  {
    key: "starter",
    name: "Starter",
    price: "$9",
    cadence: "per month",
    description: "For small but active businesses building campaigns consistently.",
    analyses: "50 AI analyses / month",
    projects: "Up to 20 projects",
    features: ["Everything in Free", "More generations for real campaigns", "Priority access to new workflows"],
    status: "planned",
    badge: "For growing businesses",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For established businesses that need a reliable creative partner.",
    analyses: "200 AI analyses / month",
    projects: "Unlimited projects",
    features: ["Everything in Starter", "Higher monthly AI capacity", "Advanced campaign workspace"],
    status: "planned",
    badge: "For serious growth",
  },
  {
    key: "x",
    name: "X",
    price: "$99",
    cadence: "per month",
    description: "The future production suite for teams creating ads at scale.",
    analyses: "1,000 AI analyses / month",
    projects: "Unlimited projects",
    features: ["Everything in Pro", "AI video generation", "Campaign-scale creative production"],
    status: "coming-soon",
    badge: "Coming in a future update",
  },
];
