# Noor Tailor

Editorial menswear storefront for a New Delhi tailoring house. The repository is arranged as a MERN-ready workspace: the implemented React client and an intentionally empty planned server (README only).

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Setup

```sh
npm install
npm run dev
```

Vite prints the local development URL. Use `npm run build` for the production client bundle, `npm run lint` for Oxlint, and `npm run typecheck` for TypeScript project checking. From `client`, `npm run dev`, `npm run build`, and `npm run lint` are also available.

## Structure

```text
client/
  public/images/products/   Expected product photography (see IMAGE_CHECKLIST.md)
  src/
    components/             Product card and shared UI
    context/                Persistent cart and wishlist state
    data/                   Typed local catalog and editorial content
    pages/                  Route views (implemented in App.tsx)
    services/               Promise-based mock data access boundary
    types/                  Shared TypeScript models
server/
  README.md                 Planned architecture; no server implementation
```

## How to swap mock services for a real API later

Keep components and state consumers calling `client/src/services/catalog.ts`. Replace the mock imports and simulated delays in that service with typed API requests, then map server responses to the existing `Product` model. Do not add `fetch` or an HTTP client to components. The catalog, FAQs, collection content, and store details currently live in typed local data files, and the server folder intentionally contains no runtime code.

All checkout and appointment submissions are local demonstrations; checkout does not collect payment. Coupon `NOOR10` applies a 10% cart discount.
