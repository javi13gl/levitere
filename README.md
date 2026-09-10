# Levitere — website

Single-page site for Levitere, a film studio based in Bergen, Norway.
Vite + vanilla HTML/CSS/JS. No frameworks, no webfonts, no animation libraries.
The output is a static `dist/` folder deployable on any CDN.

## Run locally

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
npm run preview    # serve dist/ locally
```

## Folder structure

```
index.html              markup for the whole page (one <section id> per section)
src/main.js             imports styles and boots each module
src/styles/
  tokens.css            design tokens: the two text sizes, colours, gutters, motion
  base.css              reset, typography defaults, focus ring, utilities
  header.css            fixed header (white over hero, black label over sections)
  hero.css              full-screen hero video + copy
  sections.css          shared section layout
  work.css              project stills, hover scale, location label
  modal.css             project video overlay
  carousel.css          Leading Brands carousel
  studio.css            Studio video + text
  contact.css           form, info block, giant wordmark
src/scripts/
  media.js              the single mobile breakpoint + reduced-motion query
  video-source.js       picks desktop/mobile source for a <video>, safe autoplay
  visibility.js         IntersectionObserver helper
  lazy-video.js         <video data-lazy>: load/play in viewport, pause outside
  nav.js                header fade, section label, smooth scroll
  hero.js               hero video boot
  scroll-fade.js        section copy fades out as it leaves the viewport
  work-modal.js         project modal: open/close, scroll lock, focus trap
  carousel.js           auto-advance on `ended`, manual loop mode, dots, swipe
  form.js               validation, submit to Apps Script (mock in dev)
  wordmark.js           scales the giant "Levitere" to span gutter to gutter
public/
  video/                mp4 files served as-is (see "Replacing a video")
  images/               Work project stills
  posters/              poster frames generated with ffmpeg
  favicon.png
backend/                Google Apps Script for the contact form + deployment guide
scripts/encode-videos.sh  re-encodes the client originals (videos/) into public/video
videos/                 client originals (never modified, not served)
```

## Replacing a video

The files in `public/video/` are web encodes generated from the client's
originals in `videos/Imágenes Web/` by `scripts/encode-videos.sh`
(H.264 High, CRF 22 capped at 5 Mb/s, no audio, no timecode track, faststart;
~148 MB total instead of the 277 MB originals). Posters are generated at the same time.

1. Put the new original in `videos/Imágenes Web/` (same name as the one it replaces,
   or add a line to the `MAP` table in the script).
2. Run, with ffmpeg on PATH (or `FFMPEG=/path/to/ffmpeg`):
   ```sh
   bash scripts/encode-videos.sh            # everything
   bash scripts/encode-videos.sh studio     # only names containing "studio"
   ```
3. That's it: the encode lands in `public/video/<name>.mp4` and its poster in `public/posters/<name>.jpg`.

Manual alternative: export H.264 (High) `.mp4` with `faststart`, drop it in `public/video/`
with the same file name (names are semantic: `hero-desktop.mp4`, `work-marbella.mp4`,
`brands-brann.mp4`, `studio.mp4`, ...) and regenerate the poster.
   Source mapping (client drive, `videos/` delivery of 2026-09-09):
   `hero-desktop` = `1.mp4` (fjord aerial), `hero-mobile` = `1(mobileVersion).mp4`,
   `work-nordfjord` = `4Video.mp4` (cabin), `work-marbella/bergen/valencia` = `2Video`/`3Video`/`5Video`,
   `brands-*` = `6`..`9`, `brands-*-mobile` = `6`..`9(mobileVersion)`, `studio` = `10`.
   Mobile files are 4:5 portrait (1080×1350).
Poster by hand:
```sh
ffmpeg -ss 1 -i public/video/<name>.mp4 -frames:v 1 -q:v 3 public/posters/<name>.jpg
```
Mobile variants are declared on each `<video>` with `data-src-mobile` / `data-poster-mobile`
in `index.html`; Work modal videos declare their aspect ratio with `data-ratio` on the button.

## Deploying to Vercel

The site is a static Vite build, so no server is involved. `vercel.json` already
pins the framework, the build command, the output directory and the cache headers.

**What goes in the repo.** `public/video/` (the ~148 MB of web encodes) is committed,
because those are the files that get served. `videos/` (the ~277 MB of client
originals) is gitignored: keep it on the shared drive, it is only needed to run
`scripts/encode-videos.sh`.

1. Create the repository and push:
   ```sh
   git init
   git add .
   git commit -m "Levitere website"
   git branch -M main
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```
2. In Vercel, **Add New → Project**, import the repo. It detects Vite; leave the
   build settings as they are.
3. **Settings → Environment Variables**, add `VITE_FORM_ENDPOINT` with the Apps
   Script web app URL, for Production, Preview and Development. It is baked in at
   build time, so redeploy after changing it.
4. Deploy, then **Settings → Domains** to point the client's domain at it.

Without GitHub: run `npx vercel` in this folder and follow the prompts.

Two things to keep in mind:

- The **Hobby plan is for non-commercial use only**; a studio's own site needs Pro.
- **Bandwidth is the real cost driver.** A visit that goes through the whole page
  pulls roughly 50 to 100 MB of video, so the 100 GB included in a plan is about
  1,500 full visits per month. If traffic grows, move `public/video/` to an object
  store with free egress (Cloudflare R2, Bunny) and point the `data-src-*`
  attributes in `index.html` at it.

## Contact form backend

Submissions go to a Google Apps Script Web App (Google Sheet + email
notification). Deployment steps are in [backend/README.md](backend/README.md).

- Copy `.env.example` to `.env` and set `VITE_FORM_ENDPOINT` to the deployed URL.
- Without it, `npm run dev` mocks the submit (payload logged to the console,
  success state shown), so the flow can be tested on localhost.
