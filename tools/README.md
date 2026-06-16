# tools/ — dev tooling (not deployed)

These scripts are for local checks only. They are gitignored where possible and are
never part of the published site (GitHub Pages CI checks out a clean repo, so
`node_modules` is never uploaded).

## contrast-audit.mjs — DOM-aware WCAG AA contrast check

A palette/token table only proves colours pass *in isolation*. The failures that slip
through come from the **cascade** (which CSS rule wins) and from which ancestor
actually **paints the background**. This script loads each page in real Chrome and, for
every visible text element, compares the **computed** foreground colour against the
**composited** background, then checks the WCAG 2.1 AA ratio (4.5:1 normal text, 3:1
large text: >= 24px, or >= 18.66px bold).

It exists because a token-only audit missed two real bugs on this site:
- `.cta-band p` overriding the `.eyebrow` component class, repainting bronze text as
  `#cdd4da` on cream = 1.39:1.
- the large "404" numeral in `--bronze` on cream = 2.76:1 (below the 3:1 large bar).

### Run it

```bash
# from the repo root
python3 -m http.server 8123 &          # 1. serve the site
(cd tools && npm i playwright-core)     # 2. one-time; drives installed Google Chrome
node tools/contrast-audit.mjs           # 3. audit (exit 1 on any AA failure -> CI gate)
# optional: point at any base URL
node tools/contrast-audit.mjs http://localhost:8123
```

Output lists every failure with its ratio, the resolved foreground/background colours,
a selector path and the text, so each one is actionable. Failures that sit over an
image or gradient are flagged `[over image/gradient - review]` for a manual look.

### Reuse on another project

Copy `contrast-audit.mjs`, edit the `PATHS` array to your routes, then run the three
steps above. It needs only Node and a Chromium-based browser installed (Chrome, Edge,
Brave, or Chromium); `playwright-core` does not download a browser.

### The rule it enforces

Colour belongs to the **component**, not the container. A container selector
(`.cta-band p`, specificity 0-1-1) must not set `color` on bare element descendants,
because it silently out-specifies a component class (`.eyebrow`, 0-1-0) nested inside
it. Give descriptive text its own class, or exclude the component:
`.cta-band p:not(.eyebrow)`. And never let a dark-background colour (`--cream-muted`)
be reachable on a light surface through the cascade.
