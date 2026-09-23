"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Skill } from "@/lib/data";

type Metrics = {
  quarter: string;
  published: number;
  hours: number;
  dollars: number;
  acceptance: number;
  active: number;
  total: number;
  ramp: number;
  priorRamp: number;
  executions: number;
  cli: number;
  mcp: number;
  reuse3plus: number;
  capture: { git: number; snowflake: number; dbt: number; jira: number };
  governance: { tier3Reviewed: number; unauthorized: number; lastAudit: string; anonQueue: number };
  risks: string[];
};

type Audit = { id: string; time: string; action: string; actor: string; detail: string };

export default function LeadershipPage() {
  const [m, setM] = useState<Metrics | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api<Metrics>("/api/metrics").then(setM);
    api<{ skills: Skill[] }>("/api/skills").then((d) => setSkills(d.skills));
  }, []);

  async function openLedger() {
    const d = await api<{ audit: Audit[] }>("/api/audit");
    setAudit(d.audit);
    setOpen(true);
  }

  if (!m) return <p className="text-sm text-muted">Loading metrics…</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            Leadership · {m.quarter}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Firm-wide value</h1>
        </div>
        <button onClick={openLedger} className="btn-ghost text-sm">
          Open audit ledger
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Hours saved", m.hours.toLocaleString(), `$${(m.dollars / 1000).toFixed(0)}K`],
          ["Published", String(m.published), `${m.executions} executions`],
          ["Ramp", `${m.ramp} days`, `was ${m.priorRamp}`],
          ["Acceptance", `${m.acceptance}%`, `${m.active}/${m.total} active`],
        ].map(([k, v, s]) => (
          <div key={k} className="card p-4">
            <div className="text-[11px] text-faint">{k}</div>
            <div className="mt-1 text-2xl font-semibold">{v}</div>
            <div className="text-xs text-muted">{s}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 text-sm">
          <h2 className="font-semibold">Adoption</h2>
          <p className="mt-3 text-muted">CLI {m.cli} · MCP {m.mcp} · 3+ clients {m.reuse3plus}</p>
          <p className="mt-2 text-muted">
            Capture git {m.capture.git}% · Snowflake {m.capture.snowflake}% · dbt {m.capture.dbt}% ·
            Jira {m.capture.jira}%
          </p>
        </section>
        <section className="card p-5 text-sm">
          <h2 className="font-semibold">Governance</h2>
          <p className="mt-3 text-muted">
            Tier-3 reviewed {m.governance.tier3Reviewed}% · unauthorized {m.governance.unauthorized} ·
            audit {m.governance.lastAudit}
          </p>
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-5 py-3 font-semibold">Top impact</div>
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase text-faint">
            <tr>
              <th className="px-5 py-2">Skill</th>
              <th className="px-3 py-2">Uses</th>
              <th className="px-5 py-2">Saved</th>
            </tr>
          </thead>
          <tbody>
            {skills
              .filter((s) => s.maturity === "published")
              .sort((a, b) => b.dollarsSaved - a.dollarsSaved)
              .slice(0, 6)
              .map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="font-mono text-[11px] text-faint">{s.slug}</div>
                  </td>
                  <td className="px-3 py-3">{s.uses}</td>
                  <td className="px-5 py-3">${(s.dollarsSaved / 1000).toFixed(0)}K</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Risk flags</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {m.risks.map((r) => (
            <li key={r}>▸ {r}</li>
          ))}
        </ul>
      </section>

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-6" onClick={() => setOpen(false)}>
          <div className="card max-h-[80vh] w-full max-w-2xl overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Audit ledger</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-faint">
                Close
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {audit.map((a) => (
                <li key={a.id}>
                  <span className="font-mono text-[11px] text-faint">
                    {a.time.replace("T", " ").slice(0, 19)}
                  </span>
                  <div>
                    <span className="text-heat">{a.action}</span>
                    <span className="text-faint"> · {a.actor}</span>
                  </div>
                  <div className="text-muted">{a.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
