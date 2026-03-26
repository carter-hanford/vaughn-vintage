# Vaughn Vintage — site

Static site (Spotify discography is loaded from `assets/discography.json` — public release metadata only, no API secrets).

## Public GitHub repo — keep credentials private

1. **Never commit `.env`**  
   It is listed in `.gitignore`. Your Spotify **Client ID** and **Client secret** stay on your machine for local `npm run spotify:sync` only.

2. **Never put real secrets in `.env.example`**  
   That file is meant to be committed as a template with empty values.

3. **GitHub Actions (production updates)**  
   In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`  

   The workflow [`.github/workflows/spotify-sync.yml`](.github/workflows/spotify-sync.yml) runs on pushes to `main`/`master`, daily, or manually (**Actions → Sync Spotify discography → Run workflow**). It writes `assets/discography.json` and commits it. Visitors only download that JSON and images from Spotify — not your credentials.

4. **If secrets were ever in a committed file**  
   Rotate the **Client secret** in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), update GitHub secrets and your local `.env`.

## Local preview

```bash
npm install
npm run dev
```

Refresh catalog from Spotify (requires local `.env`):

```bash
npm run spotify:sync
```

## GitHub Pages (live site on your phone)

This repo is a **static site** (`index.html` at the root, assets under `assets/`). Paths are relative, so it works as a **project site** (`https://YOUR_USER.github.io/REPO_NAME/`).

1. **Create a GitHub repo** and push this project (do **not** commit `node_modules/` or `.env` — they are gitignored).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. **Branch:** `main` (or `master`), **folder:** `/ (root)`, Save.
5. After a minute, open **`https://YOUR_USER.github.io/REPO_NAME/`** (replace with your username and repo name).

Optional: add a **custom domain** under the same Pages settings once DNS is configured.

The empty **`.nojekyll`** file disables Jekyll so GitHub serves your site as plain static files.

**Spotify tiles on Pages:** the site reads **`assets/discography.json`**. Commit that file, or set **repository secrets** and let [`.github/workflows/spotify-sync.yml`](.github/workflows/spotify-sync.yml) update it in Actions (see above).
