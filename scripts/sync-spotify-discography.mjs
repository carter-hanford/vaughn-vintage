/**
 * Fetches public albums/singles for the configured Spotify artist and writes
 * assets/discography.json for the static site to render.
 *
 * Setup:
 * 1. Create an app at https://developer.spotify.com/dashboard
 * 2. Copy .env.example to .env and set SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET
 * 3. Run: npm run spotify:sync
 *
 * On GitHub: add SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET as repository secrets only
 * (Settings → Secrets and variables → Actions). The workflow in .github/workflows/ runs this
 * script in CI — credentials never live in the repo.
 */

import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Vaughn Vintage — from https://open.spotify.com/artist/4Nemo6ldmLmtlszRmUhaNs */
const ARTIST_ID = "4Nemo6ldmLmtlszRmUhaNs";
const ARTIST_URL = `https://open.spotify.com/artist/${ARTIST_ID}`;

function loadDotEnv() {
  try {
    let text = readFileSync(join(ROOT, ".env"), "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key) process.env[key] = val;
    }
  } catch {
    /* no .env */
  }
}

async function getAccessToken(clientId, clientSecret) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function fetchAllAlbums(token) {
  const byId = new Map();
  let url = `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single,ep,compilation&market=US&limit=50`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Albums request failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    for (const item of data.items || []) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    url = data.next;
  }

  return [...byId.values()];
}

function normalizeAlbums(items) {
  return items
    .map((a) => ({
      id: a.id,
      name: a.name,
      albumType: a.album_type,
      releaseDate: a.release_date,
      releaseDatePrecision: a.release_date_precision,
      spotifyUrl: a.external_urls?.spotify || ARTIST_URL,
      /* Spotify returns images largest-first; [0] is highest resolution */
      imageUrl: a.images?.[0]?.url || a.images?.[1]?.url || null,
      totalTracks: a.total_tracks ?? null,
    }))
    .sort((x, y) => {
      const dx = x.releaseDate.length === 4 ? `${x.releaseDate}-01-01` : x.releaseDate;
      const dy = y.releaseDate.length === 4 ? `${y.releaseDate}-01-01` : y.releaseDate;
      return dy.localeCompare(dx);
    });
}

loadDotEnv();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.\n\n" +
      "1. Open https://developer.spotify.com/dashboard and log in.\n" +
      "2. Create an app (any name). Open it → copy Client ID and Client Secret.\n" +
      "3. In this project folder, copy .env.example to .env (exact name .env — not .env.txt).\n" +
      "4. Paste:\n" +
      "   SPOTIFY_CLIENT_ID=paste_here\n" +
      "   SPOTIFY_CLIENT_SECRET=paste_here\n" +
      "5. Run: npm run spotify:sync\n"
  );
  process.exit(1);
}

const token = await getAccessToken(clientId, clientSecret);
const rawAlbums = await fetchAllAlbums(token);
const albums = normalizeAlbums(rawAlbums);

const payload = {
  artistId: ARTIST_ID,
  artistUrl: ARTIST_URL,
  syncedAt: new Date().toISOString(),
  albums,
};

const outPath = join(ROOT, "assets", "discography.json");
writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${albums.length} releases to ${outPath}`);
