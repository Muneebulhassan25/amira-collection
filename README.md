# AMIRA Collection

An original fashion ecommerce storefront MVP built with React, JavaScript, Vite, and Tailwind CSS. The interface uses an independent studio identity and placeholder catalog content. It is not affiliated with or a reproduction of the reference store.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Setup
From this project folder, install dependencies:

```sh
npm install
```

## Development
Start Vite's local development server:

```sh
npm run dev
```

Open the local address printed in the terminal. Vite refreshes the page as files change.

## Production build
Create an optimized build in `dist`:

```sh
npm run build
```

Preview that build locally:

```sh
npm run preview
```

Run the lightweight route, catalog, and cart logic checks:

```sh
npm test
```

## Project map
- `src/components/layout` — announcement bar, header, and footer
- `src/components/ui` — product cards, images, and section headings
- `src/pages` — home, catalog, product detail, and cart screens
- `src/context` — local cart state and persistence
- `src/context/StoreDataContext.jsx` — shared storefront/admin catalog, collection, homepage, and store settings model
- `src/services` — replaceable local-preview data and auth service abstractions
- `supabase/migrations` — database schema, staff-only RLS policies, transactional catalog save RPC, future orders table, and private image bucket rules
- `src/components/admin` and `src/pages/admin` — admin UI with local preview mode and optional Supabase staff access
- `src/data` — placeholder categories and product catalog
- `src/utils` — route parsing and shared helpers
- `src/styles` — global styles and Tailwind entry
- `AGENTS.md` — conventions for future coding agents
- `PROJECT_STATUS.md` — current milestone and handover checklist

## Shopping routes
- `#/` — home
- `#/collections/new-arrivals` — New Arrivals
- `#/collections/dresses`, `#/collections/abayas`, `#/collections/sets`, `#/collections/scarves` — existing collections
- `#/collections/swimwear`, `#/collections/winter-collection`, `#/collections/gift-items`, `#/collections/sale` — new collections
- `#/collections?q=...` — search results; an unfiltered `/collections` route returns home because there is no Shop All page
- `#/product/:id` — product details, variant selection, quantity, and add to bag
- `#/cart` — persistent local cart, quantity updates, removal, and subtotal

Collection sorting supports relevance, preview best sellers, alphabetical order, price, and arrival date. The dates and ranks are deterministic preview metadata in `src/data/products.js`; replace them with approved catalog and sales data before launch. Swimwear currently has no demo products, Winter Collection has one knit set, Gift Items has two scarf accessories, and SALE has one product with an existing valid compare-at price. These are demo assignments, not client inventory. The original SVG monogram favicon is served from `public/amira-collection-mark.svg`.

The desktop navigation keeps SALE visible and groups Swimwear, Winter Collection, and Gift Items under “More” to preserve comfortable link spacing. The mobile hamburger lists every collection directly.

## Admin preview
- `#/admin/login` — local preview information by default; becomes an email/password staff sign-in when Supabase mode is configured. There is no public sign-up.
- `#/admin` — dashboard. Other screens: `#/admin/products`, `#/admin/collections`, `#/admin/homepage`, `#/admin/orders`, and `#/admin/settings`.
- Product management supports add/edit/delete, search/filter/sort, validation, preview publication status, price and compare-at fields, variants, SKU, stock metadata, collection assignment, merchandising flags, tags, and ordered image URLs with a selected main image.
- Collection management supports titles, descriptions, image URLs, visibility, homepage placement, and product assignment. New Arrivals follows the product flag; SALE is derived from an explicit sale flag or a compare-at price greater than the current price.
- Homepage controls update the existing announcement, hero, supported section visibility, and featured collection/product selections. Store settings update the public store name, contact/social links, and currency.
- In local mode, changes save in this browser’s local storage under a versioned preview service and immediately feed the public storefront data model in this browser. They are not shared with other devices, customers, or a hosted store. Supabase mode instead reads its existing database snapshot and never imports this local data.
- The Orders screen intentionally shows no fabricated records. Checkout is disabled, and there is no order or payment service.

