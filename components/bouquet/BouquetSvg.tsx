import { shape as shapeDef, type FlowerShapeId } from "@/lib/flowers";
import { wire, tint } from "@/lib/wire-colours";

/* ===========================================================================
 * A BOUQUET, FLAT
 *
 * The same arrangement maths as the 3D version, drawn as SVG. It earns its
 * place three times over:
 *
 *   · the fallback when WebGL is unavailable or reduced-motion is on
 *   · the panel shown for products that don't have a photograph yet
 *   · the still image in link previews
 *
 * Deterministic, so a given set of stems always draws the same bouquet — the
 * placeholder for "Sunday Blush" looks like Sunday Blush every time.
 * =========================================================================== */

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Round to three decimals before it reaches an attribute.
 *
 * Node and the browser's V8 can disagree on the last bit of a Math.sin result,
 * which is invisible to look at but produces a different attribute string and
 * so a React hydration mismatch on every petal. Rounding makes the markup
 * identical on both sides — and shaves a good chunk off the HTML.
 */
const r3 = (n: number): number => Math.round(n * 1000) / 1000;

export interface SvgStem {
  shape: FlowerShapeId;
  colour: string;
  qty: number;
}

interface Bloom {
  x: number;
  y: number;
  r: number;
  shape: FlowerShapeId;
  colour: string;
  spin: number;
  depth: number;
}

function layout(stems: SvgStem[], radius: number): Bloom[] {
  // Foliage to the outside, blooms mixed through the middle — same ordering
  // rule as the 3D arrangement.
  const blooms: { shape: FlowerShapeId; colour: string }[][] = [];
  const foliage: { shape: FlowerShapeId; colour: string }[] = [];

  for (const g of stems) {
    const items = Array.from({ length: g.qty }, () => ({
      shape: g.shape,
      colour: g.colour,
    }));
    if (shapeDef(g.shape).foliage) foliage.push(...items);
    else blooms.push(items);
  }

  const mixed: { shape: FlowerShapeId; colour: string }[] = [];
  const longest = Math.max(0, ...blooms.map((b) => b.length));
  for (let i = 0; i < longest; i++) {
    for (const group of blooms) if (group[i]) mixed.push(group[i]);
  }

  const all = [...mixed, ...foliage];
  const n = all.length;

  return all.map((item, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const r = Math.sqrt(t) * radius;
    const theta = i * GOLDEN;

    const def = shapeDef(item.shape);
    // Squashed vertically: we're looking at a dome slightly from above.
    const y = r3(Math.sin(theta) * r * 0.74);
    return {
      x: r3(Math.cos(theta) * r),
      y,
      r: r3(def.geometry.petalLength * 30 * (1 - t * 0.16)),
      shape: item.shape,
      colour: item.colour,
      spin: (i * 47) % 360,
      depth: y,
    };
  });
}

function Bloom({ bloom }: { bloom: Bloom }) {
  const def = shapeDef(bloom.shape);
  const g = def.geometry;
  const base = wire(bloom.colour).hex;

  // Cap petal count — past about ten, SVG petals stop reading as separate.
  const petals = Math.min(g.petals, def.foliage ? 3 : 10);
  const angles = Array.from({ length: petals }, (_, i) => (i / petals) * 360);

  const petalLen = bloom.r;
  const petalWide = r3(bloom.r * (g.petalWidth / g.petalLength) * 0.92);

  const centreHex = g.centreColour ? wire(g.centreColour).hex : base;

  return (
    <g transform={`translate(${bloom.x} ${bloom.y}) rotate(${bloom.spin})`}>
      {/* petals, back row slightly darker so the flower has some depth */}
      {angles.map((a, i) => (
        <ellipse
          key={a}
          cx="0"
          cy={r3(-petalLen * 0.52)}
          rx={petalWide}
          ry={r3(petalLen * 0.52)}
          transform={`rotate(${r3(a)})`}
          fill={base}
          opacity={i % 2 === 0 ? 1 : 0.86}
        />
      ))}

      {/* the fuzz, faked with a soft lighter ring */}
      <circle
        r={r3(petalLen * 0.42)}
        fill="none"
        stroke={tint(base, 0.45)}
        strokeWidth={r3(petalLen * 0.08)}
        opacity="0.35"
      />

      {g.centre > 0.04 ? (
        <circle r={r3(bloom.r * g.centre * 1.7)} fill={centreHex} />
      ) : (
        <circle r={r3(bloom.r * 0.13)} fill={tint(base, 0.3)} />
      )}
    </g>
  );
}

export default function BouquetSvg({
  stems,
  wrapHex = "#b08a5e",
  ribbonHex = "#c9a227",
  showWrap = true,
  className,
  title,
}: {
  stems: SvgStem[];
  wrapHex?: string;
  ribbonHex?: string;
  showWrap?: boolean;
  className?: string;
  /** Accessible description. Omit when a caption already names the piece. */
  title?: string;
}) {
  const blooms = layout(stems, 66);
  // Painter's algorithm: further back drawn first.
  const sorted = [...blooms].sort((a, b) => a.depth - b.depth);

  const tieX = 0;
  const tieY = 96;

  return (
    <svg
      viewBox="-110 -105 220 240"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* stems, converging on the tie */}
      <g
        stroke="#4e8b4a"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      >
        {sorted.map((b, i) => (
          <path
            key={`stem-${i}`}
            d={`M ${b.x} ${b.y} Q ${r3(b.x * 0.45)} ${r3((b.y + tieY) * 0.5)} ${tieX} ${tieY}`}
          />
        ))}
      </g>

      {showWrap ? (
        <g>
          <path
            d={`M -78 74 L 78 74 L ${tieX + 20} ${tieY + 58} L ${tieX - 20} ${tieY + 58} Z`}
            fill={wrapHex}
            opacity="0.95"
          />
          <path
            d={`M -78 74 L 0 74 L ${tieX - 20} ${tieY + 58} Z`}
            fill="#000"
            opacity="0.12"
          />
        </g>
      ) : null}

      {sorted.map((b, i) => (
        <Bloom key={`bloom-${i}`} bloom={b} />
      ))}

      {showWrap ? (
        <g>
          <rect
            x={tieX - 26}
            y={tieY - 4}
            width="52"
            height="13"
            rx="6.5"
            fill={ribbonHex}
          />
          <path
            d={`M ${tieX - 6} ${tieY + 8} l -13 17 l 11 -3 z`}
            fill={ribbonHex}
            opacity="0.85"
          />
          <path
            d={`M ${tieX + 6} ${tieY + 8} l 13 17 l -11 -3 z`}
            fill={ribbonHex}
            opacity="0.85"
          />
        </g>
      ) : null}
    </svg>
  );
}
