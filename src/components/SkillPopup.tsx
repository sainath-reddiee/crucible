"use client";

import type { Suggestion } from "@/lib/data";

export function SkillPopup({
  suggestion,
  persona,
  why,
  onUse,
  onMore,
  onDismiss,
}: {
  suggestion: Suggestion;
  persona: string;
  why: string;
  onUse: () => void;
  onMore: () => void;
  onDismiss: () => void;
}) {
  const s = suggestion.skill;
  return (
    <aside className="rise overflow-hidden rounded-2xl border border-line bg-elev shadow-lg">
      <div className="flex items-center justify-between border-b border-line bg-soft px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-heat">Crucible</span>
        <span className="text-[11px] text-faint">{persona}</span>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted">{why}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{s.name}</h3>
          <span className="chip bg-[#e5f3ec] text-heat">{Math.round(suggestion.score * 100)}% match</span>
          <span className="chip bg-soft text-muted">Tier {s.tier}</span>
        </div>
        <p className="font-mono text-xs text-faint">{s.slug}</p>
        <ul className="space-y-1 text-[13px] text-muted">
          <li>
            ★ {Math.round(s.successRate * 100)}% · {s.uses} uses · {s.clients} clients
          </li>
          <li>Authored by {s.authorId === "eng-karthik" ? "you" : s.author}</li>
          <li>Handles: {s.handles.join(", ")}</li>
        </ul>
        <p className="text-xs text-faint">{suggestion.reason}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onUse} className="btn-primary !py-1.5 !px-3 text-sm">
            Use it
          </button>
          <button onClick={onMore} className="btn-ghost !py-1.5 !px-3 text-sm">
            Tell me more
          </button>
          <button onClick={onDismiss} className="px-3 py-1.5 text-sm text-faint">
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
}
