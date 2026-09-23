# Crucible

Tapetide-style MCP product + wired workspace. One in-memory engine powers the UI, REST, and MCP.

## Run

```bash
cd c:\Users\satyasainath.p\Crucible
npm install
npm run dev
```

- Product: http://localhost:3000
- MCP hub: http://localhost:3000/mcp
- Engineer workbench: http://localhost:3000/app/engineer

## Wired APIs

| Endpoint | Role |
|---|---|
| `GET/POST /api/suggest` | Context → skills (quiet / dismiss) |
| `POST /api/run` | Execute a skill |
| `GET/POST /api/review` | Curator queue |
| `GET /api/skills` | Catalog |
| `GET /api/events` | Capture ledger |
| `GET /api/metrics` | Leadership |
| `GET /api/audit` | Append-only ledger |
| `POST /api/pipeline` | Detector → Governance demo |
| `GET/POST /api/mcp` | MCP tools: suggest, run, search, status, review |
| `GET /mcp/llms.txt` | Connect prompt target |

Connect prompt:

```
fetch http://localhost:3000/mcp/llms.txt and connect me to the Crucible MCP
```
