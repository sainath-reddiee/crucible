import { NextResponse } from "next/server";
import { CONTEXTS, MCP_TOOLS, store } from "@/server/engine";

export async function GET() {
  return NextResponse.json({
    name: "crucible",
    url: "http://localhost:3000/api/mcp",
    tools: MCP_TOOLS,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = body.name || body.tool || body.method;
  const args = body.arguments || body.params || body;

  if (name === "tools/list" || name === "list") {
    return NextResponse.json({ tools: MCP_TOOLS });
  }

  if (name === "crucible_suggest") {
    const ctx =
      CONTEXTS.find((c) => c.id === args.contextId) ||
      CONTEXTS.find((c) =>
        `${args.activeTaskDescription || ""} ${args.currentBranch || ""}`.toLowerCase().includes(c.id)
      ) ||
      ({
        id: "custom",
        label: "Custom",
        persona: args.engineerName || "Engineer",
        trigger: args.activeTaskDescription || "",
        branch: args.currentBranch || "unknown",
        files: args.openFiles || [],
        commands: args.recentCommands || [],
        task: args.activeTaskDescription || args.query || "",
        why: "MCP client context",
      } as const);
    return NextResponse.json(store.suggest(ctx, args.engineerId || "eng-demo"));
  }

  if (name === "crucible_run") {
    return NextResponse.json(store.run(args.skill_id || args.slug, args.engineerId || "eng-demo"));
  }

  if (name === "crucible_search") {
    const q = String(args.query || "").toLowerCase();
    const skills = store.skills.filter((s) =>
      `${s.name} ${s.slug} ${s.description}`.toLowerCase().includes(q)
    );
    return NextResponse.json({ skills });
  }

  if (name === "crucible_status") {
    return NextResponse.json({
      events: store.events,
      quiet: store.quiet.has(args.engineerId || "eng-karthik"),
    });
  }

  if (name === "crucible_review") {
    if (args.decision && args.slug) {
      return NextResponse.json({ review: store.decide(args.slug, args.decision) });
    }
    return NextResponse.json({ reviews: store.reviews });
  }

  return NextResponse.json({ error: "unknown tool", tools: MCP_TOOLS.map((t) => t.name) }, { status: 400 });
}
