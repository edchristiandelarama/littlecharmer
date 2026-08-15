import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

/*
 * Render brand.html in a real browser and screenshot each asset at its exact
 * pixel size. Chromium is doing the typesetting, so the PNGs use the same
 * Fraunces/Karla and the same colours as the site itself — no hand-matching.
 */

const OUT = "c:/Users/Ed Christian/Desktop/Projects/LittleCharmer2/public/brand";
mkdirSync(OUT, { recursive: true });

const HERE = process.cwd().replace(/\\/g, "/");

const assets = [
  { id: "mark-brass", file: "logo-mark-brass.png", transparent: true },
  { id: "mark-cream", file: "logo-mark-cream.png", transparent: true },
  { id: "profile", file: "facebook-profile-picture.png", transparent: false },
  { id: "lockup-h", file: "logo-horizontal.png", transparent: true },
  { id: "lockup-v", file: "logo-stacked.png", transparent: true },
  { id: "fb-cover", file: "facebook-cover.png", transparent: false },
  { id: "post-square", file: "post-square-example.png", transparent: false },
  { id: "post-square-blank", file: "post-square-template.png", transparent: false },
  { id: "post-portrait", file: "post-portrait-example.png", transparent: false },
  { id: "post-portrait-blank", file: "post-portrait-template.png", transparent: false },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1700, height: 1000 },
  deviceScaleFactor: 1,
});

const problems = [];
page.on("requestfailed", (r) => problems.push(`failed: ${r.url().slice(0, 90)}`));

await page.goto(`file:///${HERE}/brand.html`, { waitUntil: "networkidle" });

// Wait for the real webfonts, or the type will render in a fallback.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1800);

const usedFraunces = await page.evaluate(() =>
  document.fonts.check('400 100px "Fraunces"'),
);
console.log(`Fraunces loaded: ${usedFraunces ? "yes" : "NO — type will look wrong"}`);

for (const a of assets) {
  const el = page.locator(`#${a.id}`);
  const box = await el.boundingBox();
  await el.screenshot({
    path: path.join(OUT, a.file),
    omitBackground: a.transparent,
  });
  console.log(
    `  ${a.file.padEnd(34)} ${Math.round(box.width)}×${Math.round(box.height)}${a.transparent ? "  (transparent)" : ""}`,
  );
}

if (problems.length) {
  console.log("\nproblems:");
  for (const p of [...new Set(problems)].slice(0, 6)) console.log("  -", p);
}

await browser.close();
