// Extract the real emblem from imgs/logo.webp and regenerate the favicon set.
// No hand-drawn approximation: the emblem is cropped from the actual logo art.
//
// The TechnoPrime logo is a HORIZONTAL lockup: the geometric "T" emblem on the LEFT and
// the "TECHNOPRIME CONSTRUCTIONS" wordmark on the right. The emblem is two-tone blue
// (periwinkle + navy) on a white/transparent field, so:
//   - content = non-transparent, non-near-white pixels (the kit's default detector);
//   - the emblem is the LEFTMOST content band (column profile), left of the wordmark;
//   - the tile is WHITE, because the navy parts of the mark would vanish on a dark tile.
// Adapted from _rebuild-kit/tools/make-favicons.mjs: left-band (column) extraction as in
// matrukrupa.in, white tile as in kgskalliance.com. Only needs playwright-core + Chrome.
// Usage: node tools/make-favicons.mjs [path/to/logo.webp]
import { chromium } from 'playwright-core';
import fs from 'fs';

const LOGO = process.argv[2] || 'imgs/logo.webp';
const LABEL = 'TechnoPrime Constructions';
const BG = '#ffffff';                 // white tile: the navy emblem reads on light, not dark
const BORDER = '#e2e5ec';             // hairline so the tile is defined on white tab bars
const chromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const exe = chromePaths.find(p => { try { fs.accessSync(p); return true; } catch { return false; } });

const b64 = fs.readFileSync(LOGO).toString('base64');
const logoDataUrl = `data:image/webp;base64,${b64}`;

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();

const out = await page.evaluate(async ({ logoDataUrl, BG }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = logoDataUrl; });
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;
  const isContent = (x, y) => {
    const i = (y * W + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 24) return false;                          // transparent
    if (r > 240 && g > 240 && b > 240) return false;   // white-ish field / gaps
    return true;
  };

  // Column profile -> content bands along x; the LEFTMOST band is the emblem.
  const cols = new Array(W).fill(0);
  for (let x = 0; x < W; x++) { let n = 0; for (let y = 0; y < H; y += 2) if (isContent(x, y)) n++; cols[x] = n; }
  const maxc = Math.max(...cols), thr = maxc * 0.04;
  const bands = []; let inb = false, s = 0;
  for (let x = 0; x < W; x++) {
    if (cols[x] > thr && !inb) { inb = true; s = x; }
    else if (cols[x] <= thr && inb) { inb = false; bands.push([s, x - 1]); }
  }
  if (inb) bands.push([s, W - 1]);
  let [x0, x1] = bands[0];                     // emblem band (leftmost)
  let y0 = H, y1 = 0;                          // tight y bounds within the band
  for (let x = x0; x <= x1; x++) for (let y = 0; y < H; y++) if (isContent(x, y)) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const pad = Math.round((x1 - x0) * 0.06);
  x0 = Math.max(0, x0 - pad); x1 = Math.min(W - 1, x1 + pad);
  y0 = Math.max(0, y0 - pad); y1 = Math.min(H - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

  const makeTile = (size, scale) => {
    const t = document.createElement('canvas'); t.width = size; t.height = size;
    const g = t.getContext('2d');
    g.fillStyle = BG; g.fillRect(0, 0, size, size);
    const target = size * scale, ar = cw / ch;
    let dw, dh; if (ar >= 1) { dw = target; dh = target / ar; } else { dh = target; dw = target * ar; }
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(c, x0, y0, cw, ch, (size - dw) / 2, (size - dh) / 2, dw, dh);
    return t;
  };
  // Transparent emblem crop for the SVG <image>, downscaled so the inlined SVG stays small.
  const cap = 160, es = Math.min(1, cap / Math.max(cw, ch));
  const ec = document.createElement('canvas'); ec.width = Math.round(cw * es); ec.height = Math.round(ch * es);
  const eg = ec.getContext('2d'); eg.imageSmoothingQuality = 'high';
  eg.drawImage(c, x0, y0, cw, ch, 0, 0, ec.width, ec.height);

  return {
    bbox: [x0, y0, cw, ch], aspect: cw / ch,
    emblem: ec.toDataURL('image/png'),
    apple: makeTile(180, 0.72).toDataURL('image/png'),
    i192: makeTile(192, 0.66).toDataURL('image/png'),   // maskable safe area
    i512: makeTile(512, 0.66).toDataURL('image/png'),
    webp: makeTile(512, 0.66).toDataURL('image/webp', 0.92),
  };
}, { logoDataUrl, BG });

await browser.close();

const write = (file, dataUrl) =>
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

write('imgs/apple-touch-icon.png', out.apple);
write('imgs/icon-192.png', out.i192);
write('imgs/icon-512.png', out.i512);
write('imgs/favicon.webp', out.webp);

// SVG favicon: rounded white tile + hairline border + the real emblem (embedded).
const SZ = 64, scale = 0.70, ar = out.aspect;
let ew, eh; if (ar >= 1) { ew = SZ * scale; eh = ew / ar; } else { eh = SZ * scale; ew = eh * ar; }
const ex = (SZ - ew) / 2, ey = (SZ - eh) / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SZ} ${SZ}" role="img" aria-label="${LABEL}">
  <rect width="${SZ}" height="${SZ}" rx="14" fill="${BG}"/>
  <rect x="0.75" y="0.75" width="${(SZ - 1.5).toFixed(2)}" height="${(SZ - 1.5).toFixed(2)}" rx="13.25" fill="none" stroke="${BORDER}" stroke-width="1.5"/>
  <image x="${ex.toFixed(2)}" y="${ey.toFixed(2)}" width="${ew.toFixed(2)}" height="${eh.toFixed(2)}" href="${out.emblem}"/>
</svg>
`;
fs.writeFileSync('imgs/favicon.svg', svg);

console.log('emblem bbox [x,y,w,h] =', out.bbox, ' aspect =', out.aspect.toFixed(3));
console.log('wrote: apple-touch-icon.png, icon-192/512.png, favicon.webp, favicon.svg');
