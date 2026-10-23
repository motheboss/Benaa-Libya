# Benaa Libya — Partner Website

Next.js 15 (App Router) · TypeScript · Supabase (auth, database, storage) · Tailwind CSS · shadcn/ui-style components · deploys to Vercel.
Buyers and suppliers use the website. Drivers who log in are shown a QR code for the mobile app. The backend is the Supabase project from the mobile-app module (schema v2 + the *Contact for pricing* migration). This repo contains no database schema and no mobile code.

## Folder structure
```
middleware.ts                      refreshes the Supabase session, sends signed-out visitors to /login
src/
  app/
    layout.tsx, globals.css        fonts (Noto Kufi Arabic, IBM Plex), RTL/LTR, Benaa theme
    page.tsx                       / landing
    login/  register/  region/     public pages
    driver-redirect/               drivers: QR code to the mobile app
    buyer/      layout, page (dashboard), marketplace, suppliers, materials/[id], price-index,
                calculator (skeleton calculator + cost estimator tabs), delivery-request, projects
    supplier/   layout, page (dashboard), products, products/new, products/[id],
                delivery-jobs, orders, earnings, settings
  components/
    ui/        button, input, textarea, select, label, card, badge, switch, dialog, tabs, table
    brand/     arch-mark, triangle-band, logo
    layout/    app-shell (sidebar + mobile menu), i18n-provider, lang-toggle, sign-out-button
    shared/    page-header, empty-state, notice, field, trend-chip, status-badge, line-chart,
               contact-for-pricing, photo-uploader, job-card, delivery-form, offer-row
    auth/      login-form, register-form, region-picker, auth-layout, app-qr
    buyer/     skeleton-calculator, cost-estimator, save-to-project, project-actions
    supplier/  product-form, product-photos, delete-product-button, settings-forms
  lib/
    supabase/  client.ts (browser), server.ts (Server Components), middleware.ts
    data/      server-side reads, every region table filtered by region_id
    auth.ts, auth-client.ts        role detection (rpc_me) and role redirects
    ranking.ts                     Featured strip + trust ordering + "Contact for pricing" last
    calculator.ts                  skeleton calculator maths (coefficients come from the database)
    i18n/, format.ts               Arabic/English strings, Arabic-Indic digits, LYD
  types/db.ts
```

## Data flow
Server Components read through `lib/data/*` as the signed-in user (RLS applies). Forms are Client Components and write through the same RPC functions the mobile app uses (`rpc_supplier_upsert_listing`, `rpc_create_delivery_job`, `rpc_cancel_delivery_job`, `rpc_supplier_respond_job`, …), buyers' projects through their owner-only tables, and photos to Supabase Storage (`<bucket>/<user-id>/…`). The website never holds an admin key.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MOBILE_APP_URL` (where drivers get the app).
3. `npm run dev`
4. Supabase → Authentication → URL configuration: add `http://localhost:3000` and your Vercel domain as Site URL / redirect URLs. Phone sign-in needs an SMS provider enabled (same as the app).

## Deploy (Vercel)
Import the repo, add the three environment variables, deploy. No other settings are needed.

## Behaviour notes
- **Login:** email/password or phone code. After login the backend returns the role: buyer → `/buyer`, supplier → `/supplier`, driver → `/driver-redirect`. Admin accounts are signed out with a message (they use the Supabase dashboard).
- **Register:** buyer or supplier only (drivers use the app). City is chosen at registration; `/region` changes it later.
- **Ranking (from our discussion):** on a material page and on the suppliers page: Featured strip (max 3, labelled; set by you with `supplier_listings.is_featured`), then verified and price-transparent suppliers first, and "Contact for pricing" offers last. "Trust" is the verified badge plus price transparency for now, because reviews and completed deliveries are not in the backend yet.
- **Contact for pricing:** suppliers switch it on per product (price is then stored empty). Buyers see a button that opens WhatsApp, Messages or the dialer.
- **Orders** = delivery requests buyers addressed to this supplier (confirm or reject). **Delivery jobs** = jobs the supplier creates to request a driver, with the driver's progress shown. Drivers move jobs along in the mobile app; the website only creates, confirms/rejects, cancels and displays them.
- **Earnings** show what the backend recorded on delivery (after any commission set for the city; commission is 0% until you change it).
- Everything is Arabic by default (RTL) with an English toggle; numbers, dates and LYD use Arabic-Indic digits.

## Interpretations (please confirm)
- The calculator page holds both the skeleton calculator and the cost estimator as tabs, since the route list has only `/buyer/calculator`.
- A selected supplier opens inside `/buyer/suppliers?supplier=<id>` (no extra route).
- The Featured strip appears on material pages and the suppliers page, not on the marketplace grid.

## Not included (not requested)
Staff accounts, the quote flow, supplier-owned trucks, reviews, payments, driver features, dark mode.

## Status
Written without access to `npm install` or a build, so it has been syntax-checked only (89 files, 0 syntax errors) and not type-checked or run. Expect to fix a few type or import errors on first `npm run dev` / `npm run build`; send them over and I will fix them.
