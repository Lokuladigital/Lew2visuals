# Lew2Visuals website

A static site: plain HTML, CSS and JavaScript. Nothing to install or build.
It uses GSAP + ScrollTrigger (scroll animation) and Lenis (smooth scroll), both loaded from a CDN.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: reel, dot wordmark, statement, selects, services, film strip, quotes, CTA |
| `work.html` | Work grid with filters + index view |
| `project.html?p=<slug>` | One project (any slug from `data.js`) |
| `services.html` | Services, process timeline, formats, FAQ |
| `about.html` | About, story, BTS drag gallery, kit |
| `contact.html` | Inquiry form |

## Swapping in Lew's real content
Almost everything lives in **`assets/js/data.js`**:

- **Booking status, email, Instagram, city:** `site` at the top. Change once and it updates everywhere.
- **Highlight reel:** replace `media/hero-reel.mp4` (and `media/posters/hero-reel.jpg`). Set `heroCuts` to the seconds where the reel cuts; the frame shape changes on each cut.
- **Projects:** edit the `projects` list. Each project needs:
  - `media/clips/<slug>.mp4`: the clip (keep it short and muted for previews; 720p is plenty)
  - `media/posters/<slug>.jpg`, `<slug>-2.jpg`, `<slug>-3.jpg`: three frame grabs
- **Services, process steps, testimonials:** same file.
- **About copy:** in `about.html` (marked "Placeholder copy").
- **FAQ / pricing:** in `services.html` (answers marked "Placeholder").

## Contact form
No backend yet. Until one exists, submitting builds a pre-filled email to `site.email`.
To receive submissions directly, create a free form endpoint (e.g. Formspree) and paste its URL into `site.formEndpoint`.

## Placeholder footage
All clips in `media/` are AI-generated placeholders (Higgsfield, Kling 3.0). Replace them before launch.
For real footage, consider hosting video on Mux, Vimeo or Cloudflare Stream rather than in the repo.

## Run locally
```bash
python3 -m http.server 4321
```
Then open http://localhost:4321.

## Deploy
Drag the folder into Vercel or Netlify, or connect the repo. No build step.
