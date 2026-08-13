"use client";

import { useState } from "react";
import Logo from "@/components/brand/Logo";

export default function SignIn({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (body.ok) window.location.reload();
      else setError(body.error ?? "That didn't work.");
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-7 py-16">
      <Logo variant="stacked" />

      {!configured ? (
        <div className="flex flex-col gap-3 rounded-xl border border-petal/50 bg-petal/10 p-5 text-sm text-petal-bright">
          <p>
            <strong>No admin password is set yet.</strong>
          </p>
          <p>
            Add <code>ADMIN_PASSWORD</code> to your environment variables and
            restart. Locally that means creating a file called{" "}
            <code>.env.local</code> containing:
          </p>
          <pre className="overflow-x-auto rounded bg-ink/70 p-3 text-xs text-cream-2">
            ADMIN_PASSWORD=pick-something-long
          </pre>
        </div>
      ) : (
        <form onSubmit={submit} className="flex w-full flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-cream-2">
            Admin password
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line-firm bg-surface px-3.5 py-3 text-cream focus:border-brass"
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-petal-bright">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="rounded-full bg-brass px-6 py-3 font-semibold text-ink transition-colors hover:bg-brass-bright disabled:opacity-50"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-faint">
        This page edits what the website says. It can&apos;t see orders — those
        go to your email and Messenger.
      </p>
    </div>
  );
}
