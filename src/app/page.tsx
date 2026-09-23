import Link from "next/link";
import { ConnectBar } from "@/components/ConnectBar";

const CLIENTS = ["Claude", "Cursor", "VS Code", "Copilot", "Windsurf", "Cline"];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-heat text-sm font-bold text-white">
            C
          </span>
          <span className="font-semibold">Crucible</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/mcp">MCP</Link>
          <Link href="/app/engineer">Workspace</Link>
          <Link href="/app/library">Catalog</Link>
        </nav>
        <Link href="/app/engineer" className="btn-primary">
          Open workspace
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-heat">
            Crucible MCP / made for consulting firms
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Firm skills.
            <br />
            In the AI you already use.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Crucible is an MCP server for institutional knowledge. It captures repeated engineering
            work, refines it into governed skills, and brings them back in Claude, Cursor, or the
            terminal — at the moment of work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mcp" className="btn-primary">
              Connect with your AI →
            </Link>
            <Link href="/app/engineer" className="btn-ghost">
              See skills pop up
            </Link>
          </div>
          <p className="mt-4 text-sm text-faint">Silent capture · consented ledger · no keystroke watch</p>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-[28%] grid place-items-center rounded-full border border-line bg-elev shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-heat text-lg font-bold text-white">
                C
              </div>
              <div className="text-sm font-semibold">Crucible</div>
              <div className="text-xs text-faint">skill factory</div>
            </div>
          </div>
          {CLIENTS.map((name, i) => {
            const angle = (i / CLIENTS.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 38;
            const y = 50 + Math.sin(angle) * 38;
            return (
              <div
                key={name}
                className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-elev text-[11px] font-semibold shadow-sm"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {name}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <ConnectBar />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">The research toolkit</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">One connection. A fuller picture.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Suggest in context", "Branch checkout, dbt run, or an MCP ask — the Suggester returns the firm skill, or stays silent."],
            ["02", "Run with guardrails", "Tiered autonomy. Tier 1 reads. Tier 2 proposes. Tier 3 waits for a human."],
            ["03", "Govern the library", "Critic, anonymizer, curator queue, append-only audit. Cross-client safe."],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <div className="text-xs font-semibold text-heat">{n}</div>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
