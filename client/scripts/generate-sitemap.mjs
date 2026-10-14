import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '../src/data/products.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'client', 'public');
const BASE_URL = 'https://noortailor.netlify.app';

const staticRoutes = [
  '',
  '/shop',
  '/shop/wedding',
  '/shop/suits',
  '/shop/kurtas',
  '/shop/indo-western',
  '/shop/festive',
  '/tailoring',
  '/about',
  '/contact',
  '/faq',
  '/shipping',
  '/privacy',
  '/terms',
  '/size-guide',
  '/wishlist',
  '/cart',
  '/checkout',
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Static routes
  for (const route of staticRoutes) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += route === '' ? '    <priority>1.0</priority>\n' : '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }
  
  // Product routes
  for (const product of products) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/product/${product.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';
  
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log(`Sitemap generated with ${staticRoutes.length + products.length} URLs`);
}

generateSitemap();