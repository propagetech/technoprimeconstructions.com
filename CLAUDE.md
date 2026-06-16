# TechnoPrime Constructions website: design system, conventions and decisions

Working brief for anyone (human or AI) maintaining the TechnoPrime site. It is a
hand-built static site: semantic HTML5, one CSS file, one small JS file, no framework
and no build step. It deploys from the repo root via GitHub Pages.

Business: TechnoPrime Constructions LLP, a premium, eco-friendly, Vastu-aligned
residential builder in Bangalore. Flagship project: TechnoPrime Vasudha (J.P. Nagar).
Contact: reachus@technoprimeconstructions.com, phone 9008512277 (Ashuthosh), address in
J.P. Nagar 2nd Phase, Bangalore 560078. Email-led contact, no backend.

---

## 1. File structure
```
/                       repo root (served by GitHub Pages)
  index.html            Home, at /
  about/index.html      About + leadership, at /about/
  projects/index.html   TechnoPrime Vasudha (Residence schema), at /projects/
  why-us/index.html     Expertise + how we work, at /why-us/
  gallery/index.html    Gallery (ImageGallery), at /gallery/
  faq/index.html        FAQ (FAQPage schema), at /faq/
  contact/index.html    Email-led contact + phone + address, at /contact/
  404.html              Styled not-found (stays at root; root-absolute asset paths)
  robots.txt sitemap.xml site.webmanifest
  css/main.css js/main.js fonts/ (Inter + Fraunces woff2)
  imgs/                 logo, favicon.*, icons, og-image.jpg, hero/about/project photos
  imgs/gallery/         gallery-1..6.webp (project renders)
  imgs/illustrations/   Brand-recoloured undraw-style SVGs (planning, eco, trust, location)
  docs/redesign-decisions.md   The plan and decisions log
  tools/                Dev-only (contrast-audit.mjs); gitignored deps, not deployed
  archive/              Previous builder-exported site (not linked, disallowed)
```
No HTML partials (no build step): header, footer and the floating button are duplicated
across pages. **Change one, change all**, keeping them identical except `aria-current`.

## 2. Brand and colour (from imgs/logo.webp)
Navy + architectural blue, with a restrained gold accent, on a cool light field. The
header is light (the logo reads on light). All pairings WCAG 2.1 AA verified; re-run the
audit (section 7) after any colour change.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--light` | `#f5f7fb` | Page background | base |
| `--ink` | `#1c2336` | Primary text | 14.6:1 on light |
| `--ink-2` | `#48526a` | Secondary text | 7.3:1 |
| `--ink-3` | `#5a6480` | Muted text | 5.5:1 |
| `--navy` | `#1b2440` | Dark sections | white 15.3:1 |
| `--navy-2` | `#141a30` | Footer | white high |
| `--navy-muted` | `#c3cce0` | Secondary text on navy | 9.5:1 |
| `--blue` | `#2f5aa8` | Brand fill / button bg (white text 6.7:1) |
| `--blue-ink` | `#2a4f93` | Blue text / links on light | 7.4:1 |
| `--blue-light` | `#8aa6dd` | Blue accent on navy | 6.2:1 |
| `--gold` | `#b3873f` | Gold accent / UI on light | 3.03:1 (accent only) |
| `--gold-ink` | `#866225` | Gold text on light | 5.2:1 |
| `--gold-on-dark` | `#d6ab63` | Gold text / accent on navy | 7.2:1 |

Rules: primary buttons are `--blue` + white text. The eyebrow uses gold (`--gold-ink` on
light, `--gold-on-dark` on navy). Gold is only 3.03:1 on light, so use it as a small
accent, never body text; use `--gold-ink` for gold text. Focus ring is `--blue-strong`.

### Colour belongs to the component, not the container
A container selector that sets `color` on bare element descendants (e.g. `.section-head p`,
`.cta-band p`) silently out-specifies a single-class component such as `.eyebrow`. Those
rules are scoped `:not(.eyebrow)`. Verify with the DOM-aware audit, not by eye.

## 3. Typography
Headings **Fraunces** (refined serif, premium feel), body **Inter**. Self-hosted woff2
(latin), `font-display: swap`, `inter-400` + `fraunces-700` preloaded. No Google Fonts.

## 4. URL convention: directory URLs, path-portable
Each page is `slug/index.html` served at `/slug/`. Home is `/`; `404.html` at root.
Production is the custom domain `https://www.technoprimeconstructions.com/` (root), but
the preview is the GitHub Pages project page at
`https://propagetech.github.io/technoprimeconstructions.com/` (subpath), so:
- **Assets and internal links are relative and depth-aware** (home `css/...`, `about/`;
  inner pages `../css/...`, `../projects/`, home link `../`). Never root-absolute, which
  breaks on the subpath. Exception: `404.html` is root-absolute (served at any depth).
- **Canonical, `og:url`, sitemap `loc`, JSON-LD `@id` stay absolute** on the production
  domain. Link with the trailing slash (`/slug` 301-redirects to `/slug/`).

## 5. Imagery: photos + brand illustrations
A deliberate mix. **Photos** (the TechnoPrime Vasudha renders and the team photo) for the
hero, project and gallery. **Illustrations** in `imgs/illustrations/` are original
undraw-style flat SVGs recoloured to the brand (navy/blue/gold), used as section accents
(planning, eco, trust, location). The undraw.co public API is no longer available, so the
illustrations were authored in that style rather than fetched. The original builder
gallery also held unrelated stock; only the real project imagery was kept.

## 6. SEO, schema, accessibility, copy
- Per-page unique title/description/canonical/OG/Twitter. JSON-LD:
  `HomeAndConstructionBusiness` (with the real Bangalore address + telephone, eligible for
  local rich results) + `WebSite` + `WebPage` on Home; `BreadcrumbList` on inner pages; a
  `Residence` on Projects; `ImageGallery` on Gallery; `FAQPage` on FAQ (answer text must
  match the visible text); `ContactPage` on Contact.
- WCAG 2.1 AA, one `<h1>` per page, ordered headings, landmarks, skip link, keyboard nav
  with a no-JS fallback, visible focus, `prefers-reduced-motion`, image width/height.
- **No em dashes** in copy. Contact is email-led plus a real `tel:` link; the form
  composes a `mailto:` draft (no backend), and nothing is stored.

## 7. Validation (run before deploy)
```bash
grep -rn "—" *.html */index.html && echo FAIL || echo "OK: no em dashes"
python3 -m http.server 8123 &
(cd tools && npm i playwright-core)
node tools/contrast-audit.mjs            # DOM-aware AA audit; exit 1 on failure
# Subpath check: serve the PARENT dir, load /technoprimeconstructions.com/ in a browser,
# confirm 0 asset 404s (relative paths must hold on the project subpath).
```
Also: every JSON-LD block parses, one `<h1>` per page, all links and #anchors resolve,
and the site works with JavaScript disabled. Decisions log: `docs/redesign-decisions.md`.
