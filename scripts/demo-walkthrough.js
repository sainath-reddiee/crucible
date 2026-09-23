/**
 * Crucible Demo Walkthrough Script
 * Simulates the complete skill-birth-to-skill-reuse loop
 * as described in Crucible's documentation.
 */

// Mock in-memory state store to track state across steps
const state = {
  skills: new Map(),
  auditLog: [],
  events: []
};

function log(message) {
  console.log(`\n[CRUCIBLE DEMO] ${message}`);
  state.auditLog.push({ timestamp: new Date().toISOString(), message });
}

async function runDemo() {
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("  CRUCIBLE — Skill Birth to Skill Reuse Demo Walkthrough");
  console.log("═══════════════════════════════════════════════════════════════════");

  // ===== STEP 1: Nightly Capture Pipeline =====
  log("STEP 1: Nightly Detection Pipeline");
  log("-----------------------------------");
  console.log("The Detector sub-agent runs its nightly batch.");
  console.log("Reading Snowflake EVENT_STREAM from past 30 days...");
  console.log("Found 3 Salesforce staging events across 3 different clients.");
  console.log("Clustering by semantic similarity... DONE.");
  log("Detector produced 1 candidate seed: 'Salesforce Staging' (3 events).");

  // ===== STEP 2: Refining the Skill =====
  log("\nSTEP 2: Refining Candidate Seed into SKILL.md");
  log("---------------------------------------------");
  const skill = {
    id: 'skill-sf-staging-001',
    slug: 'salesforce-staging-model',
    name: 'Salesforce Staging Model',
    format: 'Anthropic SKILL.md',
    description: 'Scaffold Salesforce staging models with UTC timezone conversion, late-arriving record handling, and soft-delete filtering.'
  };
  console.log("Refiner output:");
  console.log("  - trigger description ✅");
  console.log("  - tool sequence ✅");
  console.log("  - success criteria ✅");
  console.log("  - guardrails ✅");
  console.log("  - test fixtures ✅");
  console.log("  - source citations ✅ (3 events)");
  log("Refiner generated full SKILL.md for 'salesforce-staging-model'.");

  // ===== STEP 3: Adversarial Testing =====
  log("\nSTEP 3: Critic — Adversarial Testing");
  log("------------------------------------");
  console.log("Running Critic with Code Execution Tool...");
  console.log("Generated 8 adversarial variants:");
  console.log("  ✅ Standard Contact table — PASS");
  console.log("  ✅ Empty dataset — PASS");
  console.log("  ❌ Salesforce Sandbox with archived records — FAIL");
  console.log("  ❌ Missing is_deleted column — FAIL");
  log("Critic identified 2 failure modes.");
  log("Guardrail added: 'Filter WHERE is_deleted = false'");
  log("Guardrail added: 'Validate column presence before execution'");
  log("Critic Report: 85% pass rate. Skill is production-ready with guardrails.");

  // ===== STEP 4: Anonymization =====
  log("\nSTEP 4: Anonymizer — Cross-Client Transfer Preparation");
  log("------------------------------------------------------");
  console.log("Scanning for identifying elements...");
  console.log("  • 'Client-A-Retail' → generic client name");
  console.log("  • 'analytics_staging.client_salesforce_contacts' → generic table name");
  console.log("  • 'Karthik's timezone trick' → essential context (retained)");
  console.log("  • 'Client-B Fintech tier' → business term redaction needed");
  log("Anonymizer tagged engagement archetype: 'B2B SaaS Salesforce ingestion'");
  log("Transfer-confidence score: 87/100 — AUTO-CLEARED for cross-client use");

  // ===== STEP 5: Governance Routing =====
  log("\nSTEP 5: Governance — Review Routing");
  log("------------------------------------");
  console.log("Tier: 2 (propose changes, human approval at execution)");
  console.log("Blast Radius: staging_layer");
  console.log("Sensitivity: generic_technical");
  log("Skill routed to Karthik (author) for review.");

  // ===== STEP 6: Human Approval =====
  log("\nSTEP 6: Human Review — Approval");
  log("-------------------------------");
  console.log("Karthik opens personal Crucible dashboard.");
  console.log("Reviews draft side-by-side with source PRs.");
  console.log("Sees Critic's flagged edge cases.");
  console.log("Sees Anonymizer's audit log of redactions.");
  console.log("✅ Clicks APPROVE.");
  log("Skill 'salesforce-staging-model' published to library.");

  // ===== STEP 7: Skill Reuse =====
  log("\nSTEP 7: Skill Reuse — The Loop Closes");
  log("--------------------------------------");
  console.log("\nThree weeks later, Karthik starts his fourth Salesforce engagement.");
  console.log("He types in terminal: 'git checkout -b feature/salesforce-contacts-stg'");
  console.log("\n  ╭──────────────────────────────────────────────────────╮");
  console.log("  │ CRUCIBLE ▸ I see you're starting a Salesforce        │");
  console.log("  │ staging model.                                       │");
  console.log("  │ Suggested skill: salesforce-staging-model            │");
  console.log("  │  ★ 87% success rate, used 12× across 4 clients       │");
  console.log("  │ Authored by you, 21 days ago                        │");
  console.log("  │ [Use it?] [c]  Dismiss [d]  Tell me more [m]        │");
  console.log("  ╰──────────────────────────────────────────────────────╯");
  console.log("\nKarthik types 'c'. Skill executes in 2 seconds.");
  log("Suggester agent: context-match + tree navigation → recommended skill");
  log("Suggester: 200-500 token compressed context payload sent to Claude");
  log("Result: 15 minutes of work done in 20 seconds. Loop closed.");

  // ===== FINAL =====
  console.log("\n═══════════════════════════════════════════════════════════════════");
  console.log("  Demo complete — 7-step skill birth to reuse cycle verified ✅");
  console.log("═══════════════════════════════════════════════════════════════════");

  // Print summary
  console.log(`\n📊 Audit Trail: ${state.auditLog.length} events logged`);
  console.log("Try running the CLI: python apps/cli/index.py crucible find 'Salesforce staging'" );
  console.log("Try MCP server suggestion: call crucible_suggest({context})");
}

if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
