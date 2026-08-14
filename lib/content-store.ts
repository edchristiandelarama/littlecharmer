import { promises as fs } from "node:fs";
import path from "node:path";

/* ===========================================================================
 * SAVING CONTENT
 *
 * Two places the content can be written, picked automatically:
 *
 *   Local (`npm run dev`)  → straight to content/site.json on disk.
 *   Deployed               → committed to GitHub through their API.
 *
 * The second one exists because Vercel and Netlify give a deployed app a
 * READ-ONLY, THROWAWAY filesystem. Writing a file there appears to work and
 * then silently vanishes on the next deploy — so every edit the shop owner made
 * would quietly disappear. Committing to the repo is the only way an edit
 * actually persists, and it has the pleasant side effect of redeploying the site
 * and giving you a full history of every change.
 *
 * The GitHub token lives in a server environment variable and is never sent to
 * the browser.
 * =========================================================================== */

export type ContentFile = "content/site.json" | "content/products.json";

export interface SaveResult {
  ok: boolean;
  via: "disk" | "github";
  message: string;
  commitUrl?: string;
}

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) return null;
  return { token, repo, branch };
}

/** Is this a local dev run with a writable checkout? */
function canWriteToDisk(): boolean {
  return process.env.NODE_ENV !== "production" || !githubConfig();
}

/** Exported for the upload route, which makes the same choice. */
export function canWriteLocally(): boolean {
  return canWriteToDisk();
}

async function saveToDisk(json: string, file: ContentFile): Promise<SaveResult> {
  const target = path.join(process.cwd(), file);
  try {
    await fs.writeFile(target, json, "utf8");
    return {
      ok: true,
      via: "disk",
      message: `Saved to ${file}. The page will refresh with your changes in a moment.`,
    };
  } catch (error) {
    return {
      ok: false,
      via: "disk",
      message: `Couldn't write the file: ${(error as Error).message}`,
    };
  }
}

async function saveToGitHub(json: string, CONTENT_PATH: ContentFile): Promise<SaveResult> {
  const config = githubConfig();
  if (!config) {
    return {
      ok: false,
      via: "github",
      message:
        "No GitHub connection configured, so there's nowhere to save this. Set GITHUB_TOKEN and GITHUB_REPO in your hosting environment variables.",
    };
  }

  const { token, repo, branch } = config;
  const api = `https://api.github.com/repos/${repo}/contents/${CONTENT_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  try {
    // GitHub needs the current file's SHA to replace it — that's also what
    // stops two edits from silently overwriting each other.
    const existing = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, {
      headers,
      cache: "no-store",
    });

    let sha: string | undefined;
    if (existing.ok) {
      const data = (await existing.json()) as { sha?: string };
      sha = data.sha;
    } else if (existing.status !== 404) {
      const detail = await existing.text().catch(() => "");
      return {
        ok: false,
        via: "github",
        message: `GitHub wouldn't let us read the file (${existing.status}). Check the token has access to ${repo}. ${detail.slice(0, 160)}`,
      };
    }

    const put = await fetch(api, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Update site content from the admin panel",
        content: Buffer.from(json, "utf8").toString("base64"),
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!put.ok) {
      const detail = await put.text().catch(() => "");
      return {
        ok: false,
        via: "github",
        message: `GitHub rejected the save (${put.status}). ${detail.slice(0, 200)}`,
      };
    }

    const result = (await put.json()) as { commit?: { html_url?: string } };
    return {
      ok: true,
      via: "github",
      message:
        "Saved and committed. Your host will redeploy automatically — the live site usually updates within a minute or two.",
      commitUrl: result.commit?.html_url,
    };
  } catch (error) {
    return {
      ok: false,
      via: "github",
      message: `Couldn't reach GitHub: ${(error as Error).message}`,
    };
  }
}

export async function saveContent(
  data: unknown,
  file: ContentFile = "content/site.json",
): Promise<SaveResult> {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  return canWriteToDisk() ? saveToDisk(json, file) : saveToGitHub(json, file);
}

/**
 * Commit a binary file (a product photo) to the repo.
 *
 * Only reached when deployed — locally the upload route writes straight to
 * public/photos/ instead.
 */
export async function commitBinary(
  repoPath: string,
  data: Buffer,
  message: string,
): Promise<SaveResult> {
  const config = githubConfig();
  if (!config) {
    return {
      ok: false,
      via: "github",
      message:
        "No GitHub connection configured, so there's nowhere to put the photo. Set GITHUB_TOKEN and GITHUB_REPO in your hosting environment variables.",
    };
  }

  const { token, repo, branch } = config;
  const api = `https://api.github.com/repos/${repo}/contents/${repoPath}`;

  try {
    const put = await fetch(api, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      // New filename every upload, so there's never an existing SHA to supply.
      body: JSON.stringify({
        message,
        content: data.toString("base64"),
        branch,
      }),
    });

    if (!put.ok) {
      const detail = await put.text().catch(() => "");
      return {
        ok: false,
        via: "github",
        message: `GitHub rejected the photo (${put.status}). ${detail.slice(0, 200)}`,
      };
    }

    return {
      ok: true,
      via: "github",
      message:
        "Photo uploaded. It appears on the live site once the redeploy finishes, a minute or two from now.",
    };
  } catch (error) {
    return {
      ok: false,
      via: "github",
      message: `Couldn't reach GitHub: ${(error as Error).message}`,
    };
  }
}

/** Where a save would go, so the admin can tell the owner up front. */
export function saveTarget(): "disk" | "github" | "nowhere" {
  if (canWriteToDisk()) return "disk";
  return githubConfig() ? "github" : "nowhere";
}
