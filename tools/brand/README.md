# Brand assets

The PNGs in `public/brand/` are generated from `brand.html` — Chromium renders
it and screenshots each block at its exact pixel size, so the files use the same
Fraunces, the same Locket mark and the same colours as the website. Nothing is
hand-matched, and nothing drifts.

To regenerate after a branding change:

```bash
npm run dev                 # the post examples pull photos from localhost
npx playwright install chromium   # first time only
node tools/brand/generate.mjs
```

Edit `brand.html` to change wording, sizes or which photo an example uses.
