import { NextResponse } from "next/server";

export function GET() {
  const body = `# Crucible MCP

Connect any MCP client to the firm's skill factory.

Server: http://localhost:3000/api/mcp

Tools:
- crucible_suggest({ currentBranch, openFiles, activeTaskDescription })
- crucible_run({ slug })
- crucible_search({ query })
- crucible_status()
- crucible_review({ slug?, decision? })

POST JSON to /api/mcp with { "name": "crucible_suggest", "arguments": { ... } }.
`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
