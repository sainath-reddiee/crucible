"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Review = {
  slug: string;
  title: string;
  status: string;
  reviewer: string;
  tier: number;
  transfer: number;
  criticPass: number;
  sources: number;
  note: string;
  critic: { ok: boolean; label: string }[];
  redactions: { from: string; to: string }[];
  decision?: string;
};

export default function CuratorPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api<{ reviews: Review[] }>("/api/review")
      .then((d) => {
        setReviews(d.reviews || []);
        setError("");
      })
      .catch((e: Error) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(slug: string, decision: string) {
    await api("/api/review", {
      method: "POST",
      body: JSON.stringify({ slug, decision }),
    });
    load();
  }

  const pending = reviews.filter((r) => !r.decision).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Curator</p>
          <h1 className="mt-1 text-2xl font-semibold">Keep the library sharp</h1>
          <p className="mt-2 text-sm text-muted">{pending} awaiting a decision · wired to /api/review</p>
        </div>
        <button
          className="btn-ghost text-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await api("/api/pipeline", { method: "POST" });
            load();
            setBusy(false);
          }}
        >
          {busy ? "Running…" : "Run nightly pipeline"}
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((item) => (
          <article key={item.slug} className="card space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <span className="chip bg-soft">Tier {item.tier}</span>
                  <span className="chip bg-[#e5f3ec] text-heat">{item.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{item.note}</p>
                <p className="mt-1 text-xs text-faint">
                  {item.reviewer} · {item.sources} sources · critic {item.criticPass}% · transfer{" "}
                  {item.transfer}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={!!item.decision}
                  onClick={() => decide(item.slug, "approved")}
                  className="btn-primary !py-1.5 text-sm disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  disabled={!!item.decision}
                  onClick={() => decide(item.slug, "changes")}
                  className="btn-ghost !py-1.5 text-sm disabled:opacity-40"
                >
                  Changes
                </button>
                <button
                  disabled={!!item.decision}
                  onClick={() => decide(item.slug, "rejected")}
                  className="px-3 py-1.5 text-sm text-bad disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-soft p-4 text-sm">
                <div className="text-xs font-semibold uppercase text-bad">Critic</div>
                <ul className="mt-2 space-y-1 text-muted">
                  {item.critic.map((c) => (
                    <li key={c.label}>
                      {c.ok ? "✓" : "×"} {c.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-soft p-4 text-sm">
                <div className="text-xs font-semibold uppercase text-info">Anonymizer</div>
                <ul className="mt-2 space-y-1 text-muted">
                  {item.redactions.map((r) => (
                    <li key={r.from}>
                      {r.from} → {r.to}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
