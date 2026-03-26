/**
 * Raster VV mark for favicon / apple-touch. Uses Impact-style stack;
 * inline SVG in index.html uses the live web font for header/footer.
 */
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = join(__dirname, '..', 'assets');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <text x="32" y="45" text-anchor="middle"
    font-family="Impact, Haettenschweiler, Arial Black, Helvetica Neue, sans-serif"
    font-size="38" font-weight="700" fill="#ffffff">VV</text>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).resize(32, 32).png().toFile(join(assets, 'favicon.png'));
await sharp(buf).resize(180, 180).png().toFile(join(assets, 'apple-touch-icon.png'));
console.log('Wrote assets/favicon.png, assets/apple-touch-icon.png');
