"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/app/engineer", label: "Engineer" },
  { href: "/app/curator", label: "Curator" },
  { href: "/app/leadership", label: "Leadership" },
  { href: "/app/library", label: "Catalog" },
  { href: "/mcp", label: "MCP" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-line bg-elev px-4 py-5 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 px-1">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-heat text-sm font-bold text-white">
            C
          </span>
          <div>
            <div className="text-sm font-semibold">Crucible</div>
            <div className="text-[11px] text-faint">Anblicks</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${
                  active ? "bg-soft text-ink" : "text-muted hover:bg-soft/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-soft p-3 text-[11px] leading-relaxed text-muted">
          <div className="mb-1 flex items-center gap-2 font-semibold text-heat">
            <span className="h-1.5 w-1.5 rounded-full bg-heat pulse" />
            Suggester live
          </div>
          Wired to /api/suggest · /api/mcp
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-[rgba(243,244,239,0.86)] px-6 py-3 backdrop-blur">
          <div className="text-sm text-muted">Capture consented · current context only</div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-elev px-2 py-1 text-xs">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-soft font-semibold">KP</span>
            Karthik
          </div>
        </header>
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
