# Project conventions

## Purpose
Build Trendy Nisa Rebuild as an original, client-ready ecommerce application inspired by the reference site's broad shopping category and experience. Do not reuse its proprietary copy, images, or branding, and do not suggest affiliation.

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
