# Little Charmer

The website for Little Charmer — handmade fuzzy wire (chenille) flowers, made to
order in Lapu-Lapu City, Cebu and shipped nationwide.

```bash
npm install
npm run dev        # http://localhost:3000
```

---

## The admin panel

**Go to `/admin`** — locally that's <http://localhost:3000/admin>, and once
deployed it's `your-site.com/admin`.

It's password-protected and edits everything the website *says*: shop details,
contact info, the top banner, delivery zones, your About story, the FAQ and the
reviews. The design and layout are fixed; this is the words.

It does **not** show orders — those go to your email and Messenger.

### Setting the password

Nothing can sign in until you set one.

**Locally**, make a file called `.env.local` in this folder:

```bash
ADMIN_PASSWORD=pick-something-long-and-not-guessable
ADMIN_SECRET=any-long-random-string
```

Then restart (`npm run dev`). Generate a good `ADMIN_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Once deployed**, add those same two as environment variables in your host's
dashboard. Never commit them — `.env.local` is already git-ignored.

### Making saves stick once deployed

This one matters and is easy to get wrong.

Vercel and Netlify give your deployed site a **throwaway filesystem**. If the
admin just wrote a file there, your edits would look saved and then silently
vanish on the next deploy. So instead, **saving commits the change to GitHub**,
which persists it *and* redeploys the site automatically. You also get a full
history of every edit for free.

For that you need two more environment variables on your host:

```bash
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=edchristiandelarama/littlecharmer
GITHUB_BRANCH=main
```

Make the token at **[github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)**:

- **Repository access** → Only select repositories → `littlecharmer`
- **Permissions** → Repository permissions → **Contents: Read and write**
- Copy the token immediately; GitHub won't show it again

The token lives on the server and is never sent to the browser.

If you skip this, the admin will tell you plainly that nothing it saves will
stick. Running locally you can ignore it entirely — saves go straight to
`content/site.json`, and you commit them yourself.

---

## Where to host it, free

| | Free tier | Commercial use | Next.js support |
|---|---|---|---|
| **Netlify** ← recommended | 100 GB/mo, functions included | **Allowed** | Full |
| Vercel | 100 GB/mo, functions included | **Hobby tier is personal/non-commercial per their terms** | Best-in-class (they make Next.js) |
| Cloudflare Pages | Very generous | Allowed | Needs an adapter — more setup |

**I'd use Netlify.** Vercel is technically the smoothest option because they
build Next.js, but their free Hobby tier is documented as being for personal,
non-commercial projects — and this is a shop. Plenty of small businesses use it
anyway, but you'd be relying on not being noticed. Netlify's free tier permits
commercial use outright, so there's nothing to worry about.

### Deploying to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in **with GitHub**
2. **Add new site → Import an existing project → GitHub → `littlecharmer`**
3. Leave the build settings alone — it detects Next.js
4. Before the first deploy, open **Environment variables** and add:
   `ADMIN_PASSWORD`, `ADMIN_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`,
   `GITHUB_BRANCH`, and `NEXT_PUBLIC_SITE_URL` (your new URL)
5. **Deploy**

You get `something.netlify.app` with HTTPS. Every `git push` redeploys, and so
does every save from the admin panel. A custom domain is free to point at it —
you only pay whoever you buy the domain from.

---

## The files you'd edit by hand

The admin covers the words. These are the things it deliberately doesn't:

| File | What's in it |
|---|---|
| **`content/site.json`** | Everything the admin edits. Editable by hand too. |
| **`lib/products.ts`** | The catalogue — bouquets, prices, occasions, stem lists |
| **`lib/wire-colours.ts`** | Your chenille stock — drives the builder and colour matcher |
| **`lib/flowers.ts`** | Flower shapes, their prices, wraps and ribbons |
| **`public/photos/`** | Your photographs |

Anything still invented is marked `⚠ PLACEHOLDER`:

```bash
grep -rn "PLACEHOLDER" lib/
```

### Before it goes live

- [ ] Real contact details in the admin — especially the **Facebook page
      username**, which every "Send via Messenger" button depends on
- [ ] Real products and prices in `lib/products.ts`
- [ ] Wire colours sampled from a photo of your actual stock
- [ ] Photographs in `public/photos/`

### Adding a photo

Put the file in `public/photos/`, then set the path on the product:

```ts
photo: "/photos/sunday-blush.jpg",
```

Until you do, each piece draws its own bouquet from its stem list — so the shop
looks finished before you've shot anything. Portrait, roughly 4:5, works best.

---

## Where orders go

**The site works with no accounts and no API keys.** With nothing configured,
the order form still validates, still produces a formatted order, and gives the
customer two ways to send it: a Messenger deep link with the order pre-typed,
and a `mailto:` link that does the same in their email app.

To have orders arrive in your inbox automatically, get a free key from
[resend.com](https://resend.com) and set `RESEND_API_KEY`. The form upgrades
itself. If the service is ever unreachable it falls back to the manual buttons
rather than losing the order.

---

## How the 3D works

No model files. Every flower is generated in the browser: each petal is a tube
swept along a teardrop curve, which is literally how a chenille petal is made —
a length of wire bent into a loop and pinched at the base.

Chenille reads as chenille because of two things, both in
`components/three/chenille.ts`:

1. **A fibrous surface** — a procedural normal map of thousands of tiny strokes,
   drawn once and shared by every flower on the page.
2. **A soft silhouette** — a second, slightly inflated copy of the geometry with
   a fresnel alpha, giving the bright halo real fuzzy wire has. Remove it and
   everything looks like coloured plastic.

The rim light in `components/three/Stage.tsx` is what lights that halo. It's the
most important light in the scene.

### It degrades on purpose

3D is never assumed. `lib/use-capabilities.ts` checks for WebGL, a software
renderer, reduced-motion, save-data and weak hardware before mounting a canvas.
Everyone else gets `BouquetSvg` — the same arrangement maths drawn flat, which
doubles as the placeholder for products without photos.

The canvas also stops rendering when scrolled out of view or the tab is
backgrounded, so it isn't draining phone batteries.

**Debugging:** add `?render3d=1` to any URL to force the canvas on (useful in
headless browsers, which report a software renderer we'd normally reject), or
`?render3d=0` to force the static version.

### One thing to know if you touch the animations

The "How we make it" section holds still while you scroll past it. That's CSS
`position: sticky`, **not** a JavaScript pin — and it must stay that way.
GSAP's ScrollTrigger `pin` works by reparenting the pinned element into a
generated wrapper, which React doesn't know about; navigating away then throws
*"Failed to execute 'removeChild' on 'Node'"* and breaks the page. Sticky gets
the same effect without moving any nodes.

---

## Pages

```
/                 the whole story, top to bottom
/shop             filterable gallery — filters live in the URL
/shop/[slug]      one piece, its stem list, and a way into the builder
/build            the bouquet builder; the design encodes into the URL
/order            order request form
/custom           bulk, weddings and giveaways
/faq              questions
/colour-matcher   pull a colour out of a photo, find the nearest wire
/admin            edit the site's content  ← password required
```

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 ·
three.js + React Three Fiber · Lenis · zustand · react-hook-form + zod

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```
