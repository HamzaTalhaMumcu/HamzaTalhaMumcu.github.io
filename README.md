# PITLO

PITLO is an AI advertising SaaS being built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Current product

The current foundation includes:

- Public landing, login, and signup pages
- Supabase Auth with cookie-backed session refresh
- Protected dashboard and project routes
- Project create, list, edit, and delete flows
- Supabase PostgreSQL migration with ownership-focused RLS policies
- A real AI product insight engine that generates an audience, pain points, positioning, and promise
- Campaign strategy with channels, messaging pillars, and creative directions
- Starter hooks and ad copy persisted per project
- In-app feedback form with Supabase persistence and ownership-focused RLS
- Free, Starter, Pro, and future X plan definitions shown in the dashboard

The insight engine uses Gemini. The server visits the product URL,
extracts the page content, and sends it to Gemini together with the user's advertising brief.
Users never enter an API key; configure `AI_PROVIDER_API_KEY`, `AI_MODEL`, and optionally
`AI_MONTHLY_QUOTA` is retained for local compatibility; production plan quotas are
defined in `src/lib/billing/config.ts` and applied from the user's verified subscription.

## Billing roadmap

The dashboard currently shows the Free, Starter, Pro, and future X plans. Paid plan
checkout remains locked until the Lemon Squeezy test checkout and webhook flow are
verified. Create these products as monthly recurring variants in Lemon Squeezy test mode:

- PITLO Starter — `$9/month` — 50 AI analyses and up to 20 projects
- PITLO Pro — `$19/month` — 200 AI analyses and unlimited projects
- PITLO X — `$99/month` — future plan, keep checkout disabled until AI video generation is shipped

The Free plan is available in-app and provides 10 AI analyses per month. Lemon Squeezy
test-mode products are separate from live-mode products, so recreate or copy them when
launching production billing. The eventual integration must verify signed webhooks
server-side before changing a user's plan or quota.

For billing, configure `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`,
`LEMONSQUEEZY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and the three
`LEMONSQUEEZY_*_VARIANT_ID` values. Run `0006_add_subscriptions.sql` before testing
checkout. The webhook URL is `/api/webhooks/lemonsqueezy`.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add the Supabase project URL, anon key, and AI provider key.

3. Apply `supabase/migrations/0001_initial_schema.sql`, `0002_add_ad_request.sql`,
   `0003_align_ad_variants_schema.sql`, `0004_add_ai_usage_quota.sql`, and
   `0005_add_feedback.sql` to the Supabase project.

4. Start the development server:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
