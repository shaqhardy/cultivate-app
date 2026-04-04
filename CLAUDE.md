# CLAUDE.md — Cultivate Community App

## What This Is

A community web app at cultivate.shaqhardy.com for Bible teacher and speaker Shaq Hardy. This is the logged-in experience for his audience, separate from his public WordPress site at shaqhardy.com. Build the entire Phase 1 in a single pass. Every file, every migration, every component. Working app, deployable to Vercel when finished.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) with TypeScript, deployed to Vercel
- **Styling:** Tailwind CSS v4 (CSS-first config, no tailwind.config.js)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Row-Level Security, Edge Functions)
- **Payments:** Stripe (subscriptions + one-time purchases)
- **Email:** Gmail SMTP via booking@shaqhardy.com (Google Workspace)
- **Domain:** cultivate.shaqhardy.com (CNAME to Vercel, DNS managed at Squarespace)

---

## Brand System — Cultivate

Every design choice points toward faithfulness, not virality.

### Identity

- No logo. The brand is Shaq Hardy, carried by voice, color, and typography.
- **Tagline:** Cultivate. Grow with intention.
- **Calling:** Preaching the Word. Teaching the truth. Cultivating faithfulness.
- **Tone:** Shepherded, calm, serious, patient. Not influencer, not hype-driven.

### Colors

The palette is intentionally small. Three colors that do the work, and one quiet neutral. That's it.

Primary (70% of any design):

| Color      | Hex     | Role                                        |
|------------|---------|---------------------------------------------|
| Black      | #000000 | Backgrounds, text, headers, primary surfaces. The dominant color on screen. |
| Warm Cream | #F7F3E9 | Text on dark backgrounds, light page backgrounds, contrast surfaces. Not pure white. Warm. |

Accent:

| Color      | Hex     | Role                                             |
|------------|---------|--------------------------------------------------|
| Terracotta | #CC5500 | The one pop color. Emphasis words, divider lines, buttons, callout accents. If something needs to stand out, it's terracotta. |

Neutral:

| Color      | Hex     | Role                                             |
|------------|---------|--------------------------------------------------|
| Warm Stone | #8C8279 | Scripture references, metadata, secondary text, subtle borders, table headers. The quiet color that holds things together without demanding attention. |

