# Noor Tailor

Editorial menswear storefront for a New Delhi tailoring house. The repository contains a React + TypeScript + Vite client that runs entirely on a local mock catalog in production (no backend deployed). Orders are placed via WhatsApp.

## Architecture

- **Client** (`client/`): React 18 + TypeScript + Vite + Tailwind CSS 4
  - Local mock catalog in `client/src/data/` (products, categories, FAQs, store info)
  - Service layer in `client/src/services/` with `VITE_USE_API` flag for API/mock switching
  - WhatsApp-based ordering (no payment gateway, no backend orders)
  - Deployed on Netlify at https://noortailor.netlify.app

- **Server** (`server/`): Express + TypeScript (optional, not deployed)
  - Planned for future use if API backend is needed
  - Currently contains models, controllers, routes for reference

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Setup

```sh
# Install dependencies
cd client && npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Optimize images (run once after adding new product photos)
npm run optimize-images
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_API` | `false` | Set to `true` to enable API calls (requires `VITE_API_BASE_URL`) |
| `VITE_API_BASE_URL` | `` | API origin for production builds (e.g., `https://api.noortailor.com`) |

For production on Netlify, `VITE_USE_API=false` is set in `.env.production` so the site runs entirely on the local mock catalog with no network requests.

## Key Files

- `client/src/config/shop.ts` — Single source of truth for shop details (name, phone, WhatsApp, address, hours, etc.)
- `client/src/data/products.ts` — Product catalog (edit to add/update products)
- `client/src/utils/whatsapp.ts` — WhatsApp message builders for orders, enquiries, appointments, contact
- `client/scripts/optimize-images.mjs` — Converts images to WebP (1600px + 600px thumbnail)
- `client/scripts/generate-sitemap.mjs` — Generates `public/sitemap.xml` from product data
- `netlify.toml` — Netlify build config, headers, redirects

## WhatsApp Ordering Flow

1. Customer adds items to bag
2. At checkout, fills in delivery details
3. Clicks "Send order request on WhatsApp" — opens WhatsApp with pre-filled message
4. Confirmation page asks "Yes, I sent it" before clearing the bag
5. Shop confirms availability, pricing, and delivery on WhatsApp

No payment is collected online. No order IDs are generated.

## Image Optimization

Run `npm run optimize-images` in `client/` after adding new product photos to `client/public/images/products/`. This creates:
- `image.webp` — max 1600px wide, quality 78
- `image-thumb.webp` — 600px wide, quality 78

Components use `<picture>` with `srcset` for responsive images. Hero image loads eagerly with `fetchpriority="high"`.

## SEO

- Per-page titles and meta descriptions via `document.title` and meta tag updates in `Shell` component
- Open Graph and Twitter cards with `og-image.jpg` (1200×630)
- JSON-LD: `LocalBusiness` (ClothingStore) on home/contact, `Product` on product pages
- `public/robots.txt` and `public/sitemap.xml` (auto-generated at build)

## Deployment (Netlify)

1. Connect repository to Netlify
2. Base directory: `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. No `VITE_API_BASE_URL` needed (using local mock catalog)

## TODOs (Fill in before launch)

See `TODO.md` or search for `// TODO: replace` in codebase. Key items:
- WhatsApp number in `client/src/config/shop.ts`
- Phone, email, address lines, city, state, pincode
- Opening hours
- Google Maps URL
- Product prices (items with price 0 show "Price on request")