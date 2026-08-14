import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FlowerShape } from "@/lib/flowers";

/* ===========================================================================
 * BUILDING A FLOWER THE WAY YOU'D ACTUALLY BUILD ONE
 *
 * Every petal here is one length of wire bent into a closed loop and pinched at
 * the base — a tube swept along a teardrop curve. That's not a stylisation of
 * how chenille flowers are made, it's the method. It also means no model files
 * to download: a bouquet is generated in the browser in a few milliseconds.
 *
 * Local space: the stem base sits at the origin and the flower head is up at
 * +Y, so a bouquet can be arranged by fanning stems out from a single tie point
 * the way a real hand-tied bouquet is.
 * =========================================================================== */

export type Quality = "high" | "low";

export interface FlowerGeometry {
  petals: THREE.BufferGeometry;
  centre: THREE.BufferGeometry | null;
  stem: THREE.BufferGeometry;
  /** Where the head sits, for placing highlights and labels. */
  headHeight: number;
}

const RAD = Math.PI / 180;

/** One petal: a closed teardrop loop, cupped backwards so it isn't flat. */
function petalCurve(length: number, width: number): THREE.CatmullRomCurve3 {
  const l = length;
  const w = width;
  // Cup depth grows toward the tip — a flat loop reads as a cut-out, not a petal.
  const cup = (t: number) => -l * 0.2 * t * t;

  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(w * 0.44, l * 0.18, cup(0.18)),
    new THREE.Vector3(w * 0.52, l * 0.55, cup(0.55)),
    new THREE.Vector3(w * 0.24, l * 0.93, cup(0.93)),
    new THREE.Vector3(0, l, cup(1)),
    new THREE.Vector3(-w * 0.24, l * 0.93, cup(0.93)),
    new THREE.Vector3(-w * 0.52, l * 0.55, cup(0.55)),
    new THREE.Vector3(-w * 0.44, l * 0.18, cup(0.18)),
  ];

  return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.4);
}

/** Spread `total` petals across `layers`, weighting the outer layers heavier. */
function petalsPerLayer(total: number, layers: number): number[] {
  if (layers <= 1) return [total];

  const weights = Array.from({ length: layers }, (_, i) => layers - i);
  const sum = weights.reduce((a, b) => a + b, 0);

  const out = weights.map((w) => Math.max(1, Math.round((total * w) / sum)));
  // Rounding drifts; put the difference on the outermost layer.
  const drift = total - out.reduce((a, b) => a + b, 0);
  out[0] = Math.max(1, out[0] + drift);
  return out;
}

/** The stem: a thin tube with a slight lean, because nothing handmade is straight. */
function stemGeometry(shape: FlowerShape, q: Quality): THREE.BufferGeometry {
  const h = shape.geometry.stemLength;
  const lean = 0.06;

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(lean * 0.4, h * 0.35, lean * 0.2),
    new THREE.Vector3(-lean * 0.3, h * 0.7, -lean * 0.15),
    new THREE.Vector3(0, h, 0),
  ]);

  return new THREE.TubeGeometry(
    curve,
    q === "high" ? 20 : 10,
    shape.geometry.wireRadius * 0.82,
    q === "high" ? 6 : 4,
    false,
  );
}

const cache = new Map<string, FlowerGeometry>();

/**
 * Cache key.
 *
 * Includes every geometry value, not just the shape id — otherwise editing a
 * shape in the admin would keep handing back the flower built from the old
 * numbers, and the live preview would appear frozen.
 */
function cacheKey(shape: FlowerShape, quality: Quality): string {
  const g = shape.geometry;
  return [
    shape.id,
    quality,
    g.petals,
    g.layers,
    g.petalLength,
    g.petalWidth,
    g.wireRadius,
    g.openness,
    g.layerTwist,
    g.centre,
    g.stemLength,
  ].join("|");
}

