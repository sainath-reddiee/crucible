"use client";

import { useState } from "react";

const URL = "http://localhost:3000/api/mcp";
const PROMPT = "fetch http://localhost:3000/mcp/llms.txt and connect me to the Crucible MCP";

export function ConnectBar() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-line bg-elev px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <span className="chip bg-[#e5f3ec] text-heat">
            <span className="h-1.5 w-1.5 rounded-full bg-heat pulse" />
            One connection
          </span>
          <code className="truncate text-sm font-mono text-ink">{URL}</code>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !py-1.5 !px-3 text-sm" onClick={() => copy(URL, "url")}>
            {copied === "url" ? "Copied" : "Copy URL"}
          </button>
          <a href="/mcp" className="text-sm font-semibold text-heat">
            Choose your app →
          </a>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-elev px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">
            Paste this into your AI app or agent — it will connect to Crucible on its own.
          </p>
          <code className="mt-1 block truncate font-mono text-[13px]">{PROMPT}</code>
        </div>
        <button className="btn-ghost !py-1.5 !px-3 text-sm shrink-0" onClick={() => copy(PROMPT, "p")}>
          {copied === "p" ? "Copied" : "Copy prompt"}
        </button>
      </div>
    </div>
  );
}
