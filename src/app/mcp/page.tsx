"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectBar } from "@/components/ConnectBar";
import { api } from "@/lib/api";

const APPS = [
  {
    id: "cursor",
    name: "Cursor",
    steps: [
      "Open .cursor/mcp.json in this project.",
      'Add "crucible" with url http://localhost:3000/api/mcp',
      "Ask: help me build a Salesforce contacts staging model.",
    ],
    config: `{
  "mcpServers": {
    "crucible": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}`,
  },
  {
    id: "claude",
    name: "Claude",
    steps: [
      "Add a custom connector named Crucible.",
      "Paste http://localhost:3000/api/mcp",
      "Ask Claude to call crucible_suggest for your current task.",
    ],
    config: `claude mcp add crucible http://localhost:3000/api/mcp`,
  },
  {
    id: "vscode",
    name: "VS Code",
    steps: [
      "In Cline / Copilot MCP settings, add a server.",
      "URL or POST endpoint: http://localhost:3000/api/mcp",
      "Check connection with crucible_status.",
    ],
    config: `{
  "mcpServers": {
    "crucible": { "url": "http://localhost:3000/api/mcp" }
  }
}`,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    steps: [
      "Open MCP config.",
      "Add server name crucible and the URL above.",
      "Ask a dbt incident question and expect diagnose-late-dbt-run.",
    ],
    config: `{ "url": "http://localhost:3000/api/mcp" }`,
  },
];

export default function McpPage() {
  const [app, setApp] = useState(APPS[0]);
  const [tools, setTools] = useState<{ name: string; description: string; group: string }[]>([]);
  const [open, setOpen] = useState<string | null>("crucible_suggest");
  const [copied, setCopied] = useState(false);
  const [probe, setProbe] = useState<string>("");

  useEffect(() => {
    api<{ tools: typeof tools }>("/api/mcp").then((d) => setTools(d.tools));
  }, []);

  async function trySuggest() {
    const res = await api<{ suggestions: { skill: { slug: string }; score: number }[] }>("/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        name: "crucible_suggest",
        arguments: {
          currentBranch: "feature/salesforce-contacts-stg",
          openFiles: ["models/staging/salesforce/stg_contacts.sql"],
          activeTaskDescription: "Salesforce contacts staging model",
        },
      }),
    });
    const top = res.suggestions[0];
    setProbe(top ? `${top.skill.slug} · ${top.score}` : "No match (silence)");
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-heat text-sm text-white">C</span>
          Crucible
        </Link>
        <Link href="/app/engineer" className="btn-primary">
          Open workspace
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-heat">Get connected</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your assistant. Your firm skills.</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Choose your app, connect Crucible, and ask your first question. One allowance across
          Claude, Cursor, Copilot, and the CLI.
        </p>
        <div className="mt-8">
          <ConnectBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap gap-2">
          {APPS.map((a) => (
            <button
              key={a.id}
              onClick={() => setApp(a)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                app.id === a.id ? "bg-ink text-white" : "border border-line bg-elev"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="card mt-6 grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Connect {app.name}</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
              {app.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <button
              className="btn-ghost mt-5 text-sm"
              onClick={() => {
                navigator.clipboard.writeText(app.config);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied config" : "Copy setup"}
            </button>
          </div>
          <pre className="overflow-auto rounded-2xl bg-soft p-4 font-mono text-[12px] leading-6">
            {app.config}
          </pre>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={trySuggest}>
            Check your connection
          </button>
          {probe && <span className="text-sm text-muted">Live tool result: {probe}</span>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">The full catalogue</p>
        <h2 className="mt-2 text-3xl font-semibold">Explore the MCP tools</h2>
        <div className="mt-6 space-y-2">
          {tools.map((t) => (
            <div key={t.name} className="card overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === t.name ? null : t.name)}
              >
                <div>
                  <code className="text-sm font-semibold">{t.name}</code>
                  <span className="ml-2 text-xs text-faint">{t.group}</span>
                </div>
                <span className="text-faint">{open === t.name ? "–" : "+"}</span>
              </button>
              {open === t.name && (
                <p className="border-t border-line px-5 py-4 text-sm text-muted">{t.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
