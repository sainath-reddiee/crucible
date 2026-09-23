"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Skill } from "@/lib/data";

const FILTERS = ["All", "dbt", "Snowflake", "Salesforce", "Airflow", "Healthcare"];

export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (f !== "All") params.set("stack", f);
    api<{ skills: Skill[] }>(`/api/skills?${params}`).then((d) => setSkills(d.skills));
  }, [q, f]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Catalog</p>
          <h1 className="mt-1 text-2xl font-semibold">Governed skills</h1>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skill, stack, archetype"
          className="w-72 rounded-full border border-line bg-elev px-4 py-2 text-sm outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((name) => (
          <button
            key={name}
            onClick={() => setF(name)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              f === name ? "bg-ink text-white" : "border border-line"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((s) => (
          <article key={s.id} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{s.name}</h2>
                <p className="font-mono text-xs text-faint">{s.slug}</p>
              </div>
              <span className="chip bg-soft">Tier {s.tier}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted">{s.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {s.techStack.map((t) => (
                <span key={t} className="chip bg-soft text-muted">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto text-xs text-faint">
              {s.author} · {Math.round(s.successRate * 100)}% · {s.uses} uses
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
