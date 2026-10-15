# Project conventions

## Purpose
Build AMIRA Collection as an original, client-ready ecommerce application inspired by the reference site's broad shopping category and experience. Do not reuse its proprietary copy, images, or branding, and do not suggest affiliation.

## Stack and structure
- Use React, JavaScript, and Vite. Use Tailwind CSS for utility styling, with shared CSS for global rules and reusable design tokens.
- Keep route-level screens in `src/pages`, reusable UI in `src/components`, sample content in `src/data`, shared helpers in `src/utils`, and global styles in `src/styles`.
- Prefer small components with clear responsibilities. Keep product and business content out of layout components.
- Use semantic HTML, keyboard-accessible interactions, visible focus states, and responsive layouts.
- Product imagery and descriptions must be original placeholders until approved catalog content is supplied.

## Development
- Install dependencies with `npm install`.
- Start the local development server with `npm run dev`.
- Create a production build with `npm run build`; preview it with `npm run preview`.
- Keep `README.md` and `PROJECT_STATUS.md` current when project setup or milestones change.
- Do not add payment credentials, customer data, or secrets to source control.

## Admin and data
- Keep storefront product and collection data in the shared `StoreDataContext`; customer pages and admin screens must use the same model.
- Keep persistence behind `src/services`. The browser-local preview remains the default; the optional Supabase adapter uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` and must not silently import local preview data.
- Keep `VITE_SUPABASE_ENABLE_WRITES=false` until the database migration, staff authentication, and RLS behavior have been manually verified in the target Supabase project. Never seed placeholder catalog or order data into a live project.
- Keep SQL migrations in `supabase/migrations`. Public RLS reads must expose only published storefront content; catalogue/content writes require an authenticated staff role. The browser-only route guard is not a security boundary.
- Keep Supabase Storage private and restrict public object reads to image paths referenced by published products. Do not claim an upload UI works until it is implemented and tested.
- Do not present local preview admin as authenticated or production-secure. Never add hardcoded credentials, client-side access flags presented as security, service-role keys, or private values to frontend code.
- Do not create sample orders or claim payment, checkout, inventory, or image uploads work unless a real service is connected.
- SALE membership must come from an explicit sale flag or a valid compare-at price greater than the current price. Keep preview ranking data visibly labelled as preview data.
- Admin screens should stay keyboard accessible, labelled, and responsive. Keep admin layout separate from the public storefront shell.
