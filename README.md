![Vaughn Vintage](assets/readme-cover.png)

# Professional Website for Vaughn Vintage.

- Single static page: root `index.html`, CSS and JS inline (no build step for the live site).
- Typography: DM Sans (body); display stack is Impact with Bebas Neue and condensed grotesque fallbacks (Google Fonts).
- Music: Spotify artist embed; album tiles from `assets/discography.json` (fetched at runtime). Optional `npm run spotify:sync` or GitHub Actions workflow updates that file using API credentials in repo secrets only (`.env` is gitignored).
- Visuals: two-column layout (stacked on small screens); GIFs and PNG logo under `assets/`.
- Tooling: Node devDependencies for local scripts only (`sharp`, `ffmpeg-static`)—not required for GitHub Pages hosting.
- Local preview: `npm install` then `npm run dev`. Pages deploy from repository root; `.nojekyll` disables Jekyll.

## Spotify catalog on the live site (GitHub Actions)

Secrets are **not** in the repo. They only run inside Actions to refresh **`assets/discography.json`**.

1. On GitHub, open the repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret** (exact names):
   - Name `SPOTIFY_CLIENT_ID` → value = Client ID from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
   - Name `SPOTIFY_CLIENT_SECRET` → value = Client secret (use **View client secret** in the app).
3. **Actions** tab → left sidebar **Sync Spotify discography** → **Run workflow** → branch **main** → **Run workflow**.
4. Open the run: confirm the step **Fetch from Spotify API** ran (not “skipping sync”). Then check **Commit if changed** succeeded.
5. On **main**, confirm **`assets/discography.json`** exists (updated timestamp). If nothing changed, the commit step may skip—that is normal.
6. If **branch protection** blocks bot commits, allow GitHub Actions to push to `main` or relax rules for the `github-actions[bot]` user.

The workflow also runs on pushes to `main`/`master` and daily (`cron`). After `discography.json` is on `main`, Pages serves it at `/assets/discography.json`.
