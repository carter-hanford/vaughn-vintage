import sharp from "sharp";
import { writeFileSync, renameSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logoPath = join(__dirname, "..", "assets", "logo.png");
const tmpPath = join(__dirname, "..", "assets", ".logo.png.tmp");

/** Pixels darker than this (avg RGB) fade to transparent — soft edge for anti-alias. */
const THRESH = 40;
const img = sharp(logoPath).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) {
  console.error("Expected RGBA");
  process.exit(1);
}
const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const r = out[i];
  const g = out[i + 1];
  const b = out[i + 2];
  const lum = (r + g + b) / 3;
  if (lum <= THRESH) {
    const fade = lum <= 0 ? 0 : Math.min(1, lum / THRESH);
    out[i + 3] = Math.round(out[i + 3] * fade);
  }
}
const png = await sharp(out, { raw: { width, height, channels: 4 } })
  .png()
  .toBuffer();
writeFileSync(tmpPath, png);
try {
  unlinkSync(logoPath);
} catch {
  /* ignore if missing */
}
renameSync(tmpPath, logoPath);
console.log("Updated", logoPath, `${width}x${height}`);
