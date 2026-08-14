import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

/* ===========================================================================
 * Clear .next when it's left over from a production build.
 *
 * `next build` and `next dev` write to the same .next directory but expect
 * different things in it. Run a build and then start the dev server and you get
 * a half-and-half directory: the page still renders, but the stylesheet 404s.
 *
 * That failure is nastier than it sounds, because nothing errors. The site just
 * appears with no CSS — default blue links, serif text, images stretched to
 * enormous sizes — which looks like the front end has been broken by whatever
 * you last edited, and sends you hunting through your own code for a bug that
 * isn't there.
 *
 * So: before dev starts, if .next looks like a production build, delete it.
 * Costs one recompile; saves an afternoon.
 * =========================================================================== */

const root = process.cwd();
const next = path.join(root, ".next");

if (!existsSync(next)) process.exit(0);

// A production build leaves BUILD_ID and a prerender manifest; dev doesn't.
const looksProduction =
  existsSync(path.join(next, "BUILD_ID")) ||
  existsSync(path.join(next, "prerender-manifest.json"));

// A dev server writes this, and its build id is literally "development".
let looksDev = false;
try {
  const meta = path.join(next, "package.json");
  if (existsSync(meta)) looksDev = true;
  const id = path.join(next, "BUILD_ID");
  if (existsSync(id) && readFileSync(id, "utf8").trim() === "development") {
    looksDev = true;
  }
} catch {
  // Unreadable means suspect; fall through to the production check.
}

if (looksProduction && !looksDev) {
  try {
    rmSync(next, { recursive: true, force: true });
    console.log("Cleared .next left over from a production build.");
  } catch (error) {
    console.warn(
      `Couldn't clear .next automatically (${(error).message}). If the site loads with no styling, delete the .next folder by hand and start again.`,
    );
  }
}
