// Contrast audit: every visible text element on every public page, both
// languages, desktop + phone sizes, against WCAG AA (4.5:1, or 3:1 for large
// text: 24px+, or 18.66px+ bold).
//
// The background is measured from real pixels: each screen of the page is
// screenshotted with all text made transparent, and each text colour is
// compared with the pixels behind it — so gradients, photos and overlays are
// all covered. The score for an element is the 10th percentile over those
// pixels (its weakest area).
//
//   npm run build && npm start            # in another terminal
//   npm run check:contrast [base-url]     # default http://localhost:3000
//
// Set CHROMIUM_PATH to use a system Chromium instead of Playwright's.
import { chromium } from "@playwright/test";

const BASE = process.argv[2] || "http://localhost:3000";
const PAGES = ["/", "/about", "/race-categories", "/events", "/register", "/sponsors", "/contact", "/login", "/nope"];
const SIZES = [["desktop", 1440, 900], ["phone", 390, 844]];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = new Map();

for (const [device, width, height] of SIZES) {
  for (const locale of ["", "/sw"]) {
    for (const path of PAGES) {
      const url = BASE + locale + (path === "/" && locale ? "" : path);
      const page = await (await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" })).newPage();
      await page.goto(url, { waitUntil: "load", timeout: 90000 }).catch(() => {});
      // scroll through so in-view animations and lazy content render, then let data load
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(6000);
      // freeze motion (slideshows, countdown boxes) so text and background line up
      await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}" });

      // Text colours are compared with the real pixels behind them. The page is
      // checked one screen at a time (so lazy images are loaded and nothing is
      // re-laid out), with all text made transparent for the screenshot.
      const hideText = "*{color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;caret-color:transparent!important}input::placeholder,textarea::placeholder{color:transparent!important}";
      const found = [];
      const seen = new Set();
      const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let top = 0; top < docHeight; top += height - 200) {
        await page.evaluate((y) => window.scrollTo(0, y), top);
        await page.waitForTimeout(1500); // let in-view animations finish
        // 1. text fully visible in this screen, below the sticky header
        const items = await page.evaluate(() => {
          const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
          const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
          const header = Math.max(0, ...[...document.querySelectorAll("nav, header, .sticky, .fixed")]
            .filter((e) => getComputedStyle(e).position.match(/fixed|sticky/) && e.getBoundingClientRect().top <= 1 && e.getBoundingClientRect().height < 200)
            .map((e) => e.getBoundingClientRect().bottom));
          return [...document.querySelectorAll("body *")]
            .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
            .filter((el) => !el.closest(".sr-only, [aria-hidden=true]"))
            .map((el, index) => {
              const st = getComputedStyle(el);
              let opacity = 1;
              for (let e = el; e; e = e.parentElement) {
                const s = getComputedStyle(e);
                if (s.visibility === "hidden" || s.display === "none") opacity = 0;
                opacity *= Number(s.opacity);
              }
              const r = el.getBoundingClientRect();
              const [cr, cg, cb, ca] = rgba(st.color);
              const inHeader = !!el.closest("nav, header, .sticky, .fixed");
              // skip text pushed outside a clipping parent (e.g. captions that slide in on hover)
              let clipped = false;
              for (let e = el.parentElement; e && !clipped; e = e.parentElement) {
                if (getComputedStyle(e).overflow === "visible") continue;
                const c = e.getBoundingClientRect();
                const visibleH = Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top);
                const visibleW = Math.min(r.right, c.right) - Math.max(r.left, c.left);
                clipped = visibleH < r.height * 0.5 || visibleW < r.width * 0.5;
              }
              return {
                id: `${el.tagName}|${r.left + scrollX}|${r.top + scrollY}|${index}`,
                text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 40),
                tag: el.tagName.toLowerCase(),
                cls: String(el.className?.baseVal ?? el.className).slice(0, 80),
                color: [cr, cg, cb, ca * opacity],
                size: parseFloat(st.fontSize),
                bold: Number(st.fontWeight) >= 700,
                radius: parseFloat(st.borderTopLeftRadius) || 0,
                // sample inside the element's own border (e.g. outlined buttons)
                x: r.left + parseFloat(st.borderLeftWidth), y: r.top + parseFloat(st.borderTopWidth),
                w: r.width - parseFloat(st.borderLeftWidth) - parseFloat(st.borderRightWidth),
                h: r.height - parseFloat(st.borderTopWidth) - parseFloat(st.borderBottomWidth),
                visible: !clipped && r.top >= (inHeader ? 0 : header) && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
              };
            })
            .filter((i) => i.visible && i.color[3] > 0.05 && i.w > 2 && i.h > 2);
        });
        const todo = items.filter((i) => !seen.has(i.id));
        todo.forEach((i) => seen.add(i.id));
        if (!todo.length) continue;

        // 2. this screen with all text transparent
        const style = await page.addStyleTag({ content: hideText });
        const png = (await page.screenshot()).toString("base64");
        await style.evaluate((el) => el.remove());

        // 3. score each text against the pixels behind it
        found.push(...(await page.evaluate(async ({ png, items }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${png}`;
          await img.decode();
          const canvas = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          const scale = img.width / innerWidth;
          const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
          const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
          const out = [];
          for (const it of items) {
            const x0 = Math.round(it.x * scale), y0 = Math.round(it.y * scale);
            const w = Math.min(Math.round(it.w * scale), img.width - x0), h = Math.min(Math.round(it.h * scale), img.height - y0);
            if (w <= 0 || h <= 0) continue;
            const data = ctx.getImageData(x0, y0, w, h).data;
            const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 400)));
            // ignore the page showing through rounded corners (pills, circles)
            const rad = Math.min(it.radius * scale, w / 2, h / 2);
            const outsideCorner = (x, y) => {
              const cx = x < rad ? rad : x > w - rad ? w - rad : x;
              const cy = y < rad ? rad : y > h - rad ? h - rad : y;
              return (x - cx) ** 2 + (y - cy) ** 2 > rad * rad;
            };
            const [fr, fgr, fb, fa] = it.color;
            const ratios = [];
            for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
              if (rad > 0 && outsideCorner(x, y)) continue;
              const i = (y * w + x) * 4;
              const bg = [data[i], data[i + 1], data[i + 2]];
              const fg = [fr * fa + bg[0] * (1 - fa), fgr * fa + bg[1] * (1 - fa), fb * fa + bg[2] * (1 - fa)];
              ratios.push(ratio(fg, bg));
            }
            ratios.sort((a, b) => a - b);
            const score = ratios[Math.floor(ratios.length * 0.1)];
            const need = it.size >= 24 || (it.bold && it.size >= 18.66) ? 3 : 4.5;
            if (score < need) out.push({ ...it, ratio: score.toFixed(2), need });
          }
          return out;
        }, { png, items: todo })));
      }

      for (const f of found) {
        const key = `${f.tag}.${f.cls} | "${f.text}"`;
        if (!failures.has(key)) failures.set(key, { ...f, where: new Set() });
        failures.get(key).where.add(`${device}${locale}${path}`);
      }
      await page.close();
    }
  }
}
await browser.close();

const list = [...failures.values()].sort((a, b) => a.ratio - b.ratio);
console.log(`${list.length} low-contrast text elements`);
for (const f of list) {
  const where = [...f.where];
  console.log(`${f.ratio}:1 (needs ${f.need}) <${f.tag}> "${f.text}" [${f.cls}] on ${where.slice(0, 3).join(", ")}${where.length > 3 ? ` +${where.length - 3}` : ""}`);
}
process.exit(list.length ? 1 : 0);
