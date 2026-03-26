/**
 * Build logo@2x.png and logo@3x.png from assets/logo.png (Lanczos upscale).
 * Run: node tools/generate-logo-variants.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'logo.png');

const meta = await sharp(src).metadata();
const w = meta.width;
const h = meta.height;
if (!w || !h) {
  console.error('Could not read logo dimensions');
  process.exit(1);
}

for (const scale of [2, 3]) {
  const out = path.join(root, 'assets', scale === 2 ? 'logo@2x.png' : 'logo@3x.png');
  await sharp(src)
    .resize(Math.round(w * scale), Math.round(h * scale), {
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(out);
  console.log('Wrote', path.relative(root, out));
}
