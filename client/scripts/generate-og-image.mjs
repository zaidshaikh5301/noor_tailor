import sharp from 'sharp';

// Use the hero image (ivory-pearl-groom-sherwani) as base
const baseImage = 'public/images/products/ivory-pearl-groom-sherwani.webp';

// Create a simple overlay with the Noor Tailor text
const overlaySvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#263b32" opacity="0.6"/>
  <text x="600" y="300" text-anchor="middle" dominant-baseline="central" 
        font-family="Georgia, serif" font-size="72" font-weight="600" fill="#c9b896">NOOR TAILOR</text>
  <text x="600" y="370" text-anchor="middle" dominant-baseline="central" 
        font-family="Georgia, serif" font-size="28" fill="#fff">A Tailoring House</text>
</svg>
`;

sharp(baseImage)
  .resize(1200, 630, { fit: 'cover', position: 'center' })
  .composite([{
    input: Buffer.from(overlaySvg),
    top: 0,
    left: 0
  }])
  .jpeg({ quality: 85 })
  .toFile('public/og-image.jpg')
  .then(() => console.log('OG image created'))
  .catch(console.error);