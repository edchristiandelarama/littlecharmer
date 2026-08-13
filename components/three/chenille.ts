import * as THREE from "three";
import { tint } from "@/lib/wire-colours";

/* ===========================================================================
 * MAKING WIRE LOOK FUZZY
 *
 * Chenille reads as chenille because of two things, and neither of them is the
 * shape of the flower:
 *
 *   1. The surface is matte and fibrous — thousands of tiny hairs all pointing
 *      different ways, so it scatters light instead of reflecting it.
 *   2. The silhouette is soft. Light passing at a grazing angle lights up the
 *      hairs standing off the edge, giving a bright halo around every petal.
 *
 * A plain tube gives us neither. So: a procedural fibre normal map handles (1),
 * and a second, slightly inflated shell mesh with a fresnel alpha handles (2).
 * Skip the halo and this looks like coloured plastic — it really is the part
 * that does the work.
 * =========================================================================== */

/* --- the fibre texture -----------------------------------------------------
 * Drawn once, shared by every flower on the page. A height field of short
 * random strokes, converted to a normal map with a Sobel pass.
 * ------------------------------------------------------------------------- */

let fibreNormalMap: THREE.Texture | null = null;
let fibreRoughnessMap: THREE.Texture | null = null;

const TEX = 256;
const STROKES = 5200;

function drawFibreHeight(): ImageData | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, TEX, TEX);

  // Deterministic pseudo-random, so the texture is identical between reloads
  // and between server and client. Math.random would be fine visually but
  // makes differences impossible to debug.
  let seed = 20240412;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  ctx.lineCap = "round";
  for (let i = 0; i < STROKES; i++) {
    const x = rand() * TEX;
    const y = rand() * TEX;
    const angle = rand() * Math.PI * 2;
    const len = 2 + rand() * 5;
    const bright = rand();
    // A spread of light and dark hairs; the extremes are what catch the eye.
    const v = Math.round(128 + (bright - 0.5) * 210);
    ctx.strokeStyle = `rgb(${v},${v},${v})`;
    ctx.lineWidth = 0.6 + rand() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, TEX, TEX);
}

/** Sobel the height field into a tangent-space normal map. */
function heightToNormal(height: ImageData, strength = 2.4): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;

  const out = document.createElement("canvas");
  out.width = out.height = TEX;
  const ctx = out.getContext("2d");
  if (!ctx) return null;

  const dst = ctx.createImageData(TEX, TEX);
  const h = (x: number, y: number) => {
    // Wrap, so the texture tiles without a visible seam.
    const xi = (x + TEX) % TEX;
    const yi = (y + TEX) % TEX;
    return height.data[(yi * TEX + xi) * 4] / 255;
  };

  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const dx =
        h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1) -
        (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1));
      const dy =
        h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1) -
        (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1));

      const nx = dx * strength;
      const ny = dy * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;

      const i = (y * TEX + x) * 4;
      dst.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      dst.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      dst.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      dst.data[i + 3] = 255;
    }
  }

  ctx.putImageData(dst, 0, 0);
  return out;
}

/** Reuse the height field as a roughness variation map — real fuzz is not
 *  uniformly rough, and the variation stops highlights looking painted on. */
function heightToRoughness(height: ImageData): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;

  const out = document.createElement("canvas");
  out.width = out.height = TEX;
  const ctx = out.getContext("2d");
  if (!ctx) return null;

  const dst = ctx.createImageData(TEX, TEX);
  for (let i = 0; i < height.data.length; i += 4) {
    // Compress towards the rough end: chenille is never glossy.
    const v = 190 + (height.data[i] / 255) * 65;
    dst.data[i] = dst.data[i + 1] = dst.data[i + 2] = v;
    dst.data[i + 3] = 255;
  }
  ctx.putImageData(dst, 0, 0);
  return out;
}

