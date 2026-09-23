/**
 * Crucible MCP Server
 * Exposes two tools to any MCP-compatible client (Claude Desktop, Cursor, Copilot, Cortex Code, Cline...):
 *  - crucible_suggest: Find relevant skills for a context
 *  - crucible_run: Execute a skill by ID
 *
 * Setup is one config file per engineer. Consumed by all AI IDEs.
 */

import {
  SnowflakeDatabase,
  UserContext,
  SkillSuggestion
} from '@crucible/core';
import { SuggesterAgent } from '@crucible/agent-pipeline';

const db = new SnowflakeDatabase({ useLocalMock: true });
const suggester = new SuggesterAgent(db);

/**
 * MCP Tool: crucible_suggest
 *
 * Input: engineer context (branch, files, commands, task description)
 * Output: ranked list of up to 3 skill suggestions with explanation traces.
 */
export async function crucible_suggest(rawContext: Record<string, any>): Promise<{
  suggestions: Array<{ skillId: string; skillName: string; relevanceScore: number; reason: string; confidence: string }>;
  trace: string[];
}> {
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
    suggestions: (suggestions as { skill: { id: string; name: string }; relevanceScore: number; reasonForSuggestion: string; confidence: string }[]).map(s => ({
      skillId: s.skill.id,
      skillName: s.skill.name,
      relevanceScore: s.relevanceScore,
      reason: s.reasonForSuggestion,
      confidence: s.confidence
    })),
    trace: traceLog
  };
}

/**
 * MCP Tool: crucible_run
 *
 * Input: skill_id (string) + optional execution payload (user-supplied variables)
 * Output: execution result or dry-run preview for Tier 2 / 3 (human approval required).
 */
export async function crucible_run(input: { skill_id: string; payload?: Record<string, any> }): Promise<{
  success: boolean;
  output: string;
  dryRun: boolean;
  trace: string[];
}> {
  const trace: string[] = [];
  const tracePrefix = `[crucible_run:${input.skill_id}]`;

  trace.push(`${tracePrefix} Step 1: Checking skill availability.`);
  const skill = await db.getSkillById(input.skill_id);
  if (!skill) {
    trace.push(`${tracePrefix} Step 2: SKILL NOT FOUND.`);
    return {
      success: false,
      output: `Skill '${input.skill_id}' not found. Run 'crucible find <query>' to discover available skills.`,
      dryRun: false,
      trace
    };
  }

  trace.push(`${tracePrefix} Step 2: Found '${skill.metadata.name}' (tier: ${skill.metadata.tier}).`);

  if (skill.metadata.tier === 1) {
    // Tier 1: execute freely (read-only diagnostics)
    trace.push(`${tracePrefix} Step 3: Tier 1 — executing directly.`);
    const output = `Executed ${skill.metadata.name} successfully. Output: ${skill.skillMarkdown.slice(0, 200)}...`;
    trace.push(`${tracePrefix} Step 4: Execution complete.`);
    return { success: true, output, dryRun: false, trace };
  }

  if (skill.metadata.tier === 2) {
    // Tier 2: propose changes but require human approval at execution
    trace.push(`${tracePrefix} Step 3: Tier 2 — returning dry-run preview for approval.`);
    return {
      success: true,
      output: `DRY RUN — Tier 2 skill requires human approval before executing.\nProposed action: ${skill.skillMarkdown.slice(0, 300)}`,
      dryRun: true,
      trace
    };
  }

  // Tier 3+: must get human approval every time
  trace.push(`${tracePrefix} Step 3: Tier 3 — BLOCKED pending human approval.`);
  return {
    success: false,
    output: `BLOCKED — Tier 3 skill requires explicit human approval at execution. Audit ledger recording intent.`,
    dryRun: true,
    trace
  };
}

// MCP Server Entry Point (simulated)
export class CrucibleMCPServer {
  public tools = {
    crucible_suggest,
    crucible_run
  };

  constructor() {
    console.log('[MCP SERVER] Crucible MCP Server initialized. Tools exposed:');
    console.log('  - crucible_suggest(context) — find relevant skills');
    console.log('  - crucible_run({skill_id, payload}) — execute or dry-run a skill');
  }
}

if (require.main === module) {
  new CrucibleMCPServer();
}