export function buildFlowerGeometry(
  shape: FlowerShape,
  quality: Quality = "high",
): FlowerGeometry {
  const key = cacheKey(shape, quality);
  const hit = cache.get(key);
  if (hit) return hit;

  // Editing a shape produces a new key every keystroke, so old geometry would
  // pile up on the GPU. Evict the oldest once the cache gets unreasonable.
  if (cache.size > 60) {
    const oldest = cache.keys().next().value;
    if (oldest) {
      const stale = cache.get(oldest);
      stale?.petals.dispose();
      stale?.centre?.dispose();
      stale?.stem.dispose();
      cache.delete(oldest);
    }
  }

  const g = shape.geometry;
  const headY = g.stemLength;

  const tubular = quality === "high" ? 44 : 22;
  const radial = quality === "high" ? 6 : 4;

  const petalPieces: THREE.BufferGeometry[] = [];
  const counts = petalsPerLayer(g.petals, g.layers);

  for (let layer = 0; layer < counts.length; layer++) {
    // 0 at the outside, 1 at the innermost layer.
    const t = counts.length === 1 ? 0 : layer / (counts.length - 1);

    // Inner petals are smaller, more upright and sit a little higher — that
    // gradient is what makes a rose look like a rose rather than a pom-pom.
    const layerScale = 1 - t * 0.32;
    const layerOpen = g.openness * (1 - t * 0.72);
    const layerLift = t * g.petalLength * 0.2;

    const curve = petalCurve(g.petalLength * layerScale, g.petalWidth * layerScale);
    const base = new THREE.TubeGeometry(
      curve,
      tubular,
      g.wireRadius,
      radial,
      true,
    );

    const n = counts[layer];
    for (let i = 0; i < n; i++) {
      const petal = base.clone();

      // Nudge each petal off perfect symmetry. Deterministic, so the flower
      // looks the same every render, but no two petals sit identically.
      const jitter = Math.sin((layer * 7.13 + i * 2.79) * 12.9898) * 0.5;

      const azimuth = (i / n) * Math.PI * 2 + layer * g.layerTwist * RAD + jitter * 0.08;
      const tilt = (layerOpen + jitter * 5) * RAD;

      const m = new THREE.Matrix4();
      // Order matters: tilt the petal away from vertical, swing it around the
      // stem, then lift it to the head.
      m.makeRotationX(tilt);
      m.premultiply(new THREE.Matrix4().makeRotationY(azimuth));
      m.premultiply(
        new THREE.Matrix4().makeTranslation(0, headY + layerLift, 0),
      );

      petal.applyMatrix4(m);
      petalPieces.push(petal);
    }

    base.dispose();
  }

  const petals =
    mergeGeometries(petalPieces, false) ?? new THREE.BufferGeometry();
  petalPieces.forEach((p) => p.dispose());
  petals.computeVertexNormals();

  // The seeded middle of a daisy or sunflower: a flattened dome.
  let centre: THREE.BufferGeometry | null = null;
  if (g.centre > 0.04) {
    const sphere = new THREE.SphereGeometry(
      g.centre,
      quality === "high" ? 20 : 12,
      quality === "high" ? 14 : 8,
    );
    sphere.scale(1, 0.5, 1);
    sphere.translate(0, headY + g.centre * 0.2, 0);
    centre = sphere;
  }

  const built: FlowerGeometry = {
    petals,
    centre,
    stem: stemGeometry(shape, quality),
    headHeight: headY,
  };

  cache.set(key, built);
  return built;
}

/** Drop every cached geometry. Called when the last canvas unmounts. */
export function disposeFlowerGeometry() {
  cache.forEach((f) => {
    f.petals.dispose();
    f.centre?.dispose();
    f.stem.dispose();
  });
  cache.clear();
}

/* ---------------------------------------------------------------------------
 * ARRANGING A BOUQUET
 *
 * Stems all meet at one tie point and fan outward into a dome, which is how a
 * hand-tied bouquet is built and why they look round from every side. Placement
 * is deterministic — the same build always produces the same arrangement, so a
 * shared link shows the recipient exactly what the sender saw.
 * ------------------------------------------------------------------------- */

export interface StemPlacement {
  /** Rotation about the tie point, radians. */
  lean: number;
  azimuth: number;
  /** Slight spin so identical flowers don't face the same way. */
  roll: number;
  scale: number;
}

/**
 * Positions on a phyllotactic spiral — the arrangement sunflowers and
 * pinecones use. It fills a dome evenly without the rings you get from naive
 * concentric placement, and it's what makes a generated bouquet look arranged
 * rather than scattered.
 */
export function arrangeBouquet(count: number, spread = 0.42): StemPlacement[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: StemPlacement[] = [];

  for (let i = 0; i < count; i++) {
    // sqrt keeps density even from the middle outward.
    const r = count === 1 ? 0 : Math.sqrt(i / (count - 1));
    const azimuth = i * golden;

    out.push({
      lean: r * spread,
      azimuth,
      roll: (i * 47) % 360 * RAD,
      // Outer stems slightly shorter, so the dome reads as a dome.
      scale: 1 - r * 0.1,
    });
  }

  return out;
}