## Production requirements for admin
The project now has a prepared Supabase integration, but no Supabase project is connected yet. Use a publishable key in browser code and keep database access safe with RLS. Supabase documents [publishable API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth](https://supabase.com/docs/guides/auth), and [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control). Never put a service-role or secret key in a `VITE_*` variable.

### Connect a Supabase development project

1. Create a Supabase project in the Supabase dashboard. A project can have usage limits or pricing; review Supabase’s current plan details before selecting a plan.
2. Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`). Replace the URL and publishable key with values from the project’s Connect dialog. Keep `VITE_DATA_MODE=local` while setting up, and keep `VITE_SUPABASE_ENABLE_WRITES=false`. `.env.local` is ignored by Git.
3. In the Supabase dashboard SQL Editor, open and run [`supabase/migrations/20261015000000_store_backend_foundation.sql`](supabase/migrations/20261015000000_store_backend_foundation.sql). It creates products, collections, product-to-collection membership, homepage content, public store settings, staff roles, an empty future-orders table, RLS policies, a transaction-based staff snapshot-save function, and a private `product-images` bucket. It does not insert sample products, customer orders, or users.
4. In Supabase Auth settings, enable the sign-in method you intend to use and turn off public sign-ups. Invite/create the first staff user from the dashboard’s Auth users screen. There is no public staff sign-up route in this app.
5. In the SQL Editor, grant the invited user the first admin role. Replace the email placeholder with that user’s email:

   ```sql
   insert into public.staff_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'ADMIN_EMAIL_HERE'
   on conflict (user_id) do update set role = excluded.role;
   ```

6. Before enabling writes, verify with the project’s publishable key that anonymous requests can read published records only and cannot write; verify a signed-in non-staff account cannot write; and verify the invited staff account can read drafts and make permitted catalog changes. SQL Editor queries run with elevated database access and do not prove client RLS behavior. Review the policies in the migration against your intended roles.
7. Once the schema, staff login, and RLS checks pass, set `VITE_DATA_MODE=supabase`. Public storefront content then comes from Supabase. Admin writes remain off until you deliberately set `VITE_SUPABASE_ENABLE_WRITES=true`. Restart Vite after changing environment values. Keep a backup/export before enabling writes.

### Backend connection limits

- Local preview remains the default, and existing browser-local admin data is not copied, replaced, or deleted when Supabase mode is selected. Supabase mode starts from records already in the database; it does not seed the preview catalog.
- The new staff login has no sign-up route. The admin screens require a staff role in Supabase, while database RLS remains the actual authorization boundary.
- Database migrations are prepared in the repository but have **not** been applied to a Supabase project or tested against live RLS. Do not enable writes until you complete the checks above.
- The `product-images` bucket is private. For future uploaded assets, save `storage://product-images/<object-path>` references in product `image_url`/`images`, collection `image_url`, or homepage `heroImageUrl`; the adapter requests expiring signed URLs. Migration policies allow staff uploads and reads plus access to objects referenced by published products. The admin image field still accepts URLs; upload controls are not implemented yet.
- Orders remain empty. The schema is a future placeholder only; checkout, payment verification, customer self-service, and order creation/management are not connected.
- Homepage content and settings are public storefront fields; never add secrets or private operational values to these tables.
- Admin saves use a single database RPC transaction after writes are enabled. Authenticated staff checks in the interface improve navigation, but the RLS rules and function grants protect the database if the frontend is bypassed.

## Handover and limitations
With the default local mode, the cart and admin edits persist only in this browser using local storage, and admin access is not protected. Supabase auth and RLS are prepared but do not become active until a project is configured and the migration is applied. Checkout is disabled; there is no payment processing, inventory service, order persistence, customer account flow, image upload UI, or connected newsletter. Product copy and prices, imagery, shipping threshold, size guidance, and policy messaging are placeholders; approve and replace them before launch. `npm test` runs the storefront and admin service/model checks; `npm run build` creates the production frontend bundle. See `PROJECT_STATUS.md` for the current milestone and handover checklist.

## Client preview deployment (Vercel)
This is a design and functionality preview. Authentication, database access, image uploads, checkout, and payments have not been verified for production. Keep Supabase in local mode and do not add real secrets to Vercel.

After the private GitHub repository is connected:

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import the private `amira-collection-storefront` repository from GitHub and authorize access to that repository when prompted.
3. Keep the detected Vite settings, or set the build command to `npm run build` and output directory to `dist`. No rewrite rules are needed because app pages use hash routes.
4. Leave environment variables unset for Supabase, or explicitly keep `VITE_DATA_MODE=local` and `VITE_SUPABASE_ENABLE_WRITES=false`. Never add a service-role key or secret to Vercel frontend variables.
5. Select **Deploy**. Vercel will provide a preview URL; test the home page, collection links, product pages, and cart at that address before sharing it as a preview.

Vercel setup needs a Vercel account and GitHub repository access. The repository has not been published from this workspace yet.

## Local secrets and environment files
`.env.local`, other `.env.*` files, Vercel project metadata, and common key/token files are ignored by Git. `.env.example` contains placeholders only. Keep real Supabase values out of commits and do not enable Supabase mode or writes until the live project security checks are complete.
