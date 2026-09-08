# Cotonel — catalog site with admin panel

Browse-and-order storefront (no cart, no checkout — just a WhatsApp button
per product) plus a private `/admin` area to add, edit, and delete products
with photo uploads.

## What you need

- A MongoDB Atlas connection string (reuse your existing account — just
  create a new database inside it, e.g. `cotonel`)
- An UploadThing account (free tier is plenty) — used to host product photos
- Node.js installed locally

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — your connection string
   - `UPLOADTHING_TOKEN` — from your UploadThing dashboard under **API Keys**
   - `AUTH_SECRET` — generate one with `openssl rand -base64 32`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the login you'll use for
     `/admin` (password must be 8+ characters)

2. Install dependencies:
   ```
   npm install
   ```

3. Create your admin login (reads the two SEED_ADMIN_* values above):
   ```
   npm run seed-admin
   ```
   You can delete the `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` lines from
   `.env` after this — they're only used by that one command. Re-run it any
   time to reset your password.

4. Run it locally:
   ```
   npm run dev
   ```
   Storefront: http://localhost:3000
   Admin: http://localhost:3000/admin/login

## Using the admin panel

- **Add product**: photo, name, price (optional), category. The photo
  uploads straight to UploadThing.
- **"Use as this category's large homepage photo"**: each category section
  on the homepage shows one large lifestyle-style photo — check this box on
  whichever product should be that photo (usually your best shot in that
  category). If none are marked, the most recent product's photo is used.
- **Edit / Delete**: from the product list at `/admin`.
- Categories themselves (the 5 sections: Lingerie, Sleepwear, Bedding,
  Baby, Sportswear) are defined in `src/data/categories.ts` if you ever
  want to rename, reorder, or add one — that part still requires editing
  code and redeploying, since sections change far less often than products.

## Deploy

1. Push to GitHub, connect the repo to Vercel (same as your other
   projects).
2. In Vercel's project settings → Environment Variables, add every value
   from your `.env` **except** the `SEED_ADMIN_*` ones (not needed in
   production — see below).
3. Deploy.
4. Run the admin-seed step once against your production database — easiest
   way is to temporarily add `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` to a
   local `.env` pointed at the same `MONGODB_URI` as production, run
   `npm run seed-admin` locally, then remove them again. This creates the
   admin login directly in the shared database, so you don't need to run
   anything on Vercel itself.
5. Log in at `yoursite.com/admin/login`.
