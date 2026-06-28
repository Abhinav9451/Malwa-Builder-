# Malwa Builders — Website

A luxury, modern website for **Malwa Builders** (Jagraon, Punjab) — builders of
luxury houses, bungalows, farmhouses and interior design. Includes a 3D animated
hero (Three.js), smooth scroll animations (GSAP), a projects gallery, and
WhatsApp + Facebook + Instagram integration.

## Quick Start

No build step needed. Just serve the folder.

**Option A — Python (already installed):**

```bash
python -m http.server 5500
```

Then open http://localhost:5500

**Option B — Node:**

```bash
npx serve .
```

You can also simply double-click `index.html`, but a local server is recommended
so the 3D animation and fonts load reliably.

## ✏️ Edit your details (important)

Open `js/config.js` and replace the placeholders:

| Field | Value (already set) |
|-------|-------------|
| `whatsappNumber` | `919815031725` (primary, used for WhatsApp) |
| `phoneDisplay`   | `+91 98150 31725` |
| `phoneAlt`       | `+91 95010 05300` (alternate) |
| `email`          | `malwabuilders@gmail.com` (update if needed) |
| `facebook`       | `facebook.com/malwabuilders` |
| `instagram`      | `instagram.com/malwabuilders` |
| `location`       | Full Jagraon address (shown in footer + Google Maps) |

The **WhatsApp button**, **contact form**, and all links update automatically
from this file.

## 🎬 Reels — hover to play (real content already added)

The **Completed Projects & Reels** section uses the real Malwa Builders reel
posters (downloaded from the Facebook page) in `assets/reels/`. Each card:

- shows the real reel thumbnail,
- **plays a video on hover and pauses when you move away**,
- opens the actual reel on Facebook when clicked.

By default, hovering plays a shared lightweight preview clip
(`assets/video/preview.mp4`) so the effect works instantly. To make a card play
**its own** reel video on hover:

1. Download the reel (you own it) as an `.mp4` — e.g. from your phone, or any
   reel/Facebook video downloader.
2. Save it into `assets/reels/` (e.g. `reel1.mp4`).
3. In `js/main.js`, find the `REELS` array and set that item's
   `video: "assets/reels/reel1.mp4"`.

> Reel **videos** can't be auto-downloaded from Facebook/Instagram (they're
> streamed/protected), which is why the posters + links are used. Dropping in the
> mp4 files is a 30-second step and the hover-play upgrades automatically.

## 🖼️ Add more project photos

1. Put images in `assets/projects/`.
2. They're ready to use anywhere in the page (the About section already uses a
   real project photo, `assets/projects/project1.jpg`).

## Replace the logo

A unique logo is already generated at `assets/logo.svg` (and `assets/favicon.svg`).
If you receive an official logo file, drop it in `assets/` and update the
`<img src="assets/logo.svg">` references in `index.html`.

## Structure

```
MALWA BUILDERS/
├── index.html
├── css/style.css
├── js/
│   ├── config.js   ← edit phone/email/links here
│   └── main.js     ← 3D scene, animations, gallery, WhatsApp
└── assets/
    ├── logo.svg
    └── favicon.svg
```
