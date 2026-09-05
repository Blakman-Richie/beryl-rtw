# Beryl RTW

An editorial React storefront and an admin dashboard foundation for **Beryl RTW — Elevated Ankara Ready-to-Wear**.

## What is included

- Responsive customer storefront with collection filtering, bag feedback, newsletter capture UI and deep `/admin` entry point.
- Admin workspace designed for non-technical product, collection and brand management.
- Working local admin editing: products and the logo persist in the browser while you prototype.
- A clean path to a free managed database and image storage through Supabase, rather than a database running on one personal computer.
- Vercel configuration for deployment as a React single-page application.

## Launch architecture

| Concern | Recommended production service |
| --- | --- |
| Storefront | Vercel + GitHub |
| Products, orders, admin login | Supabase (Postgres + Auth, free tier to start) |
| Product and logo images | Supabase Storage |
| Payments | OPay online gateway for Nigeria; add a second provider later for international checkout |
| Domain | `berylrtw.vercel.app` immediately; a `.com` domain is paid, not reliably free |

## First-time setup

1. Install dependencies: `pnpm install`
2. Start locally: `pnpm dev`
3. Create a Supabase project, add its public URL and anon key to `.env`, following `.env.example`.
4. Run `supabase/schema.sql` in the Supabase SQL editor, then create Beryl’s admin user in Authentication → Users.
5. Add Beryl’s WhatsApp number (digits only, including country code) as `VITE_WHATSAPP_NUMBER` to enable the bag’s reserve flow.
6. Connect the GitHub repository to Vercel. Vercel will deploy every change automatically.

## Important launch note

A Vercel website cannot use a database stored only on a personal laptop or desktop—when the computer is off or behind home internet, visitors cannot safely reach it. Keep local development data locally if desired, but use the managed database above for the live shop.
