# Arenas Cards

Portfolio rebuild of **Arenas Pass / Arenas Cards** — a multi-tenant digital wallet platform for gift cards, loyalty cards, memberships, and punch cards.

Original stack: Angular + ASP.NET Core Web API + SQL Server.  
This rebuild: **Angular 19**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth + RLS)**.

The live UI runs in **demo mode** out of the box (no cloud keys required) so you can walk a recruiter through merchant → issue → customer QR → redeem → ledger. Point `environment.ts` at a Supabase project to use real Postgres.

## Product

| Role | Path | What you can do |
|------|------|-----------------|
| Merchant | `/app` | Design pass templates, issue to customers, redeem by serial/email, ledger, POS keys |
| Customer | `/wallet` | Digital wallet with QR passes |
| Super Admin | `/admin` | Tenants, users, platform vault |
| Sales Rep | `/sales` | Assigned merchants |
| Developer | `/app/developer` | Public/private API keys |

Demo password for every seeded user: **`demo1234`**

- `merchant@arenascards.com` — Sunset Cafe
- `customer@arenascards.com` — Lena's wallet
- `admin@arenascards.com` — platform
- `sales@arenascards.com` — AE book
- `developer@arenascards.com` — POS keys

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste `supabase/migrations/20240913000001_init.sql`.
3. Authentication → add users (or sign up in the app). The `handle_new_user` trigger creates `profiles`, and merchants also get a `tenants` row, vault, and API keys.
4. Put your project URL and anon key in `src/app/core/environment.ts`:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
};
```

When both values are non-empty, the app uses Supabase Auth and Postgres instead of the in-browser demo store. Templates upsert into `wallet_passes`; issue/redeem call the `assign_pass` and `redeem_pass` RPCs.

## What was rebuilt vs dropped

**Kept (core product):** multi-tenant merchants, four pass types, live designer, issue/redeem ledger, customer wallet, sales-rep book, developer keys, marketing site.

**Dropped (legacy fork residue):** Pelican HRM screens, Zoom meetings, CMS/blog, Apple `.pkpass` certificate signing (needs an Apple Developer pass type ID — the UI still renders wallet-style passes and QR codes).

Original repos: [ArenasPass client](https://github.com/Muhammadkamranlive/ArenasPass) · [Arenas-Pass-Server](https://github.com/Muhammadkamranlive/Arenas-Pass-Server)

## Stack

- Angular 19 standalone components + signals
- Tailwind CSS 3
- `@supabase/supabase-js`
- Postgres enums, RLS, and RPCs (`assign_pass`, `redeem_pass`)
