/**
 * MOV → looping GIF for #hero background (palette, cover-friendly width).
 * Usage: node tools/mov-to-hero-gif.mjs [input.mov] [output.gif]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const input =
  process.argv[2] ??
  path.join(process.env.USERPROFILE || '', 'Downloads', 'Flicker_2.mov');
const output = process.argv[3] ?? path.join(root, 'assets', 'hero-flicker.gif');

if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
  console.error('ffmpeg-static binary not found.');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error('Input not found:', input);
  process.exit(1);
}

fs.mkdirSync(path.dirname(output), { recursive: true });

const vf = [
  'fps=12',
  'scale=1280:-1:flags=lanczos',
  'split[s0][s1]',
  '[s0]palettegen=max_colors=128:stats_mode=diff[p]',
  '[s1][p]paletteuse=dither=floyd_steinberg:diff_mode=rectangle',
].join(',');

const args = ['-y', '-i', input, '-vf', vf, '-loop', '0', output];

const r = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
process.exit(r.status === 0 ? 0 : r.status ?? 1);