function ensureFibreMaps() {
  if (fibreNormalMap || typeof document === "undefined") return;

  const height = drawFibreHeight();
  if (!height) return;

  const normalCanvas = heightToNormal(height);
  const roughCanvas = heightToRoughness(height);
  if (!normalCanvas || !roughCanvas) return;

  fibreNormalMap = new THREE.CanvasTexture(normalCanvas);
  fibreNormalMap.wrapS = fibreNormalMap.wrapT = THREE.RepeatWrapping;
  fibreNormalMap.repeat.set(5, 5);
  fibreNormalMap.anisotropy = 4;

  fibreRoughnessMap = new THREE.CanvasTexture(roughCanvas);
  fibreRoughnessMap.wrapS = fibreRoughnessMap.wrapT = THREE.RepeatWrapping;
  fibreRoughnessMap.repeat.set(5, 5);
}

/* --- the body material ----------------------------------------------------- */

const bodyCache = new Map<string, THREE.MeshPhysicalMaterial>();

export interface ChenilleOptions {
  metallic?: boolean;
  /** Lower quality drops the maps — used on weak devices. */
  detail?: boolean;
}

/**
 * The matte, fibrous body of a chenille stem.
 * Cached per colour so a bouquet of twenty roses uses one material.
 */
export function chenilleMaterial(
  hex: string,
  { metallic = false, detail = true }: ChenilleOptions = {},
): THREE.MeshPhysicalMaterial {
  const key = `${hex}|${metallic}|${detail}`;
  const cached = bodyCache.get(key);
  if (cached) return cached;

  if (detail) ensureFibreMaps();

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    roughness: metallic ? 0.42 : 0.96,
    metalness: metallic ? 0.72 : 0,
    // Sheen is the fabric term for exactly this: light scattering off fibres
    // that stand away from the surface.
    sheen: metallic ? 0.25 : 1,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color(tint(hex, metallic ? 0.25 : 0.55)),
    clearcoat: 0,
    flatShading: false,
  });

  if (detail && fibreNormalMap && fibreRoughnessMap) {
    mat.normalMap = fibreNormalMap;
    mat.normalScale = new THREE.Vector2(metallic ? 0.35 : 0.9, metallic ? 0.35 : 0.9);
    if (!metallic) mat.roughnessMap = fibreRoughnessMap;
  }

  bodyCache.set(key, mat);
  return mat;
}

/* --- the fuzz halo ---------------------------------------------------------
 * A copy of the same geometry, pushed out along its normals and drawn with a
 * fresnel alpha, so it only shows where the surface turns away from the camera.
 * That's the bright fringe you see around real chenille.
 * ------------------------------------------------------------------------- */

const haloVertex = /* glsl */ `
  uniform float uThickness;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 inflated = position + normal * uThickness;
    vec4 world = modelMatrix * vec4(inflated, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec2 vUv;

  // Cheap hash noise — breaks the halo into strands so it reads as hairs
  // rather than as a glow.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
    float fresnel = pow(1.0 - facing, 2.4);

    float strands = mix(0.55, 1.0, hash(floor(vUv * vec2(160.0, 26.0))));

    float alpha = fresnel * uStrength * strands;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

const haloCache = new Map<string, THREE.ShaderMaterial>();

export function haloMaterial(hex: string, thickness = 0.012): THREE.ShaderMaterial {
  const key = `${hex}|${thickness}`;
  const cached = haloCache.get(key);
  if (cached) return cached;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(tint(hex, 0.42)) },
      uThickness: { value: thickness },
      uStrength: { value: 0.85 },
    },
    vertexShader: haloVertex,
    fragmentShader: haloFragment,
    transparent: true,
    // Writing depth here would cut holes in the flowers behind.
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  haloCache.set(key, mat);
  return mat;
}

/** Free every cached GPU resource. Called when the last canvas unmounts. */
export function disposeChenille() {
  bodyCache.forEach((m) => m.dispose());
  bodyCache.clear();
  haloCache.forEach((m) => m.dispose());
  haloCache.clear();
  fibreNormalMap?.dispose();
  fibreRoughnessMap?.dispose();
  fibreNormalMap = null;
  fibreRoughnessMap = null;
}
