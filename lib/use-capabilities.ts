"use client";

import { useEffect, useState } from "react";

/* ===========================================================================
 * WHAT THIS DEVICE CAN ACTUALLY COPE WITH
 *
 * A lot of this site's visitors will arrive on a mid-range phone over mobile
 * data. The 3D is the best thing on the page when it runs well and the worst
 * thing on the page when it doesn't, so it's gated rather than assumed.
 *
 * Everything defaults to "not ready" during SSR and the first paint, so the
 * static version renders first and 3D upgrades in — never the reverse.
 * =========================================================================== */

export interface Capabilities {
  /** False until the check has run on the client. */
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  lowPower: boolean;
  /** Drop the fibre maps and halve the geometry on weak devices. */
  quality: "high" | "low";
  /** The fuzz halo costs an extra draw call per flower. */
  fuzz: boolean;
  /** The final answer: should we mount a canvas at all? */
  render3D: boolean;
}

const initial: Capabilities = {
  ready: false,
  webgl: false,
  reducedMotion: false,
  saveData: false,
  lowPower: false,
  quality: "low",
  fuzz: false,
  render3D: false,
};

/**
 * `?render3d=1` forces the canvas on, `?render3d=0` forces it off.
 *
 * Kept in for good: it's the only way to check the 3D in a headless browser
 * (which reports a software renderer we'd otherwise reject), and the only way
 * to reproduce "the 3D doesn't show on my phone" on someone else's phone.
 */
function urlOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("render3d");
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return null;
}

function detectWebGL(forced: boolean): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Software renderers report WebGL support and then run at 4fps.
    const debug = forced
      ? null
      : (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (debug) {
      const renderer = String(
        (gl as WebGLRenderingContext).getParameter(debug.UNMASKED_RENDERER_WEBGL),
      ).toLowerCase();
      if (renderer.includes("swiftshader") || renderer.includes("llvmpipe")) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

export function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>(initial);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      const forced = urlOverride();
      const webgl = detectWebGL(forced === true);
      const reducedMotion = reducedQuery.matches;

      const conn = (
        navigator as Navigator & { connection?: NetworkInformation }
      ).connection;
      const saveData =
        conn?.saveData === true ||
        conn?.effectiveType === "slow-2g" ||
        conn?.effectiveType === "2g";

      const cores = navigator.hardwareConcurrency ?? 8;
      const memory =
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const smallScreen = window.matchMedia("(max-width: 640px)").matches;
      const lowPower = cores <= 4 || memory <= 4;

      const quality: "high" | "low" =
        forced === true ? "high" : lowPower || smallScreen ? "low" : "high";

      setCaps({
        ready: true,
        webgl,
        reducedMotion,
        saveData,
        lowPower,
        quality,
        // The halo is the thing that makes chenille read as chenille, so it's
        // only dropped when the device genuinely can't take it.
        fuzz: webgl && (forced === true || !lowPower),
        render3D:
          forced !== null ? forced && webgl : webgl && !saveData && !reducedMotion,
      });
    };

    evaluate();

    // Someone can turn reduced-motion on while the page is open.
    reducedQuery.addEventListener("change", evaluate);
    return () => reducedQuery.removeEventListener("change", evaluate);
  }, []);

  return caps;
}
