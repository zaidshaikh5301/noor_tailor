# Noor Tailor Client

React + TypeScript + Vite frontend for Noor Tailor.

## Quick Start

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Type-check + build for production (generates sitemap)
- `npm run preview` — Preview production build
- `npm run lint` — Run Oxlint
- `npm run optimize-images` — Convert images to WebP (run after adding photos)

## Project Structure

```
client/
├── public/
│   ├── images/products/     # Product photos (source images)
│   ├── favicon.svg          # SVG favicon (N monogram)
│   ├── favicon-*.png        # Generated PNG favicons
│   ├── og-image.jpg         # Open Graph image (1200×630)
│   ├── manifest.webmanifest # PWA manifest
│   ├── robots.txt           # Robots.txt
│   ├── sitemap.xml          # Generated at build
│   └── _redirects           # SPA redirect for Netlify
├── src/
│   ├── components/          # ProductCard, etc.
│   ├── config/
│   │   └── shop.ts          # Single source of truth for shop details
│   ├── context/             # StoreContext (cart, wishlist, coupons)
│   ├── data/                # Typed mock catalog (products, categories, etc.)
│   ├── hooks/               # useStore
│   ├── services/            # API/mock service layer
│   │   ├── apiClient.ts     # Core fetch with VITE_USE_API flag
│   │   ├── catalog.ts       # Products, FAQs, categories
│   │   ├── orders.ts        # Order building (mock + API)
│   │   ├── appointments.ts  # Tailoring appointments
│   │   ├── coupons.ts       # Coupon validation (NOOR10 = 10%)
│   │   └── contact.ts       # Contact form
│   ├── types/               # Shared TypeScript types
│   ├── utils/
│   │   ├── whatsapp.ts      # WhatsApp URL/message builders
│   │   ├── imagePaths.ts    # WebP/thumbnail path helpers
│   │   ├── paths.ts         # Route path helpers
│   │   └── productFallback.ts # Image error handling
│   ├── App.tsx              # All routes and page components
│   └── main.tsx             # Entry point
├── scripts/
│   ├── optimize-images.mjs  # Sharp-based image optimizer
│   ├── generate-sitemap.mjs # Sitemap generator
│   ├── verify-products.ts   # Product data validation
│   └── verify-images.ts     # Image reference validation
├── index.html               # SEO, OG, JSON-LD, favicons
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Key Concepts

### Production Mode (`VITE_USE_API=false`)

- Services in `src/services/` read directly from local mock data
- No `fetch` calls, no retry delays, no console errors
- Set in `.env.production` and Netlify build env

### WhatsApp Integration

All user actions (checkout, product enquiry, tailoring appointment, contact form) open WhatsApp with pre-filled messages via `src/utils/whatsapp.ts`.

### Image Handling

- Source images in `public/images/products/` (JPG/PNG)
- Run `npm run optimize-images` to generate WebP + thumbnails
- Components use `<picture>` with `srcset` for responsive loading
- Hero image: `loading="eager" fetchpriority="high"`
- Others: `loading="lazy"`

### Shop Configuration

Edit `src/config/shop.ts` for:
- Name, tagline, WhatsApp number (digits only, international format)
- Phone, email, address lines, city, state, pincode
- Opening hours, Google Maps URL, Instagram URL
- Site URL, currency

### Adding Products

Edit `src/data/products.ts` — follow the existing `make()` pattern. Add product image to `public/images/products/{slug}.jpg` then run `npm run optimize-images`.

## Netlify Deployment

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment: `VITE_USE_API=false` (set in `.env.production`)

No `VITE_API_BASE_URL` required.