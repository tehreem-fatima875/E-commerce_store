# Avenoir storefront

## Architecture
- Next.js App Router pages and layouts live in `src/app`.
- Shared storefront UI lives in `src/components`.
- Static development-only catalogue data lives in `src/data`.
- Keep Shopify credentials and Storefront API calls server-only; never expose private tokens or cart identifiers to browser code.
- Development fixtures must be clearly identified as fixtures and must not claim live inventory, payment, or checkout.
- Set `NEXT_PUBLIC_SITE_URL` to the verified canonical storefront origin before exposing sitemap or canonical metadata.
- Shopify Storefront API code is server-only in `src/lib/shopify.ts`. Do not pass cart IDs, tokens, or checkout URLs through client props; validate checkout hosts before redirecting.

## Styling and accessibility
- Use the warm ivory, soft white, deep black, taupe, and subtle border design tokens in `src/app/globals.css`.
- Prefer semantic HTML, keyboard-accessible controls, visible focus states, and responsive layouts.
- Use Motion for purposeful animation and respect `prefers-reduced-motion`.
- Keep mobile navigation and interactive menus operable by keyboard and screen readers.

## Validation
- Run `npm run lint`, `npm run typecheck`, and `npm test` for relevant changes.
- Run `npm run build` before considering a release complete.
- Tests must use deterministic fixtures and must never create real orders or payments.
