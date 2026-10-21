import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'https://noortailor.netlify.app';
const TODAY = '2026-10-21';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.8', changefreq: 'weekly' },
  { path: '/shop/wedding', priority: '0.8', changefreq: 'weekly' },
  { path: '/shop/suits', priority: '0.8', changefreq: 'weekly' },
  { path: '/shop/kurtas', priority: '0.8', changefreq: 'weekly' },
  { path: '/shop/indo-western', priority: '0.8', changefreq: 'weekly' },
  { path: '/shop/festive', priority: '0.8', changefreq: 'weekly' },
  { path: '/tailoring', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/faq', priority: '0.8', changefreq: 'monthly' },
  { path: '/shipping', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/size-guide', priority: '0.6', changefreq: 'monthly' },
];

// Product slugs sourced from client/src/data/products.ts
const productSlugs = [
  'ivory-raw-silk-bandhgala','midnight-tuxedo','sand-linen-kurta','forest-nehru-jacket',
  'black-jodhpuri-set','wine-embroidered-sherwani','sage-short-kurta','cream-asymmetric-kurta',
  'cobalt-bandhgala-blazer','olive-three-piece-suit','stone-travel-blazer','black-formal-trouser',
  'white-cotton-kurta','indigo-pathani-set','rust-silk-kurta','cream-cape-kurta',
  'black-kurta-jacket','blue-asymmetric-set','maroon-groom-sherwani','sand-groomsmen-waistcoat',
  'midnight-groom-jodhpuri','ivory-wedding-stole','saffron-festive-kurta','navy-festive-bandhgala',
  'ecru-puja-kurta','terracotta-sangeet-set','ivory-pearl-groom-sherwani','emerald-velvet-jodhpuri',
  'yellow-embroidered-festive-kurta','red-yellow-bandhani-kurta','img-4126','img-4128','img-4138',
  'img-4141','img-4192','img-4472','img-4473','img-4923','img-5002','img-5124','img-5132',
  'img-5145','img-5214',
];

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

const urls = [];
for (const r of staticRoutes) {
  urls.push(`  <url>
    <loc>${escapeXml(BASE + r.path)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`);
}
for (const slug of productSlugs) {
  urls.push(`  <url>
    <loc>${escapeXml(BASE + '/product/' + slug)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`Wrote ${outPath} with ${urls.length} URLs`);