Rules:
- Black and Cream do the heavy lifting. Everything else is accent.
- Terracotta is the only pop color. Use it sparingly so it keeps its impact.
- Warm Stone is for things that need to be visible but shouldn't compete: references, captions, dates, metadata.
- On dark backgrounds, use Cream text. On light backgrounds, use Black text.
- Never use bright or saturated colors outside this palette.
- Olive (#535E4A) and Sage (#6B7A5A) belong to Orphan No More only. Do not use them here.
- When in doubt, use fewer colors, not more.

### Typography

**Bebas Neue** (Display / Headlines):
- Source: Google Fonts
- ALL CAPS only. Never lowercase.
- Use for: headlines, section titles, navigation labels, banners
- Never for: body copy, Scripture references, captions

**Inter** (Body / UI):
- Source: Google Fonts
- Weights: Regular (400) body, Medium (500) subheads, SemiBold (600) labels
- Use for: body text, UI elements, descriptions, captions
- Never use Bold (700) except for rare strong emphasis

Import both via Google Fonts CDN in the global CSS.

### Layout Principles

- White space over ornament. Let content breathe.
- Consistent margins: 60px minimum on all sides (digital).
- Left-aligned body text.
- One focal point per frame.

---

## Architecture — Phase 1 (Build All of This)

### Auth and Roles (Supabase Auth)

- Email/password signup + Google OAuth
- Roles: `free_member`, `paid_member`, `admin`
- Row-level security policies scoped to each role
- Middleware that refreshes sessions and protects routes
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` and `/signup` to `/library`

### Auth Callback Route

- Create `/auth/callback` route handler for OAuth and email confirmation redirects
- Exchange auth code for session, then redirect to `/library`

### Free Member Tier

- Account creation and profile
- Access to free content library (devotionals, articles, video embeds)
- Kit (ConvertKit) integration: sync new signups to email list via Kit API (build the hook, use env var `KIT_API_KEY` and `KIT_FORM_ID`)

### Paid Member Tier (Stripe)

- Monthly subscription for premium content access
- One-time purchases for individual resources (downloadable PDFs, study guides)
- Stripe Customer Portal for managing subscriptions
- Webhook handler at `/api/webhooks/stripe` for payment events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Content Management

- Admin dashboard at `/admin` routes (protected by `admin` role check)
- Admin can create, edit, delete content items
- Content types: `article`, `video`, `pdf`, `audio`
- Fields per content item: title, description, body (rich text for articles), embed_url (for video/audio), file_url (for PDFs), content_type, access_level (`free` or `paid`), tags (array), book_of_bible, series, published (boolean), created_at, updated_at
- Tagging system: by topic, book of the Bible, series name
- Access level flags (free vs paid) per content item
- File uploads for PDFs via Supabase Storage

### Member Dashboard

- Clean, branded dashboard after login
- Content library at `/library` with filtering by type, topic, access level
- `/my-library` for saved/bookmarked content
- `/settings` for account info and subscription management
- Responsive: sidebar on desktop, collapsible nav on mobile

---

## Database Schema (Supabase SQL Migrations)

Design with future phases in mind. Create these as SQL migration files in `supabase/migrations/`.

### profiles

Extends `auth.users`. Created automatically via trigger on user signup.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'free_member' check (role in ('free_member', 'paid_member', 'admin')),
  stripe_customer_id text,
  kit_subscriber_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### content

```sql
create table public.content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  body text,
  content_type text not null check (content_type in ('article', 'video', 'pdf', 'audio')),
  embed_url text,
  file_url text,
  access_level text not null default 'free' check (access_level in ('free', 'paid')),
  tags text[] default '{}',
  book_of_bible text,
  series text,
  published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### bookmarks

```sql
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, content_id)
);
```

### subscriptions

Synced with Stripe webhooks.

```sql
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (status in ('active', 'canceled', 'past_due', 'inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### purchases

For one-time buys.

```sql
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade not null,
  stripe_payment_intent_id text,
  amount integer,
  created_at timestamptz default now()
);
```

### Row-Level Security

Enable RLS on all tables. Policies:

- **profiles:** Users can read/update their own profile. Admins can read all.
- **content:** Anyone authenticated can read published free content. Paid content readable by `paid_member` and `admin`. Admins can insert/update/delete.
- **bookmarks:** Users can CRUD their own bookmarks.
- **subscriptions:** Users can read their own. Admins can read all.
- **purchases:** Users can read their own. Admins can read all.

### Trigger: Auto-create Profile on Signup

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Project Structure

```
cultivate-community/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .gitignore
├── supabase/
│   └── migrations/
│       ├── 00001_profiles.sql
│       ├── 00002_content.sql
│       ├── 00003_bookmarks.sql
│       ├── 00004_subscriptions.sql
│       ├── 00005_purchases.sql
│       └── 00006_rls_policies.sql
├── public/
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx              (root layout, fonts, metadata)
│   │   ├── page.tsx                (landing page — public, not logged in)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts        (OAuth + email confirm callback)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          (centered auth layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          (sidebar + main content area)
│   │   │   ├── library/
│   │   │   │   └── page.tsx        (content library with filters)
│   │   │   ├── library/[id]/
│   │   │   │   └── page.tsx        (single content view)
│   │   │   ├── my-library/
│   │   │   │   └── page.tsx        (bookmarked content)
│   │   │   └── settings/
│   │   │       └── page.tsx        (profile + subscription management)
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          (admin layout, role gate)
│   │   │   ├── admin/
│   │   │   │   └── page.tsx        (admin dashboard overview)
│   │   │   └── admin/content/
│   │   │       ├── page.tsx        (content list, CRUD)
│   │   │       ├── new/
│   │   │       │   └── page.tsx    (create content form)
│   │   │       └── [id]/
│   │   │           └── page.tsx    (edit content form)
│   │   └── api/
│   │       ├── webhooks/
│   │       │   └── stripe/
│   │       │       └── route.ts    (Stripe webhook handler)
│   │       └── stripe/
│   │           ├── checkout/
│   │           │   └── route.ts    (create checkout session)
│   │           └── portal/
│   │               └── route.ts    (create customer portal session)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── card.tsx
│   │   └── layout/
│   │       ├── wordmark.tsx        (CULTIVATE text mark)
│   │       ├── sidebar.tsx         (dashboard sidebar nav)
│   │       └── footer.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts           (browser client)
│       │   ├── server.ts           (server client)
│       │   └── admin.ts            (service role client for webhooks)
│       ├── stripe.ts               (Stripe client init)
│       └── utils.ts                (clsx helper, formatDate, etc.)
```

---

## Environment Variables

Create `.env.local.example` with these keys (no values):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
KIT_API_KEY=
KIT_FORM_ID=
NEXT_PUBLIC_SITE_URL=https://cultivate.shaqhardy.com
```

---

## Future Phases (Architect for Now, Build Later)

Design the database and role system to accommodate these. Do not build them yet.

- **Phase 2:** Booking Manager dashboard (7-stage event workflow, Stripe deposit, event host portal)
- **Phase 3:** Discussion/community features (comments, forums, or community feed)
- **Phase 4:** Merch store (Stripe products, shipping integration)

---

## Execution Instructions

Build everything listed in Phase 1 in a single pass. Here's the order:

1. Initialize the Next.js 15 project with App Router, TypeScript, Tailwind CSS v4
2. Set up the global CSS with brand colors, fonts, and Tailwind v4 theme config
3. Create all Supabase SQL migration files
4. Build the Supabase client utilities (browser, server, admin)
5. Build the middleware (session refresh, route protection)
6. Build the auth callback route handler
7. Build the auth pages (login, signup) with email/password and Google OAuth
8. Build the reusable UI components (button, input, badge, card)
9. Build the layout components (wordmark, sidebar, footer)
10. Build the dashboard layout and all dashboard pages (library, single content view, my-library, settings)
11. Build the admin layout (role-gated) and admin pages (dashboard, content CRUD)
12. Build the Stripe integration (checkout route, portal route, webhook handler)
13. Build the landing page (public, for unauthenticated visitors)
14. Create the `.env.local.example` and `.gitignore`

Do not ask me for credentials during the build. Use environment variables everywhere. I will plug in the real values after.

Every page should be fully functional with real Supabase queries (not placeholder data). The content library should query the `content` table. The admin dashboard should have working forms that insert/update/delete content. The Stripe webhook should update the `subscriptions` table and the user's role in `profiles`.

Make it clean. Make it feel like the brand.
