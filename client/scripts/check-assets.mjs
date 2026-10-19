import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');
const missing = [];
const filesToCheck = ['og-image.jpg','favicon.svg','favicon-32.png','favicon-180.png','favicon-192.png','favicon-512.png','manifest.webmanifest','robots.txt','sitemap.xml'];
for (let i=0; i<filesToCheck.length; i++) {
  const f = filesToCheck[i];
  if (!fs.existsSync(path.join(distDir, f))) {
    missing.push(f);
  }
}
if (missing.length > 0) {
  console.error('Missing assets in dist:', missing.join(', '));
  process.exit(1);
}
console.log('All assets OK');
