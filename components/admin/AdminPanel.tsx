"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  MaterialsContent,
  ProductsContent,
  SiteContent,
} from "@/lib/content-schema";
import ProductsTab from "./ProductsTab";
import ColoursTab from "./ColoursTab";
import FlowersTab from "./FlowersTab";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * THE ADMIN PANEL
 *
 * A plain form over content/site.json. Deliberately not a page builder — the
 * layout and design are fixed, and the only things editable are the words,
 * which is the bit that actually changes week to week.
 * =========================================================================== */

type Tab =
  | "products"
  | "colours"
  | "flowers"
  | "shop"
  | "contact"
  | "banners"
  | "shipping"
  | "about"
  | "faqs"
  | "reviews";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "products", label: "Products", hint: "Pieces, prices, photos" },
  { id: "colours", label: "Wire colours", hint: "Your chenille stock" },
  { id: "flowers", label: "Flower shapes", hint: "Shapes, prices, 3D form" },
  { id: "shop", label: "Shop details", hint: "Name, tagline, where you are" },
  { id: "contact", label: "Contact", hint: "Email, Messenger, hours" },
  { id: "banners", label: "Banners", hint: "Top strip, promo, graduation" },
  { id: "shipping", label: "Delivery & payment", hint: "Zones, costs, how to pay" },
  { id: "about", label: "About & process", hint: "Your story, the four steps" },
  { id: "faqs", label: "Questions", hint: "The FAQ list" },
  { id: "reviews", label: "Reviews", hint: "What customers said" },
];

const input =
  "w-full rounded-lg border border-line-firm bg-surface px-3 py-2.5 text-cream placeholder:text-faint focus:border-brass";
const label = "flex flex-col gap-1.5 text-sm text-cream-2";

