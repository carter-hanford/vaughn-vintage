![Vaughn Vintage](assets/readme-cover.png)

# Professional Website for Vaughn Vintage.

- Single static page: root `index.html`, CSS and JS inline (no build step for the live site).
- Typography: DM Sans (body); display stack is Impact with Bebas Neue and condensed grotesque fallbacks (Google Fonts).
- Music: Spotify artist embed; album tiles from `assets/discography.json` (fetched at runtime). Optional `npm run spotify:sync` or GitHub Actions workflow updates that file using API credentials in repo secrets only (`.env` is gitignored).
- Visuals: two-column layout (stacked on small screens); GIFs and PNG logo under `assets/`.
- Tooling: Node devDependencies for local scripts only (`sharp`, `ffmpeg-static`)—not required for GitHub Pages hosting.
- Local preview: `npm install` then `npm run dev`. Pages deploy from repository root; `.nojekyll` disables Jekyll.
