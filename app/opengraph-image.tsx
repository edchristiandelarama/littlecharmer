import { ImageResponse } from "next/og";
import { site } from "@/lib/site.config";

/* The card that shows up when the shop is shared in Messenger, Viber or on
   Facebook — which for a business like this is most of how it gets seen.
   Drawn with plain divs and inline SVG; next/og has no access to the site CSS. */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

const PETALS = [0, 72, 144, 216, 288];

function Bloom({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {PETALS.map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy={-r}
          rx={r * 0.52}
          ry={r}
          transform={`rotate(${deg})`}
          fill={fill}
        />
      ))}
      <circle r={r * 0.3} fill="#d9b478" />
    </g>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "radial-gradient(60% 70% at 76% 42%, #3a2036 0%, #1b1119 62%, #120a11 100%)",
          padding: "0 74px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#a795a5",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <span style={{ width: 34, height: 1, background: "#d9b478" }} />
            {site.location.city} · {site.location.country}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#f6eff3",
              fontSize: 86,
              lineHeight: 1.02,
              marginTop: 22,
            }}
          >
            <span>Flowers that</span>
            <span style={{ color: "#ee9bae", fontStyle: "italic" }}>never wilt.</span>
          </div>

          <div
            style={{
              color: "#ddcfdb",
              fontSize: 27,
              lineHeight: 1.42,
              marginTop: 26,
              fontFamily: "sans-serif",
            }}
          >
            Handmade fuzzy wire bouquets, in any colour you can name.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 34,
              color: "#1b1119",
              background: "#d9b478",
              padding: "13px 28px",
              borderRadius: 100,
              fontSize: 24,
              fontFamily: "sans-serif",
              alignSelf: "flex-start",
            }}
          >
            {site.name}
          </div>
        </div>

        {/* the bouquet */}
        <svg width="430" height="500" viewBox="-110 -120 220 250">
          <g stroke="#4e8b4a" strokeWidth="5" strokeLinecap="round" fill="none">
            {[-62, -34, -8, 18, 44, 68].map((x, i) => (
              <path key={x} d={`M ${x} ${-46 + (i % 3) * 16} Q ${x * 0.4} 30 0 96`} />
            ))}
          </g>

          <path d="M -74 72 L 74 72 L 19 128 L -19 128 Z" fill="#7a5a3a" />

          <Bloom x={0} y={-62} r={27} fill="#ee9bae" />
          <Bloom x={-52} y={-38} r={23} fill="#c8102e" />
          <Bloom x={52} y={-38} r={23} fill="#f3f0e6" />
          <Bloom x={-26} y={-2} r={21} fill="#f5a623" />
          <Bloom x={28} y={0} r={21} fill="#c4a6e0" />
          <Bloom x={0} y={34} r={18} fill="#f5a9c0" />

          <rect x="-26" y="86" width="52" height="14" rx="7" fill="#c9a227" />
        </svg>
      </div>
    ),
    size,
  );
}
