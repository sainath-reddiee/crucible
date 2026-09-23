import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import {
  SnowflakeDatabase,
  UserContext
} from '@crucible/core';
import { SuggesterAgent } from '@crucible/agent-pipeline';

const db = new SnowflakeDatabase({ useLocalMock: true });
const suggester = new SuggesterAgent(db);

const server = new Server(
  {
    name: "crucible-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: crucible_suggest
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "crucible_suggest",
        description: "Find relevant skills for a context",
        inputSchema: {
          type: "object",
          properties: {
            engineerId: { type: "string" },
            currentBranch: { type: "string" },
            openFiles: { type: "array", items: { type: "string" } },
            activeTaskDescription: { type: "string" }
          }
        },
      },
      {
        name: "crucible_run",
        description: "Execute a skill by ID",
        inputSchema: {
          type: "object",
          properties: {
            skill_id: { type: "string" },
            payload: { type: "object" }
          },
          required: ["skill_id"]
        },
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "crucible_suggest") {
    const rawContext = request.params.arguments as any;
    const ctx: UserContext = {
      engineerId: rawContext.engineerId || 'eng-demo',
      engineerName: rawContext.engineerName || 'Demo Engineer',
      currentBranch: rawContext.currentBranch,
      openFiles: rawContext.openFiles || [],
      recentCommands: rawContext.recentCommands || [],
      activeTaskDescription: rawContext.activeTaskDescription || '',
      queryContext: rawContext.queryContext || '',
      timestamp: new Date().toISOString()
    };
    const { suggestions, traceLog } = await suggester.suggestForContext(ctx);
    return {
      content: [{ type: "text", text: JSON.stringify({ suggestions, trace: traceLog }) }]
    };
  } else if (request.params.name === "crucible_run") {
    // ... implement crucible_run logic here similarly
    throw new Error("crucible_run not fully implemented in MCP yet");
  }
  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Crucible MCP Server running on stdio");
}

main().catch(console.error);
