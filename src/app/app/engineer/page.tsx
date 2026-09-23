"use client";

import { useEffect, useState } from "react";
import { SkillPopup } from "@/components/SkillPopup";
import { api } from "@/lib/api";
import type { Suggestion, WorkContext } from "@/lib/data";

type EventRow = { id: string; when: string; source: string; title: string };

export default function EngineerPage() {
  const [contexts, setContexts] = useState<WorkContext[]>([]);
  const [ctx, setCtx] = useState<WorkContext | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [top, setTop] = useState<Suggestion | null>(null);
  const [trace, setTrace] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState<string>("");
  const [more, setMore] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [dismissed, setDismissed] = useState(0);

  useEffect(() => {
    api<{ contexts: WorkContext[] }>("/api/suggest").then((d) => {
      setContexts(d.contexts);
      setCtx(d.contexts[0]);
    });
    api<{ events: EventRow[] }>("/api/events").then((d) => setEvents(d.events));
  }, []);

  useEffect(() => {
    if (!ctx || quiet) {
      setOpen(false);
      return;
    }
    setUsed("");
    setMore(false);
    setOpen(false);
    const t = window.setTimeout(async () => {
      const res = await api<{ suggestions: Suggestion[]; trace: string[] }>("/api/suggest", {
        method: "POST",
        body: JSON.stringify({ contextId: ctx.id }),
      });
      setTrace(res.trace);
      setTop(res.suggestions[0] || null);
      setOpen(!!res.suggestions[0]);
    }, 500);
    return () => window.clearTimeout(t);
  }, [ctx?.id, quiet]);

  if (!ctx) return <p className="text-sm text-muted">Loading workbench…</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Engineer</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your work, visible</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Suggestions come from <code>/api/suggest</code> — the same engine MCP calls.
          </p>
        </div>
        <button
          className="btn-ghost text-sm"
          onClick={async () => {
            const next = !quiet;
            setQuiet(next);
            await api("/api/suggest", { method: "POST", body: JSON.stringify({ quiet: next }) });
          }}
        >
          {quiet ? "Suggestions on" : "crucible quiet"}
        </button>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 border-heat/20 bg-[#e5f3ec] p-4">
        <p className="text-sm">
          We noticed 3 similar Salesforce staging problems. A skill is in the curator queue.
        </p>
        <a href="/app/curator" className="btn-primary !py-1.5 text-sm">
          Open review
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <div className="text-sm font-semibold">Workbench</div>
            <p className="text-xs text-faint">Change context. The Suggester posts to the API.</p>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
            {contexts.map((c) => (
              <button
                key={c.id}
                onClick={() => setCtx(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  ctx.id === c.id ? "bg-ink text-white" : "border border-line"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="space-y-3 p-4">
            {open && top && !used && (
              <SkillPopup
                suggestion={top}
                persona={ctx.persona}
                why={ctx.why}
                onUse={async () => {
                  const run = await api<{ summary: string; output: string; guardrails: string[] }>(
                    "/api/run",
                    { method: "POST", body: JSON.stringify({ slug: top.skill.slug }) }
                  );
                  setUsed(`${run.summary}\n\n${run.output}${run.guardrails.length ? `\n\nGuardrails: ${run.guardrails.join(" · ")}` : ""}`);
                }}
                onMore={() => setMore(true)}
                onDismiss={async () => {
                  await api("/api/suggest", {
                    method: "POST",
                    body: JSON.stringify({ dismiss: top.skill.id }),
                  });
                  setDismissed((n) => n + 1);
                  setOpen(false);
                }}
              />
            )}
            {used && <pre className="rise whitespace-pre-wrap rounded-2xl bg-soft p-4 text-sm">{used}</pre>}
            {more && (
              <div className="rounded-2xl bg-soft p-4 font-mono text-xs text-muted">
                {trace.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-[#111] p-4 font-mono text-[12px] leading-6 text-[#d7e0d4]">
            <div className="text-[#8a8f84]">karthik@anblicks</div>
            <div className="text-[#7dcea0]">$ {ctx.trigger}</div>
            <div>branch {ctx.branch}</div>
            {ctx.files.map((f) => (
              <div key={f}>open {f}</div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="card p-4">
            <div className="text-sm font-semibold">Captured this week</div>
            <ul className="mt-3 space-y-3">
              {events.map((e) => (
                <li key={e.id} className="text-sm">
                  <div className="text-[11px] text-heat">{e.source}</div>
                  <div>{e.title}</div>
                  <div className="text-[11px] text-faint">{e.when}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Authored", "4"],
              ["Used", String(18)],
              ["Proposed", "1"],
              ["Dismissed", String(dismissed)],
            ].map(([k, v]) => (
              <div key={k} className="card p-3">
                <div className="text-[11px] text-faint">{k}</div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