function Field({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={label}>
      <span>
        {title}
        {hint ? <span className="ml-2 text-xs text-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/** A list you can add to, remove from and reorder. */
function Repeater<T>({
  items,
  onChange,
  blank,
  render,
  addLabel,
  max = 20,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
  max?: number;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-line bg-surface/40 p-4 pr-24"
        >
          <div className="flex flex-col gap-3">
            {render(item, (patch) =>
              onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))),
            )}
          </div>

          <div className="absolute right-3 top-3 flex gap-1">
            <button
              type="button"
              onClick={() => move(i, i - 1)}
              disabled={i === 0}
              className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
            >
              <span className="sr-only">Move up</span>
              <span aria-hidden>↑</span>
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === items.length - 1}
              className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
            >
              <span className="sr-only">Move down</span>
              <span aria-hidden>↓</span>
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
            >
              <span className="sr-only">Delete</span>
              <span aria-hidden>×</span>
            </button>
          </div>
        </div>
      ))}

      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="self-start rounded-full border border-dashed border-line-firm px-4 py-2 text-sm text-cream-2 hover:border-brass hover:text-brass"
        >
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function AdminPanel({
  initial,
  initialProducts,
  initialMaterials,
}: {
  initial: SiteContent;
  initialProducts: ProductsContent;
  initialMaterials: MaterialsContent;
}) {
  const [data, setData] = useState<SiteContent>(initial);
  const [catalogue, setCatalogue] = useState<ProductsContent>(initialProducts);
  const [materials, setMaterials] = useState<MaterialsContent>(initialMaterials);

  /* The last saved state, one per file. Kept separately from the `initial`
     props because after a save those are stale — without this, "Undo all
     changes" would roll back to before the save you just made. */
  const [baseline, setBaseline] = useState<SiteContent>(initial);
  const [productBaseline, setProductBaseline] =
    useState<ProductsContent>(initialProducts);
  const [materialBaseline, setMaterialBaseline] =
    useState<MaterialsContent>(initialMaterials);
  const [tab, setTab] = useState<Tab>("products");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [target, setTarget] = useState<"disk" | "github" | "nowhere" | null>(null);

  const contentDirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(baseline),
    [data, baseline],
  );
  const productsDirty = useMemo(
    () => JSON.stringify(catalogue) !== JSON.stringify(productBaseline),
    [catalogue, productBaseline],
  );
  const materialsDirty = useMemo(
    () => JSON.stringify(materials) !== JSON.stringify(materialBaseline),
    [materials, materialBaseline],
  );
  const dirty = contentDirty || productsDirty || materialsDirty;

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => setTarget(d.target ?? null))
      .catch(() => setTarget(null));
  }, []);

  // Don't let a stray tab-close throw away twenty minutes of typing.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  /** One PUT. Returns an error string, or null when it worked. */
  const put = async (url: string, payload: unknown): Promise<string | null> => {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    if (response.ok && body.ok) return null;

    const detail = body.issues?.length
      ? ` (${body.issues
          .map((i: { path: string; message: string }) => `${i.path}: ${i.message}`)
          .join("; ")})`
      : "";
    return `${body.error ?? body.message ?? "Save failed."}${detail}`;
  };

  const save = async () => {
    setSaving(true);
    setResult(null);
    try {
      const errors: string[] = [];

      // Only send what actually changed, so saving from the Products tab
      // doesn't needlessly rewrite the site content file, and vice versa.
      // Materials first: products and content reference colour and shape ids,
      // so if only one save can land, the definitions are the safer one.
      if (materialsDirty) {
        const error = await put("/api/admin/materials", materials);
        if (error) errors.push(error);
        else setMaterialBaseline(materials);
      }

      if (productsDirty) {
        const error = await put("/api/admin/products", catalogue);
        if (error) errors.push(error);
        else setProductBaseline(catalogue);
      }

      if (contentDirty) {
        const error = await put("/api/admin/content", data);
        if (error) errors.push(error);
        else setBaseline(data);
      }

      setResult(
        errors.length
          ? { ok: false, message: errors.join(" · ") }
          : {
              ok: true,
              message:
                target === "github"
                  ? "Saved and committed. Your host will redeploy — live in a minute or two."
                  : "Saved. The page will refresh with your changes in a moment.",
            },
      );
    } catch {
      setResult({ ok: false, message: "Couldn't reach the server." });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* where saves go */}
      {target === "nowhere" ? (
        <p className="rounded-lg border border-petal/50 bg-petal/10 p-4 text-sm text-petal-bright">
          <strong>Nothing you save here will stick yet.</strong> This site is
          deployed on a host with a throwaway filesystem, and no GitHub
          connection is configured — so set <code>GITHUB_TOKEN</code> and{" "}
          <code>GITHUB_REPO</code> in your hosting environment variables first.
          See the README.
        </p>
      ) : target === "github" ? (
        <p className="rounded-lg border border-line bg-surface/50 p-3 text-sm text-muted">
          Saving commits to GitHub and redeploys the site — live in a minute or
          two.
        </p>
      ) : target === "disk" ? (
        <p className="rounded-lg border border-line bg-surface/50 p-3 text-sm text-muted">
          Running locally — saving writes straight to{" "}
          <code>content/site.json</code>. Commit and push it when you're happy.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        {/* tabs */}
        <nav aria-label="Sections" className="flex flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={clsx(
                "rounded-lg px-3.5 py-2.5 text-left transition-colors",
                tab === t.id
                  ? "bg-surface-2 text-cream"
                  : "text-cream-2 hover:bg-surface",
              )}
            >
              <span className="block text-sm">{t.label}</span>
              <span className="block text-xs text-faint">{t.hint}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={signOut}
            className="mt-4 rounded-lg px-3.5 py-2.5 text-left text-sm text-faint hover:text-petal"
          >
            Sign out
          </button>
        </nav>

        {/* panels */}
        <div className="flex flex-col gap-5 rounded-xl border border-line bg-ink p-5 sm:p-6">
          {tab === "products" ? (
            <ProductsTab
              products={catalogue.products}
              onChange={(products) => setCatalogue({ ...catalogue, products })}
            />
          ) : null}

          {tab === "colours" ? (
            <ColoursTab
              colours={materials.wireColours}
              products={catalogue.products}
              shapes={materials.flowerShapes}
              onChange={(wireColours) => setMaterials({ ...materials, wireColours })}
            />
          ) : null}

          {tab === "flowers" ? (
            <FlowersTab
              shapes={materials.flowerShapes}
              colours={materials.wireColours}
              products={catalogue.products}
              onChange={(flowerShapes) => setMaterials({ ...materials, flowerShapes })}
            />
          ) : null}

          {tab === "shop" ? (
            <>
              <Field title="Shop name">
                <input
                  className={input}
                  value={data.shop.name}
                  onChange={(e) =>
                    patch("shop", { ...data.shop, name: e.target.value })
                  }
                />
              </Field>
              <Field title="Tagline" hint="Shown under the logo and in link previews">
                <input
                  className={input}
                  value={data.shop.tagline}
                  onChange={(e) =>
                    patch("shop", { ...data.shop, tagline: e.target.value })
                  }
                />
              </Field>
              <Field title="Description" hint="One sentence — used by Google and Facebook">
                <textarea
                  rows={3}
                  className={input}
                  value={data.shop.description}
                  onChange={(e) =>
                    patch("shop", { ...data.shop, description: e.target.value })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field title="City">
                  <input
                    className={input}
                    value={data.shop.city}
                    onChange={(e) =>
                      patch("shop", { ...data.shop, city: e.target.value })
                    }
                  />
                </Field>
                <Field title="Province / region">
                  <input
                    className={input}
                    value={data.shop.region}
                    onChange={(e) =>
                      patch("shop", { ...data.shop, region: e.target.value })
                    }
                  />
                </Field>
                <Field title="Country">
                  <input
                    className={input}
                    value={data.shop.country}
                    onChange={(e) =>
                      patch("shop", { ...data.shop, country: e.target.value })
                    }
                  />
                </Field>
              </div>
            </>
          ) : null}

          {tab === "contact" ? (
            <>
              <Field title="Email" hint="Where order requests are sent">
                <input
                  className={input}
                  value={data.contact.email}
                  onChange={(e) =>
                    patch("contact", { ...data.contact, email: e.target.value })
                  }
                />
              </Field>

              <Field
                title="Facebook page username"
                hint="The bit after facebook.com/ — every Messenger button depends on this"
              >
                <input
                  className={input}
                  value={data.contact.facebookPage}
                  onChange={(e) =>
                    patch("contact", {
                      ...data.contact,
                      facebookPage: e.target.value,
                    })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field title="Phone" hint="+63 format, for Viber">
                  <input
                    className={input}
                    value={data.contact.phone}
                    onChange={(e) =>
                      patch("contact", { ...data.contact, phone: e.target.value })
                    }
                  />
                </Field>
                <Field title="Phone, as displayed">
                  <input
                    className={input}
                    value={data.contact.phoneDisplay}
                    onChange={(e) =>
                      patch("contact", {
                        ...data.contact,
                        phoneDisplay: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field title="Instagram" hint="Username only, blank to hide">
                  <input
                    className={input}
                    value={data.contact.instagram}
                    onChange={(e) =>
                      patch("contact", {
                        ...data.contact,
                        instagram: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field title="TikTok" hint="Username only, blank to hide">
                  <input
                    className={input}
                    value={data.contact.tiktok}
                    onChange={(e) =>
                      patch("contact", { ...data.contact, tiktok: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field title="How fast you reply" hint="Shown after someone orders">
                <input
                  className={input}
                  value={data.contact.replyWindow}
                  onChange={(e) =>
                    patch("contact", {
                      ...data.contact,
                      replyWindow: e.target.value,
                    })
                  }
                />
              </Field>

              <label className="flex items-center gap-3 text-sm text-cream-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brass"
                  checked={data.contact.viberEnabled}
                  onChange={(e) =>
                    patch("contact", {
                      ...data.contact,
                      viberEnabled: e.target.checked,
                    })
                  }
                />
                Show a Viber button
              </label>

              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <h3 className="eyebrow">Opening hours</h3>
                <Repeater
                  items={data.contact.hours}
                  onChange={(hours) => patch("contact", { ...data.contact, hours })}
                  blank={() => ({ days: "", time: "" })}
                  addLabel="Add a row"
                  max={7}
                  render={(item, set) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={input}
                        placeholder="Monday – Saturday"
                        value={item.days}
                        onChange={(e) => set({ days: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="9:00 AM – 7:00 PM"
                        value={item.time}
                        onChange={(e) => set({ time: e.target.value })}
                      />
                    </div>
                  )}
                />
              </div>
            </>
          ) : null}

          {tab === "banners" ? (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="eyebrow">Top strip</h3>
                <p className="text-xs text-muted">
                  These rotate one at a time at the very top of every page. Leave
                  the link blank if it shouldn&apos;t be clickable.
                </p>
                <Repeater
                  items={data.announcements}
                  onChange={(v) => patch("announcements", v)}
                  blank={() => ({ text: "", href: "" })}
                  addLabel="Add a line"
                  max={8}
                  render={(item, set) => (
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                      <input
                        className={input}
                        placeholder="Something worth saying"
                        value={item.text}
                        onChange={(e) => set({ text: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="/shop (optional)"
                        value={item.href}
                        onChange={(e) => set({ href: e.target.value })}
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <h3 className="eyebrow">Promo banner</h3>
                <label className="flex items-center gap-3 text-sm text-cream-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brass"
                    checked={data.promo.active}
                    onChange={(e) =>
                      patch("promo", { ...data.promo, active: e.target.checked })
                    }
                  />
                  Show the promo banner on the home page
                </label>

                {data.promo.active ? (
                  <div className="flex flex-col gap-3">
                    <Field title="Kicker" hint="Small label above the headline">
                      <input
                        className={input}
                        value={data.promo.kicker}
                        onChange={(e) =>
                          patch("promo", { ...data.promo, kicker: e.target.value })
                        }
                      />
                    </Field>
                    <Field title="Headline">
                      <input
                        className={input}
                        value={data.promo.headline}
                        onChange={(e) =>
                          patch("promo", { ...data.promo, headline: e.target.value })
                        }
                      />
                    </Field>
                    <Field title="Body">
                      <textarea
                        rows={3}
                        className={input}
                        value={data.promo.body}
                        onChange={(e) =>
                          patch("promo", { ...data.promo, body: e.target.value })
                        }
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field title="Button label">
                        <input
                          className={input}
                          value={data.promo.ctaLabel}
                          onChange={(e) =>
                            patch("promo", {
                              ...data.promo,
                              ctaLabel: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field title="Button link">
                        <input
                          className={input}
                          value={data.promo.ctaHref}
                          onChange={(e) =>
                            patch("promo", {
                              ...data.promo,
                              ctaHref: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <h3 className="eyebrow">Graduation season</h3>
                <label className="flex items-center gap-3 text-sm text-cream-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brass"
                    checked={data.gradSeason.active}
                    onChange={(e) =>
                      patch("gradSeason", {
                        ...data.gradSeason,
                        active: e.target.checked,
                      })
                    }
                  />
                  Show the graduation notice during the months below
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field title="From month" hint="1 = January">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className={input}
                      value={data.gradSeason.startMonth}
                      onChange={(e) =>
                        patch("gradSeason", {
                          ...data.gradSeason,
                          startMonth: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field title="To month">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className={input}
                      value={data.gradSeason.endMonth}
                      onChange={(e) =>
                        patch("gradSeason", {
                          ...data.gradSeason,
                          endMonth: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field title="Headline">
                  <input
                    className={input}
                    value={data.gradSeason.headline}
                    onChange={(e) =>
                      patch("gradSeason", {
                        ...data.gradSeason,
                        headline: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field title="Body">
                  <textarea
                    rows={3}
                    className={input}
                    value={data.gradSeason.body}
                    onChange={(e) =>
                      patch("gradSeason", {
                        ...data.gradSeason,
                        body: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>
            </>
          ) : null}

          {tab === "shipping" ? (
            <>
              <Field
                title="Lead time note"
                hint="Shown wherever the site talks about how long things take"
              >
                <textarea
                  rows={3}
                  className={input}
                  value={data.fulfilment.leadTimeNote}
                  onChange={(e) =>
                    patch("fulfilment", {
                      ...data.fulfilment,
                      leadTimeNote: e.target.value,
                    })
                  }
                />
              </Field>

              <Field title="Deposit policy">
                <textarea
                  rows={2}
                  className={input}
                  value={data.fulfilment.depositNote}
                  onChange={(e) =>
                    patch("fulfilment", {
                      ...data.fulfilment,
                      depositNote: e.target.value,
                    })
                  }
                />
              </Field>

              <Field title="Payment methods" hint="One per line">
                <textarea
                  rows={4}
                  className={input}
                  value={data.fulfilment.payments.join("\n")}
                  onChange={(e) =>
                    patch("fulfilment", {
                      ...data.fulfilment,
                      payments: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>

              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <h3 className="eyebrow">Delivery zones</h3>
                <Repeater
                  items={data.fulfilment.zones}
                  onChange={(zones) =>
                    patch("fulfilment", { ...data.fulfilment, zones })
                  }
                  blank={() => ({ name: "", detail: "", cost: "" })}
                  addLabel="Add a zone"
                  max={8}
                  render={(item, set) => (
                    <>
                      <input
                        className={input}
                        placeholder="Where"
                        value={item.name}
                        onChange={(e) => set({ name: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="How it gets there"
                        value={item.detail}
                        onChange={(e) => set({ detail: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="₱ cost"
                        value={item.cost}
                        onChange={(e) => set({ cost: e.target.value })}
                      />
                    </>
                  )}
                />
              </div>
            </>
          ) : null}

          {tab === "about" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field title="Kicker">
                  <input
                    className={input}
                    value={data.about.kicker}
                    onChange={(e) =>
                      patch("about", { ...data.about, kicker: e.target.value })
                    }
                  />
                </Field>
                <Field title="Headline">
                  <input
                    className={input}
                    value={data.about.headline}
                    onChange={(e) =>
                      patch("about", { ...data.about, headline: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field
                title="Your story"
                hint="One paragraph per line — leave a blank line between them"
              >
                <textarea
                  rows={10}
                  className={input}
                  value={data.about.body.join("\n\n")}
                  onChange={(e) =>
                    patch("about", {
                      ...data.about,
                      body: e.target.value
                        .split(/\n\s*\n/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field title="Photo path" hint="e.g. /photos/hands.jpg — blank for the drawn panel">
                  <input
                    className={input}
                    value={data.about.photo}
                    onChange={(e) =>
                      patch("about", { ...data.about, photo: e.target.value })
                    }
                  />
                </Field>
                <Field title="Photo caption">
                  <input
                    className={input}
                    value={data.about.photoCaption}
                    onChange={(e) =>
                      patch("about", {
                        ...data.about,
                        photoCaption: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <h3 className="eyebrow">How we make it — the four steps</h3>
                <Repeater
                  items={data.craftSteps}
                  onChange={(v) => patch("craftSteps", v)}
                  blank={() => ({ step: "", body: "", detail: "" })}
                  addLabel="Add a step"
                  max={8}
                  render={(item, set) => (
                    <>
                      <input
                        className={input}
                        placeholder="Step name"
                        value={item.step}
                        onChange={(e) => set({ step: e.target.value })}
                      />
                      <textarea
                        rows={3}
                        className={input}
                        placeholder="What happens at this step"
                        value={item.body}
                        onChange={(e) => set({ body: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="Small detail line"
                        value={item.detail}
                        onChange={(e) => set({ detail: e.target.value })}
                      />
                    </>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <h3 className="eyebrow">The three promises</h3>
                <Repeater
                  items={data.promises}
                  onChange={(v) => patch("promises", v)}
                  blank={() => ({ title: "", body: "", stat: "", statUnit: "" })}
                  addLabel="Add a promise"
                  max={6}
                  render={(item, set) => (
                    <>
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
                        <input
                          className={input}
                          placeholder="Big number"
                          value={item.stat}
                          onChange={(e) => set({ stat: e.target.value })}
                        />
                        <input
                          className={input}
                          placeholder="Its unit"
                          value={item.statUnit}
                          onChange={(e) => set({ statUnit: e.target.value })}
                        />
                        <input
                          className={input}
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => set({ title: e.target.value })}
                        />
                      </div>
                      <textarea
                        rows={3}
                        className={input}
                        placeholder="The explanation"
                        value={item.body}
                        onChange={(e) => set({ body: e.target.value })}
                      />
                    </>
                  )}
                />
              </div>
            </>
          ) : null}

          {tab === "faqs" ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted">
                Every answer here is one message you never have to type again.
              </p>
              <Repeater
                items={data.faqs}
                onChange={(v) => patch("faqs", v)}
                blank={() => ({ q: "", a: "" })}
                addLabel="Add a question"
                max={30}
                render={(item, set) => (
                  <>
                    <input
                      className={input}
                      placeholder="The question, as someone would ask it"
                      value={item.q}
                      onChange={(e) => set({ q: e.target.value })}
                    />
                    <textarea
                      rows={4}
                      className={input}
                      placeholder="Your answer"
                      value={item.a}
                      onChange={(e) => set({ a: e.target.value })}
                    />
                  </>
                )}
              />
            </div>
          ) : null}

          {tab === "reviews" ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted">
                Real ones only. Copying what someone actually wrote on Facebook
                reads far better than anything invented.
              </p>
              <Repeater
                items={data.reviews}
                onChange={(v) => patch("reviews", v)}
                blank={() => ({
                  name: "",
                  where: "",
                  occasion: "",
                  stars: 5,
                  text: "",
                })}
                addLabel="Add a review"
                max={40}
                render={(item, set) => (
                  <>
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_5rem]">
                      <input
                        className={input}
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) => set({ name: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="Where they are"
                        value={item.where}
                        onChange={(e) => set({ where: e.target.value })}
                      />
                      <input
                        className={input}
                        placeholder="Occasion"
                        value={item.occasion}
                        onChange={(e) => set({ occasion: e.target.value })}
                      />
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className={input}
                        value={item.stars}
                        onChange={(e) => set({ stars: Number(e.target.value) })}
                      />
                    </div>
                    <textarea
                      rows={3}
                      className={input}
                      placeholder="What they said"
                      value={item.text}
                      onChange={(e) => set({ text: e.target.value })}
                    />
                  </>
                )}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* save bar */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-ink/95 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty || target === "nowhere"}
          className="rounded-full bg-brass px-7 py-3 font-semibold text-ink transition-colors hover:bg-brass-bright disabled:opacity-40"
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Nothing to save"}
        </button>

        {dirty ? (
          <button
            type="button"
            onClick={() => {
              setData(baseline);
              setCatalogue(productBaseline);
              setMaterials(materialBaseline);
              setResult(null);
            }}
            className="text-sm text-faint underline underline-offset-4 hover:text-cream-2"
          >
            Undo all changes
          </button>
        ) : null}

        {result ? (
          <p
            role="status"
            className={clsx(
              "text-sm",
              result.ok ? "text-leaf" : "text-petal-bright",
            )}
          >
            {result.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
