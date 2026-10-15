# AMIRA Collection — Project Status

## Completed
- Initialized a React + Vite JavaScript application in the project root.
- Installed React, Vite, the React Vite plugin, Tailwind CSS, and its Vite plugin.
- Added a responsive fashion storefront home page with promotion bar, navigation and search, hero, category edits, new arrivals, editorial promotions, newsletter preview, and footer.
- Added a 12-piece original placeholder catalog with category filtering, search, sorting, product cards, and product details with colour, size, quantity, and add-to-bag options.
- Added hash-based navigation between home, collection, product, and cart screens without adding dependencies.
- Added a local-storage cart with line item options, quantity updates, removal, subtotal, shipping-threshold preview, and empty state.
- Added a Home link and route-aware active navigation states for home, collection, and product category routes.
- Removed collection category tabs from the collection toolbar and expanded the responsive product grid.
- Added a New Arrivals collection and eight working sort choices. Sorting uses stable catalog copies plus deterministic preview relevance, best-selling, and arrival-date metadata; these ranks are not real sales data.
- Added an original AMIRA Collection monogram SVG favicon.
- Added a small-screen hamburger navigation with accessible expanded/control state, active-route styling, keyboard link access, Escape-to-close, and link-selection close behavior; desktop navigation remains visible at larger widths.
- Removed Shop All from primary navigation and made bare `/collections` return home while retaining query-based search results.
- Kept SALE visible in the desktop nav and grouped Swimwear, Winter Collection, and Gift Items in a compact “More” dropdown; the mobile menu lists all collections directly.
- Added shared collection routes for Swimwear, Winter Collection, Gift Items, and SALE, including the same sorting and product-card behavior as existing collections.
- Added a separate hash-routed admin preview workspace with a dashboard, product CRUD/editor, collection configuration, homepage editor, store settings, and an honest orders-coming-soon screen.
- Added product search, category/status filters, sorting, form validation, confirmation before delete, SKU checks, variant/tag fields, inventory metadata, collection assignment, explicit sale controls, and ordered multiple image URLs with main-image selection.
- Connected admin products, collection titles/descriptions/status, featured collections and product selections, homepage announcement/hero/section visibility, store name/contact/social details, and currency to the public storefront data model.
- Added a versioned local-preview data service abstraction. Admin edits persist to this browser’s local storage and update public pages; this is not shared, hosted, backed up, or protected by login.
- Added `/admin/login` as an informational preview access page only. No credentials are accepted, and `/admin` is not protected because no backend or authentication provider is configured.
- Added admin routing, authentication-state, product validation/CRUD, collection assignment, SALE eligibility, and local data-service tests.
- Added demo collection assignments: Winter Collection has one knit set, Gift Items has two scarf accessories, SALE has one product with a valid existing compare-at price, and Swimwear uses the intentional empty state until swim products are supplied.
- Added the `@supabase/supabase-js` client and opt-in service layer selected only when Supabase mode and non-placeholder URL/publishable-key values are configured.
- Kept browser-local preview as the default. Supabase reads do not fall back to or seed local preview records; existing local storage remains untouched.
- Added a staff email/password sign-in flow with no public sign-up, a staff-role check for admin routes, and database reads constrained by RLS.
- Added `.env.example`; `.env.local` and other local environment files are ignored by Git. No real credentials or `.env.local` were created.
- Added a Supabase SQL migration for products, collections, collection memberships, homepage content, public store settings, staff roles, future orders, and RLS policies.
- Added a transaction-based `save_store_snapshot` function running with caller privileges so table RLS applies to admin saves. Supabase writes remain disabled by default and require an explicit environment flag after manual security checks.
- Added a private `product-images` Storage bucket with staff upload/update/delete policies and public access limited to images referenced by published products. Signed image reads are supported; the admin upload interface is not implemented.
- Added Supabase mode, write-gate, and migration-policy tests.
- Added responsive styles, keyboard focus visibility, a skip link, reduced-motion support, image error fallbacks, and empty/not-found states.
- Updated project handover notes for the implemented MVP.
- Rebranded the public storefront and admin workspace to AMIRA Collection, including the default store name, document title and description, admin marks, and original AC favicon. Existing local preview data is preserved; a prior default store name is migrated in memory to the new brand while custom store names remain unchanged.

