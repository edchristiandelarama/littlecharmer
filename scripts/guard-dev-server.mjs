import net from "node:net";

/* ===========================================================================
 * Refuse to run a production build while the dev server is up.
 *
 * `next build` and `next dev` share the .next directory. clean-stale-build.mjs
 * already guards one direction — starting dev on top of a production build. But
 * the reverse is worse: build while `next dev` is still running and the build
 * replaces the directory underneath the live server. The dev server keeps
 * serving, keeps reporting 200, and quietly 404s its own stylesheet.
 *
 * The result is a site with no CSS — blue underlined links, serif text, no
 * layout — which looks exactly like a catastrophic front-end bug. Nothing in
 * the terminal says otherwise, so you go hunting through the code you last
 * touched. This has cost us an afternoon twice.
 *
 * A build can't fix a dev server that's already running, so the only useful
 * moment is before the build starts.
 * =========================================================================== */

// Hosted builds have no dev server, and must never be blocked by this.
if (process.env.CI || process.env.NETLIFY || process.env.VERCEL) process.exit(0);
if (process.env.ALLOW_BUILD_WITH_DEV) process.exit(0);

const port = Number(process.env.PORT) || 3000;

const busy = await new Promise((resolve) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  const done = (answer) => {
    socket.destroy();
    resolve(answer);
  };
  socket.setTimeout(700);
  socket.once("connect", () => done(true));
  socket.once("timeout", () => done(false));
  socket.once("error", () => done(false));
});

if (busy) {
  console.error(
    [
      "",
      `  Something is already serving on port ${port} — almost certainly \`npm run dev\`.`,
      "",
      "  Building now would overwrite .next underneath it. The dev server would keep",
      "  answering requests but serve a page with no stylesheet: blue links, serif",
      "  text, no layout. It looks like the site is broken; it isn't.",
      "",
      "  Stop the dev server, then build. To start it again afterwards:",
      "",
      "      npm run clean && npm run dev",
      "",
      `  If you're certain you want both at once: ALLOW_BUILD_WITH_DEV=1 npm run build`,
      "",
    ].join("\n"),
  );
  process.exit(1);
}
