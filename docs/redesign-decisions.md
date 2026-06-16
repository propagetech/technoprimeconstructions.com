# TechnoPrime Constructions redesign: decisions

The plan and decisions for rebuilding the TechnoPrime Constructions site, written before
the build so the direction can be reviewed and is not relitigated later. Same format and
standard as the councelx.us project. Newest entries go at the top.

---

## 2026-06-15: Rebuild plan (proposed, for sign-off before building)

### 1. The business
TechnoPrime Constructions LLP is a premium residential builder and real-estate developer
in Bangalore, India. Positioning: "Building Dreams. Building Trust. Building Future." The
firm combines the latest building technology with time-tested engineering, led by veteran
engineers (a stated 50+ year legacy) and a third-generation builder. Differentiators:
highly personalised, high-quality construction; guaranteed on-time delivery; eco-friendly
homes that work with earth, water, wind and light; and Vastu-aligned design for holistic
living. Current flagship project: **TechnoPrime Vasudha**, J.P. Nagar 2nd phase, Bangalore.

### 2. Canonical domain and contact
- Canonical production domain: **https://www.technoprimeconstructions.com/** (with `www`),
  matching the existing sitemap. Preview will be the GitHub Pages project page at
  `https://propagetech.github.io/technoprimeconstructions.com/` (a subpath), so the build
  is path-portable (see section 9).
- Email: **reachus@technoprimeconstructions.com** (email-led contact, no backend).
- Phone: **Ashuthosh, 9008512277** (the only number on the current site).
- Address: **# 37, KSRTC Layout, 5th cross, 3rd main, J.P. Nagar 2nd phase, behind
  Ragigudda temple, Bangalore 560078.**
- Because there is a real address and phone, the site can use a stronger local-business
  schema and a real `tel:` link (see section 8). Confirm these are current before launch.

### 3. Brand and colour (from imgs/logo.webp)
The logo is a geometric "T" monogram in a blue gradient with a navy wordmark, an
architectural, trustworthy palette. Proposed tokens (final values WCAG 2.1 AA verified at
build, with the DOM-aware audit):
- `--navy` ~ `#1b2440` (dark sections, footer, headings)
- `--ink` ~ `#1c2233` (primary text on light)
- `--blue` ~ `#2f5aa8` (brand fill, buttons, accents)
- `--blue-ink` (darker blue for text/links on light, >= 4.5:1)
- `--blue-light` ~ `#7d9bd6` (decorative / accent on navy)
- `--light` ~ `#f5f7fb` (cool light background), white surfaces
- Optional warm `--gold` ~ `#b3873f` for small "premium" accents (eyebrows, rules). Kept
  optional because the logo itself is blue-only. Recommendation: navy + blue primary, with
  a restrained gold accent for the luxury cue. Decide at sign-off.

### 4. Typography
Self-hosted woff2 (latin subset), preloaded critical weights, no Google Fonts / CDN.
Proposed pairing for a premium yet modern feel:
- Headings: a refined serif (**Fraunces**) for warmth and a luxury, editorial tone.
- Body and UI: **Inter**.
- Alternative if you prefer to lean into the "Techno" / modern-architectural angle:
  headings in a clean grotesque (**Space Grotesk** or **Sora**) instead of a serif.
  Pick one at sign-off.

### 5. Information architecture (pages)
From one builder page to a clear multi-page, directory-URL structure:
1. **Home** `/` - hero, intro, why-choose-us pillars, project snapshot, eco/Vastu band,
   gallery teaser, contact call to action.
2. **About** `/about/` - the story, leadership and legacy, values, approach.
3. **Projects** `/projects/` - TechnoPrime Vasudha (overview, location, amenities,
   brochure link). Built to hold future projects too.
4. **Why us** `/why-us/` - expertise, on-time delivery, eco-friendly, Vastu, quality
   (could also be a strong Home section; kept as a page for depth and SEO).