## Current state
The storefront and local admin preview remain available. Supabase integration is prepared, but no project is configured or connected in this workspace. The migration has not been applied or tested against a live Supabase project, so RLS, sign-in, signed image reads, and remote CRUD still require project setup and verification. Keep `VITE_DATA_MODE=local` and `VITE_SUPABASE_ENABLE_WRITES=false` until that work is complete. Local edits are never copied into Supabase. No demo products, orders, credentials, or secrets were added to a database. Checkout, payments, inventory synchronization, customer accounts, order creation, and the image-upload interface remain unimplemented. Placeholder catalog copy/images and demo collection assignments need replacement before launch; Swimwear remains empty.

## Verification
- `npm install react react-dom` — completed.
- `npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite` — completed.
- `npm run build` — passed; Vite generated the production bundle in `dist`.
- `npm run dev` — Vite started and printed its local development address. The environment blocked the separate HTTP request used to check the page response.
- `npm test` — passed (14 checks); includes admin routes, preview auth behavior, product validation/CRUD helpers, collection assignment, featured selection consistency, sale eligibility, demo persistence, plus storefront navigation, filtering, sorting, and cart calculations.
- `npm run build` — passed after the admin panel changes (Vite production bundle generated without CSS warnings).
- Browser smoke check — opened `#/admin`, `#/admin/products`, `#/admin/login`, `#/admin/orders`, and `#/admin/settings` in the running local site and confirmed the expected screens and honest preview/no-orders notices render.
- `git diff --check` — passed; Git only printed line-ending conversion notices for existing CRLF/LF files.
- `npm install @supabase/supabase-js` — completed after approved package-registry access; npm audit reported 0 vulnerabilities.
- `npm test` — passed (18 checks), including Supabase opt-in mode, default write lock, staff-role login behavior, and migration policy-content checks.
- `npm run build` — passed. Vite reports a non-blocking bundle-size advisory because the Supabase client is included in the main bundle.
- Live Supabase migration, RLS, Auth, and Storage verification — not run because no Supabase project or credentials were supplied.
- AMIRA Collection rebrand verification — `npm test` passed (19 tests), `npm run build` passed, and `git diff --check` passed. Vite emitted its non-blocking large JavaScript chunk advisory (531.15 kB minified).
- GitHub publication preparation — no remote is configured and GitHub CLI is not installed in this environment. Local commit can be prepared, but creating a private GitHub repository and pushing require GitHub access from the project owner.
- Vercel preview preparation — Vite build settings and hash-routing guidance are documented in README. No Vercel CLI is installed or authenticated here, so no hosted deployment has been created.

## Commands
- `npm install` — install dependencies.
- `npm run dev` — start the local development server.
- `npm run build` — create the production build in `dist`.
- `npm run preview` — preview the production build locally.

## Storefront routes
- `#/` — storefront home.
- `#/collections/new-arrivals` — new arrivals, with the same collection sort options.
- `#/collections/dresses`, `#/collections/abayas`, `#/collections/sets`, `#/collections/scarves`, `#/collections/swimwear`, `#/collections/winter-collection`, `#/collections/gift-items`, and `#/collections/sale` — focused collections; bare `#/collections` returns home and `#/collections?q=...` displays search results.
- `#/product/:id` — product details and add-to-bag options.
- `#/cart` — saved cart, quantity controls, subtotal, and empty state.
- `#/admin/login` — local preview information by default; optional Supabase email/password staff sign-in after project configuration. No sign-up route exists.
- `#/admin` — local preview dashboard by default; Supabase mode checks authenticated staff role before rendering. Sections are available at `#/admin/products`, `#/admin/collections`, `#/admin/homepage`, `#/admin/orders`, and `#/admin/settings`.

## Next tasks
1. Create the Supabase project, apply `supabase/migrations/20261015000000_store_backend_foundation.sql`, configure `.env.local`, invite the first admin, and manually test anonymous/non-staff/staff RLS behavior before enabling remote writes.
2. Implement the admin product-image upload UI and verify private Storage uploads and signed-image rendering in the connected project.
3. Replace preview photography, catalog, prices, colour/size details, preview sales/relevance ranks and arrival dates, shipping threshold, and policy text with approved brand content. Add approved swimwear inventory; the current Swimwear collection intentionally shows an empty state.
4. Implement checkout, payment provider webhooks, tax/shipping calculation, transactional email, and durable order creation/management.
5. Connect newsletter sign-up to an approved email service and add privacy/consent handling.
6. Add browser-level admin interaction/responsive tests, analytics, backups, and deployment configuration.
7. Publish the verified project to a private GitHub repository and import it into Vercel for a preview deployment. GitHub CLI is not installed and no remote is configured, so repository creation and push still require GitHub access.
