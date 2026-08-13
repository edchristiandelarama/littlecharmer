# Little Charmer

The website for Little Charmer — handmade fuzzy wire (chenille) flowers, made to
order in the Philippines and shipped nationwide.

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## The five files you'll actually edit

Everything about the business lives in plain data files. You do not need to touch
any component to change what the site says or sells.

| File | What's in it |
|---|---|
| **`lib/site.config.ts`** | Contact details, Facebook page, hours, shipping zones, payment methods, the announcement bar, the promo banner, the About text, the FAQ answers, reviews |
| **`lib/products.ts`** | The catalogue — every bouquet, its price, occasions and stem list |
| **`lib/wire-colours.ts`** | Your chenille stock — the swatches behind the builder, the colour filter and the colour matcher |
| **`lib/flowers.ts`** | The flower shapes you make, their prices, and the wrap and ribbon options |
| **`public/photos/`** | Your photographs |

Anything invented is marked `⚠ PLACEHOLDER`. Search the project for that string
to find every one:

```bash
grep -rn "PLACEHOLDER" lib/
```

### Before it goes live

- [ ] Real contact details in `lib/site.config.ts` — especially `facebookPage`,
      which powers every "Send via Messenger" button and silently opens a dead
      page if it's wrong
- [ ] Real products and prices in `lib/products.ts`
- [ ] Wire colours sampled from a photo of your actual stock
- [ ] Photographs in `public/photos/`
- [ ] Payment methods and courier costs in `lib/site.config.ts`

### Adding a photo

Put the file in `public/photos/`, then set the path on the product:

```ts
photo: "/photos/sunday-blush.jpg",
```

Until you do, each piece draws its own bouquet from its stem list — so the shop
looks finished before you've shot anything. Portrait, roughly 4:5, works best.

---

## Where orders go

**The site works with no accounts and no API keys.** With nothing configured, the
order form still validates, still produces a formatted order, and hands the
customer two ways to send it: a Messenger deep link with the whole order
pre-typed, and a `mailto:` link that does the same in their email app.

To have orders arrive in your inbox automatically instead, get a free API key
from [resend.com](https://resend.com), then:

```bash
cp .env.example .env.local
# paste the key into RESEND_API_KEY
```

The form upgrades itself — no code changes. If the email service is ever
unreachable, it silently falls back to the manual buttons rather than losing the
order.

---

## How the 3D works

There are no model files to download. Every flower is generated in the browser:
each petal is a tube swept along a teardrop curve, which is literally how a
chenille petal is made — a length of wire bent into a loop and pinched at the
base.

Chenille reads as chenille because of two things, and both are handled in
`components/three/chenille.ts`:

1. **A fibrous surface** — a procedural normal map of thousands of tiny strokes,
   drawn once to a canvas and shared by every flower on the page.
2. **A soft silhouette** — a second, slightly inflated copy of the geometry drawn
   with a fresnel alpha, giving the bright halo you see around real fuzzy wire.
   Remove it and everything looks like coloured plastic.

The rim light in `components/three/Stage.tsx` is what lights that halo. It is the
single most important light in the scene.

### It degrades on purpose

3D is never assumed. `lib/use-capabilities.ts` checks for WebGL, a software
renderer, reduced-motion, save-data and low-end hardware, and only then mounts a
canvas. Everyone else gets `BouquetSvg` — the same arrangement maths drawn flat,
which also serves as the placeholder for products without photos.

The canvas also stops rendering entirely once it scrolls out of view or the tab
is backgrounded, so it isn't burning phone battery animating something nobody can
see.

**Debugging:** add `?render3d=1` to any URL to force the canvas on (useful in
headless browsers, which report a software renderer we'd normally reject), or
`?render3d=0` to force the static version.

---

## Pages

```
/                 the whole story, top to bottom
/shop             filterable gallery — filters live in the URL, so a filtered
                  view can be sent to a customer as a link
/shop/[slug]      one piece, its full stem list, and a way into the builder
/build            the bouquet builder; the whole design encodes into the URL
/order            order request form
/custom           bulk, weddings and giveaways
/faq              questions
/colour-matcher   pull a colour out of a photo, find the nearest wire
/api/order        receives the form
```

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 ·
three.js + React Three Fiber · GSAP ScrollTrigger · Lenis · zustand ·
react-hook-form + zod

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

Deploys to Vercel as-is. Everything except `/api/order` is static.
