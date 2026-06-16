# TechnoPrime Constructions

Marketing website for **TechnoPrime Constructions LLP**, a premium, eco-friendly,
Vastu-aligned residential builder in Bangalore. Flagship project: TechnoPrime Vasudha.

Static, hand-built, no framework and no build step. Served from the repository root by
GitHub Pages on push to `main`.

## Stack
- Semantic HTML5, one design-system stylesheet ([css/main.css](css/main.css)), one small
  progressive-enhancement script ([js/main.js](js/main.js)). Works with JS disabled.
- Self-hosted Inter + Fraunces fonts (woff2, latin) in [fonts/](fonts/). No CDN.
- A mix of real project photos and brand-recoloured undraw-style illustrations
  ([imgs/illustrations/](imgs/illustrations/)).
- Directory ("pretty") URLs with depth-aware relative paths, so the site works at the
  production domain root and on the GitHub Pages project subpath preview.

## Pages
| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/projects/` | `projects/index.html` |
| `/why-us/` | `why-us/index.html` |
| `/gallery/` | `gallery/index.html` |
| `/faq/` | `faq/index.html` |
| `/contact/` | `contact/index.html` |
| 404 | `404.html` (root) |

## Standards
SEO meta + sitemap/robots; schema.org JSON-LD (`HomeAndConstructionBusiness` + `WebSite`,
`BreadcrumbList`, `Residence`, `ImageGallery`, `FAQPage`, `ContactPage`); WCAG 2.1 AA
(audited contrast); no em dashes; email-led contact with a real phone link, no backend.

See [CLAUDE.md](CLAUDE.md) for the design system and conventions and
[docs/redesign-decisions.md](docs/redesign-decisions.md) for the decisions log. The
previous builder site is kept in [archive/](archive/) and disallowed in `robots.txt`.

## Local preview
```
python3 -m http.server 8000
```
Then open http://localhost:8000/.