5. **Gallery** `/gallery/` - the real project and building photos.
6. **Contact** `/contact/` - email, phone, address, map, email-led enquiry helper.
7. **FAQ** `/faq/` - buyer questions (Vastu, eco features, delivery, location, booking),
   good for FAQ rich results. Confirm if wanted.
Nav: about six items plus a primary call to action (for example "Enquire" or "Book a
visit"). 404 stays at the root.

### 6. Content
Rewritten for clarity and outcomes from the existing site copy (Our Story, Why Choose Us,
the TechnoPrime Vasudha project, contact). No invented facts; the 50+ year legacy, the
named leaders, Vastu and eco claims, and the project details all come from the current
site. No em dashes anywhere.

### 7. Imagery: a mix of real photos and undraw.co illustrations
- **Photos** for anything concrete: the building and project renders already in `imgs/`
  (image-1..9, technoprime-vasudha, welcome image) for the hero, project page and gallery.
  Stock-looking or placeholder images will be excluded after a visual pass, as on the
  other rebuilds.
- **Illustrations** from **https://undraw.co/** (open licence), recoloured to the brand
  blue, for concepts that have no clean photo: eco-friendly building, planning and
  blueprints, on-time delivery, trust and partnership, amenities, location and map, Vastu
  and holistic living. Used as section accents and on the "why us" and contact pages.
  Mixing real photography with brand-recoloured illustrations is the explicit direction
  for this site.

### 8. SEO and schema
Per-page unique title, description, canonical, Open Graph and Twitter; a real `robots.txt`
and full `sitemap.xml` (directory URLs). JSON-LD:
- Home: **HomeAndConstructionBusiness** (a LocalBusiness subtype, with name, logo, url,
  image, address, geo, telephone, email, areaServed, openingHours if provided) + `WebSite`
  + `WebPage`. The real Bangalore address makes this eligible for local rich results.
- Inner pages: `WebPage` / `AboutPage` / `CollectionPage` / `ContactPage` + `BreadcrumbList`.
- Projects: a `Residence` / `Place` (or `Product`) for TechnoPrime Vasudha.
- Gallery: `ImageGallery`. FAQ: `FAQPage` (answer text must match the visible text).

### 9. URL convention and deploy
- Directory ("pretty") URLs: each page is `slug/index.html`, served at `/slug/`. Home is
  `index.html` at `/`; `404.html` stays at the root.
- **Path-portable**: assets and internal links are relative and depth-aware (home
  `css/...`, inner pages `../css/...`), so the site works both at the production root
  domain and on the GitHub Pages project subpath preview. Canonical, OG, sitemap and
  JSON-LD stay absolute on the production domain. `404.html` uses root-absolute paths.
- Deploy stays GitHub Pages from the repo root on push to `main`. The old builder site is
  moved to `archive/` and disallowed in `robots.txt`.

### 10. Standards (definition of done)
Hand-built static HTML5 + one design-system CSS + one small vanilla JS (works with JS
off). WCAG 2.1 AA with an audited DOM-aware contrast check (`tools/contrast-audit.mjs`),
skip link, keyboard-operable nav and accordion, visible focus, reduced-motion. Fast and
no layout shift (self-hosted assets, set image dimensions, lazy-load below the fold).
Valid JSON-LD on every page, unique SEO meta, `site.webmanifest`, favicon and a styled
404. A `CLAUDE.md` and this decisions log document the system.

### 11. Sign-off (confirmed 2026-06-16)
- **Headings: Fraunces** (refined serif), body Inter. Confirmed.
- **Palette: navy + blue + a restrained gold accent.** Confirmed.
- **Pages: the full set including FAQ** (Home, About, Projects, Why us, Gallery, Contact,
  FAQ). Confirmed.

Still to verify with the client before launch (does not block the build):
- Phone (9008512277) and the J.P. Nagar address are current and OK to publish.
- Whether there is a brochure PDF to link from the Projects page (the old site had a
  "Download brochure" button); if none is supplied, the button is omitted.
- Any extra TechnoPrime Vasudha details (status, configurations, amenities, RERA number)
  to add to the Projects page.
