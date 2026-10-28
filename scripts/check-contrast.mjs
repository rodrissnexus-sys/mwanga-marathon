// Contrast audit: every visible text element on every public page, both
// languages, desktop + phone sizes, against WCAG AA (4.5:1, or 3:1 for large
// text). Text on top of photos is skipped (its background varies per image).
//
//   npm run build && npm start            # in another terminal
//   npm run check:contrast [base-url]     # default http://localhost:3000
//
// Set CHROMIUM_PATH to use a system Chromium instead of Playwright's.
import { chromium } from "@playwright/test";
const BASE = process.argv[2] || "http://localhost:3000";
const pages = ["/", "/about", "/race-categories", "/events", "/register", "/sponsors", "/contact", "/login", "/nope"];
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = new Map();
for (const [device, width, height] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  for (const locale of ["", "/sw"]) {
    for (const path of pages) {
      const url = BASE + locale + (path === "/" && locale ? "" : path);
      const p = await (await b.newContext({ viewport: { width, height }, reducedMotion: "reduce" })).newPage();
      await p.goto(url, { waitUntil: "load", timeout: 90000 }).catch(() => {});
      // scroll through so lazy / in-view content renders, then wait for data
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } });
      await p.waitForTimeout(7000);
      const found = await p.evaluate(() => {
        const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
        const parse = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const [r, g, bb, a] = ctx.getImageData(0, 0, 1, 1).data; return { r, g, b: bb, a: a / 255 }; };
        const over = (t, u) => ({ r: t.r * t.a + u.r * (1 - t.a), g: t.g * t.a + u.g * (1 - t.a), b: t.b * t.a + u.b * (1 - t.a), a: 1 });
        const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
        const out = [];
        const all = [...document.querySelectorAll("body *")].filter((el) =>
          [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.offsetParent !== null && !el.closest(".sr-only, [aria-hidden=true], .glass-card ~ *"));
        for (const el of all) {
          const st = getComputedStyle(el);
          if (st.visibility === "hidden" || Number(st.opacity) === 0) continue;
          const rect = el.getBoundingClientRect(); if (rect.width === 0 || rect.height === 0) continue;
          // composite backgrounds; skip text over images / gradients (can't be computed)
          let bg = { r: 255, g: 255, b: 255, a: 1 }, overImage = false, opacity = 1;
          const chain = []; for (let e = el; e; e = e.parentElement) chain.push(e);
          for (const e of chain.reverse()) {
            const cs = getComputedStyle(e);
            if (cs.backgroundImage !== "none" || e.tagName === "IMG" || e.querySelector(":scope > img, :scope > picture")) overImage = overImage || cs.backgroundImage !== "none";
            const c = parse(cs.backgroundColor); if (c.a > 0) bg = over(c, bg);
            opacity *= Number(cs.opacity);
          }
          // also skip anything positioned over an <img> (hero/gallery overlays)
          const behind = document.elementsFromPoint(Math.min(rect.left + 2, innerWidth - 1), Math.min(rect.top + rect.height / 2, innerHeight - 1));
          if (overImage || behind.some((e) => e.tagName === "IMG")) continue;
          const fgRaw = parse(st.color); const fg = over({ ...fgRaw, a: fgRaw.a * opacity }, bg);
          const size = parseFloat(st.fontSize), bold = Number(st.fontWeight) >= 700;
          const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
          const r = ratio(fg, bg);
          if (r < need) out.push({ text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 40), ratio: r.toFixed(2), need, cls: (el.className?.baseVal ?? el.className).slice(0, 90), tag: el.tagName.toLowerCase(), size });
        }
        return out;
      });
      for (const f of found) {
        const key = `${f.tag}.${f.cls} | "${f.text}"`;
        if (!failures.has(key)) failures.set(key, { ...f, where: new Set() });
        failures.get(key).where.add(`${device}${locale}${path}`);
      }
      await p.close();
    }
  }
}
await b.close();
const list = [...failures.values()].sort((a, c) => a.ratio - c.ratio);
console.log(`${list.length} low-contrast text elements`);
for (const f of list) console.log(`${f.ratio}:1 (needs ${f.need}) <${f.tag}> "${f.text}" [${f.cls}] on ${[...f.where].slice(0, 3).join(", ")}${f.where.size > 3 ? ` +${f.where.size - 3}` : ""}`);
process.exit(list.length ? 1 : 0);
