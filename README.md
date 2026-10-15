# Trendy Nisa Rebuild

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
- `src/data` — placeholder categories and product catalog
- `src/utils` — route parsing and shared helpers
- `src/styles` — global styles and Tailwind entry
- `AGENTS.md` — conventions for future coding agents
- `PROJECT_STATUS.md` — current milestone and handover checklist

## Shopping routes
- `#/` — home
- `#/collections` — catalog with category filters, search, and sort options
- `#/product/:id` — product details, variant selection, quantity, and add to bag
- `#/cart` — persistent local cart, quantity updates, removal, and subtotal

## Handover and limitations
This is a frontend preview. The cart persists only in this browser using local storage. Checkout is disabled; there is no payment processing, inventory service, backend, order persistence, customer authentication, or connected newsletter. Product copy and prices, imagery, shipping threshold, size guidance, and policy messaging are placeholders; approve and replace them before launch. See `PROJECT_STATUS.md` for the next implementation milestones.
