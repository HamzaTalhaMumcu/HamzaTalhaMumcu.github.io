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

The insight engine uses Gemini. The server visits the product URL,
extracts the page content, and sends it to Gemini together with the user's advertising brief.
Users never enter an API key; configure `AI_PROVIDER_API_KEY`, `AI_MODEL`, and optionally
`AI_MONTHLY_QUOTA` on the server. The default monthly quota is 10 analyses per user.

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
