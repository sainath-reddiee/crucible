import { SKILLS, WORK_CONTEXTS, type Skill, type WorkContext } from "@/lib/data";

export type Suggestion = {
  skill: Skill;
  score: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  branch: string;
  matched: string[];
};

export type AuditEntry = {
  id: string;
  time: string;
  action: string;
  actor: string;
  detail: string;
  skillId?: string;
};

export type ReviewItem = {
  slug: string;
  title: string;
  status: string;
  reviewer: string;
  tier: number;
  transfer: number;
  criticPass: number;
  sources: number;
  note: string;
  critic: { ok: boolean; label: string }[];
  redactions: { from: string; to: string }[];
  decision?: "approved" | "rejected" | "changes";
};

export type EventRow = {
  id: string;
  when: string;
  source: string;
  title: string;
  consented: boolean;
  engineerId: string;
};

export type RunResult = {
  slug: string;
  status: "applied" | "needs_approval" | "blocked";
  summary: string;
  output: string;
  guardrails: string[];
  rollback?: string;
};

const TECH = [
  "salesforce",
  "snowflake",
  "dbt",
  "airflow",
  "kafka",
  "snowpipe",
  "fivetran",
  "healthcare",
  "hubspot",
  "stripe",
];

const INTENT = [
  "staging",
  "incident",
  "late",
  "sla",
  "incremental",
  "onboard",
  "stream",
  "mart",
  "model",
  "contacts",
  "masking",
  "rbac",
];

function tokens(ctx: Pick<WorkContext, "task" | "branch" | "trigger" | "files" | "commands">) {
  const raw = [ctx.task, ctx.branch, ctx.trigger, ...ctx.files, ...ctx.commands]
    .join(" ")
    .toLowerCase();
  return {
    raw,
    tech: TECH.filter((t) => raw.includes(t)),
    intent: INTENT.filter((i) => raw.includes(i)),
  };
}

export function scoreContext(skills: Skill[], ctx: WorkContext): { suggestions: Suggestion[]; trace: string[] } {
  const signals = tokens(ctx);
  const trace = [
    `[1. Intake] branch="${ctx.branch}", files=[${ctx.files.join(", ")}]`,
    `[2. Signals] tech=[${signals.tech.join(", ")}] intent=[${signals.intent.join(", ")}]`,
    `[3. Pre-filter] local keyword + taxonomy (no Claude call)`,
  ];

  const scored = skills
    .filter((s) => s.maturity === "published" || s.maturity === "review")
    .map((skill) => {
      const title = `${skill.slug.replace(/-/g, " ")} ${skill.name}`.toLowerCase();
      const stack = skill.techStack.join(" ").toLowerCase();
      let score = 0.2;
      const reasons: string[] = [];
      const matched: string[] = [];

      for (const t of signals.tech) {
        if (stack.includes(t) || title.includes(t)) {
          score += 0.2;
          matched.push(t);
        }
      }
      for (const i of signals.intent) {
        if (title.includes(i)) {
          score += 0.16;
          matched.push(i);
        }
      }
      const primary = skill.techStack[0]?.toLowerCase();
      if (primary && !signals.tech.includes(primary) && !signals.raw.includes(primary)) {
        score -= 0.28;
      }
      if (signals.raw.includes(skill.slug.replace(/-/g, " "))) {
        score += 0.22;
        reasons.push("exact task pattern match");
      }
      if (skill.successRate > 0.85) {
        score += 0.06;
        reasons.push(`${Math.round(skill.successRate * 100)}% success across ${skill.uses} uses`);
      }
      if (matched.length) reasons.unshift(`matches ${matched.slice(0, 4).join(", ")}`);

      const capped = Math.min(0.99, Math.max(0, score));
      return {
        skill,
        score: Number(capped.toFixed(2)),
        confidence: (capped > 0.8 ? "high" : capped > 0.6 ? "medium" : "low") as Suggestion["confidence"],
        reason: reasons.join(" · ") || "taxonomy neighbor",
        branch: `${skill.category} / ${skill.subcategory}`,
        matched,
      };
    })
    .filter((s) => s.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored[0]) {
    trace.push(`[4. Tree] "${scored[0].branch}" · ${scored[0].skill.slug} @ ${scored[0].score}`);
  } else {
    trace.push("[4. Tree] below threshold — silence preferred");
  }

  return { suggestions: scored, trace };
}

const EXTRA: Skill[] = [
  {
    id: "skill-hub-006",
    slug: "hubspot-staging-model",
    name: "HubSpot staging model",
    description: "dbt staging for HubSpot CRM objects with property flattening and soft-delete filters.",
    category: "Transformations & Modeling",
    subcategory: "dbt Staging",
    techStack: ["HubSpot", "dbt", "Snowflake"],
    archetype: "B2B SaaS CRM ingestion",
    tier: 2,
    maturity: "published",
    author: "Karthik",
    authorId: "eng-karthik",
    successRate: 0.9,
    uses: 64,
    clients: 5,
    hoursSaved: 110,
    dollarsSaved: 18000,
    transferConfidence: 88,
    blastRadius: "staging layer only",
    sensitivity: "generic technical",
    lastUsed: "5 days ago",
    handles: ["property flattening", "soft deletes"],
    guardrails: ["Filter is_deleted = false"],
  },
  {
    id: "skill-mask-007",
    slug: "snowflake-dynamic-data-masking",
    name: "Snowflake dynamic data masking",
    description: "Tag-based masking policies for PII columns with role-aware unmask paths.",
    category: "Data Warehousing & Modeling",
    subcategory: "Snowflake RBAC",
    techStack: ["Snowflake", "SQL"],
    archetype: "Healthcare HL7 / HIPAA",
    tier: 3,
    maturity: "published",
    author: "Mishra",
    authorId: "eng-mishra",
    successRate: 0.93,
    uses: 41,
    clients: 7,
    hoursSaved: 96,
    dollarsSaved: 22000,
    transferConfidence: 84,
    blastRadius: "production warehouse",
    sensitivity: "healthcare PHI",
    lastUsed: "2 weeks ago",
    handles: ["tag-based masking", "role unmask"],
    guardrails: ["Never unmask in analyst role"],
  },
  {
    id: "skill-rbac-008",
    slug: "snowflake-rbac-matrix-scaffold",
    name: "Snowflake RBAC matrix scaffold",
    description: "Generates functional vs access-role matrix from warehouse inventory.",
    category: "Data Warehousing & Modeling",
    subcategory: "Snowflake RBAC",
    techStack: ["Snowflake", "SQL"],
    archetype: "General",
    tier: 2,
    maturity: "published",
    author: "Elena R.",
    authorId: "eng-elena",
    successRate: 0.89,
    uses: 38,
    clients: 4,
    hoursSaved: 72,
    dollarsSaved: 14000,
    transferConfidence: 91,
    blastRadius: "staging layer only",
    sensitivity: "generic technical",
    lastUsed: "8 days ago",
    handles: ["role hierarchy", "future grants"],
    guardrails: [],
  },
];

function seedReviews(): ReviewItem[] {
  return [
    {
      slug: "salesforce-staging-model",
      title: "Salesforce staging model",
      status: "awaiting author",
      reviewer: "Karthik",
      tier: 2,
      transfer: 87,
      criticPass: 85,
      sources: 3,
      note: "Drafted from 3 similar Salesforce staging PRs across clients.",
      critic: [
        { ok: true, label: "Standard Contact table" },
        { ok: true, label: "Empty dataset" },
        { ok: false, label: "Sandbox with archived records — guardrail added" },
        { ok: false, label: "Missing is_deleted — schema assertion added" },
      ],
      redactions: [
        { from: "Client-A-Retail", to: "generic_client_staging" },
        { from: "analytics_staging.client_salesforce_contacts", to: "stg_salesforce_contacts" },
        { from: "Karthik timezone algorithm", to: "Retained (essential logic)" },
      ],
    },
    {
      slug: "airflow-snowpipe-streaming-bootstrap",
      title: "Snowpipe streaming bootstrap",
      status: "tier 3 · domain lead",
      reviewer: "Mishra",
      tier: 3,
      transfer: 78,
      criticPass: 82,
      sources: 2,
      note: "Touches production streams. Single-author concentration: Ramya only.",
      critic: [
        { ok: true, label: "Happy-path channel create" },
        { ok: false, label: "Schema evolution without policy — blocked" },
      ],
      redactions: [{ from: "Client-F ledger topic", to: "generic_txn_stream" }],
    },
    {
      slug: "loyalty-points-accrual",
      title: "Loyalty points accrual",
      status: "low transfer",
      reviewer: "Mishra",
      tier: 2,
      transfer: 52,
      criticPass: 70,
      sources: 2,
      note: "Too specific to one client's loyalty program. Cannot transfer safely.",
      critic: [{ ok: true, label: "Fixture run" }],
      redactions: [{ from: "Client-B product tier name", to: "un-anonymizable" }],
    },
  ];
}

function seedEvents(): EventRow[] {
  return [
    {
      id: "evt-1",
      when: "Today · 10:14",
      source: "GitHub",
      title: "Opened PR #1842 · stg_salesforce__contacts incremental keys",
      consented: true,
      engineerId: "eng-karthik",
    },
    {
      id: "evt-2",
      when: "Today · 09:02",
      source: "Snowflake",
      title: "QUERY_HISTORY cluster: timezone casts on CONTACT.CREATED_DATE",
      consented: true,
      engineerId: "eng-karthik",
    },
    {
      id: "evt-3",
      when: "Yesterday",
      source: "dbt",
      title: "Manifest diff · 3 Salesforce staging models, same shape as Client B",
      consented: true,
      engineerId: "eng-karthik",
    },
    {
      id: "evt-4",
      when: "Mon",
      source: "GitHub",
      title: "Merged Client C late-arriving CDC pattern",
      consented: true,
      engineerId: "eng-karthik",
    },
  ];
}

class CrucibleStore {
  skills: Skill[] = [...SKILLS, ...EXTRA];
  events: EventRow[] = seedEvents();
  reviews: ReviewItem[] = seedReviews();
  audit: AuditEntry[] = [
    {
      id: "a0",
      time: new Date().toISOString(),
      action: "event_captured",
      actor: "Capture",
      detail: "Seeded GitHub + Snowflake + dbt events for Karthik",
    },
  ];
  quiet = new Set<string>();
  dismissed = new Map<string, Set<string>>();
  lastSuggest = new Map<string, { at: number; sig: string }>();
  executions = 1840;

  log(action: string, actor: string, detail: string, skillId?: string) {
    this.audit.unshift({
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: new Date().toISOString(),
      action,
      actor,
      detail,
      skillId,
    });
    this.audit = this.audit.slice(0, 80);
  }

  suggest(ctx: WorkContext, engineerId = "eng-karthik") {
    if (this.quiet.has(engineerId)) {
      return { suggestions: [] as Suggestion[], trace: ["Session silenced"], filtered: true };
    }
    const sig = `${ctx.branch}|${ctx.files.slice(0, 3).join(",")}|${ctx.task}`;
    const last = this.lastSuggest.get(engineerId);
    const dismissed = this.dismissed.get(engineerId) || new Set();
    if (last && last.sig === sig && Date.now() - last.at < 8_000) {
      return { suggestions: [] as Suggestion[], trace: ["Same context — throttled"], filtered: true };
    }
    const result = scoreContext(this.skills, ctx);
    result.suggestions = result.suggestions.filter((s) => !dismissed.has(s.skill.id));
    this.lastSuggest.set(engineerId, { at: Date.now(), sig });
    if (result.suggestions[0]) {
      this.log(
        "skill_suggested",
        "Suggester",
        `${result.suggestions[0].skill.slug} → ${engineerId} · ${result.suggestions[0].score}`,
        result.suggestions[0].skill.id
      );
    }
    return { ...result, filtered: false };
  }

  dismiss(engineerId: string, skillId: string) {
    const set = this.dismissed.get(engineerId) || new Set();
    set.add(skillId);
    this.dismissed.set(engineerId, set);
    this.log("skill_suggested", "Engineer", `Dismissed ${skillId}`, skillId);
  }

  setQuiet(engineerId: string, on: boolean) {
    if (on) this.quiet.add(engineerId);
    else this.quiet.delete(engineerId);
  }

  run(slug: string, engineerId = "eng-karthik"): RunResult {
    const skill = this.skills.find((s) => s.slug === slug);
    if (!skill) {
      return { slug, status: "blocked", summary: "Skill not found", output: "", guardrails: [] };
    }
    if (skill.tier >= 3) {
      this.log("skill_executed", engineerId, `${slug} blocked — tier ${skill.tier} needs approval`, skill.id);
      return {
        slug,
        status: "needs_approval",
        summary: `Tier ${skill.tier} requires a human gate before production.`,
        output: "",
        guardrails: skill.guardrails,
      };
    }
    skill.uses += 1;
    this.executions += 1;
    const output =
      skill.slug === "diagnose-late-dbt-run"
        ? "QUERY_HISTORY: fct_orders queued 41m. COPY_HISTORY: raw.orders 4× spike at 02:14 UTC (Fivetran backfill). Propose incremental re-run on corrected partition."
        : skill.slug === "salesforce-staging-model"
          ? "Wrote models/staging/salesforce/stg_contacts.sql with to_timestamp_ntz, is_deleted = false, incremental unique_key=id."
          : `Applied ${skill.slug} conventions on the current branch.`;
    this.log("skill_executed", engineerId, `${slug} applied`, skill.id);
    return {
      slug,
      status: "applied",
      summary: `Applied ${skill.name}. Authored by ${skill.author}.`,
      output,
      guardrails: skill.guardrails,
      rollback: skill.slug.includes("dbt") ? "git checkout HEAD -- models/" : undefined,
    };
  }

  decide(slug: string, decision: ReviewItem["decision"], actor = "Mishra") {
    const item = this.reviews.find((r) => r.slug === slug);
    if (!item) return null;
    item.decision = decision;
    item.status = decision === "approved" ? "published" : decision === "rejected" ? "rejected" : "changes requested";
    const skill = this.skills.find((s) => s.slug === slug);
    if (skill && decision === "approved") skill.maturity = "published";
    this.log("skill_approved", actor, `${slug} → ${decision}`, skill?.id);
    return item;
  }

  pipeline() {
    if (this.reviews.length === 0) this.reviews = seedReviews();
    this.log("pattern_detected", "Detector", "3 Salesforce staging clusters · similarity 0.84");
    this.log("skill_refined", "Refiner", "Drafted salesforce-staging-model with citations to 3 PRs");
    this.log("critic_adversarial_test", "Critic", "8 variants · 85% pass · 2 guardrails injected");
    this.log("skill_anonymized", "Anonymizer", "Transfer confidence 87 · auto-cleared");
    this.log("governance_routed", "Governance", "Tier 2 · author + domain senior");
    const existing = this.reviews.find((r) => r.slug === "salesforce-staging-model");
    if (existing && existing.decision) {
      existing.decision = undefined;
      existing.status = "awaiting author";
    }
    this.events.unshift({
      id: `evt-${Date.now()}`,
      when: "Just now",
      source: "Pipeline",
      title: "Nightly batch: Detector → Refiner → Critic → Anonymizer → Governance",
      consented: true,
      engineerId: "eng-karthik",
    });
    return { seeds: 1, routed: 1 };
  }

  metrics() {
    const published = this.skills.filter((s) => s.maturity === "published");
    return {
      quarter: "Q2 2026",
      published: 247,
      livePublished: published.length,
      trustTier1: 89,
      deprecated: 18,
      hours: 4847,
      dollars: 612000,
      reuse3plus: 23,
      acceptance: 71,
      active: 47,
      total: 52,
      ramp: 7.2,
      priorRamp: 28,
      executions: this.executions,
      cli: 47,
      mcp: 38,
      capture: { git: 94, snowflake: 91, dbt: 88, jira: 41 },
      governance: {
        tier3Reviewed: 100,
        unauthorized: 0,
        lastAudit: "Mar 12",
        anonQueue: this.reviews.filter((r) => !r.decision && r.transfer < 70).length,
      },
      pendingReviews: this.reviews.filter((r) => !r.decision).length,
      risks: [
        "2 skills with declining success rate (Snowflake behavior change last week)",
        "4 skills single-author — including airflow-snowpipe-streaming-bootstrap (Ramya)",
        "1 skill flagged for re-anonymization (new client overlap)",
        "1 critical skill not invoked in 60 days",
      ],
    };
  }
}

const globalStore = globalThis as unknown as { __crucible?: CrucibleStore };
export const store = globalStore.__crucible ?? (globalStore.__crucible = new CrucibleStore());

export const CONTEXTS = WORK_CONTEXTS;
export const MCP_TOOLS = [
  {
    name: "crucible_suggest",
    description: "Find relevant skills for current engineer context (branch, files, task).",
    group: "Delivery",
  },
  {
    name: "crucible_run",
    description: "Execute a published skill by slug. Tier 3+ requires approval.",
    group: "Delivery",
  },
  {
    name: "crucible_search",
    description: "Semantic / keyword search across the governed skill library.",
    group: "Library",
  },
  {
    name: "crucible_status",
    description: "Personal capture transparency: events, authored skills, dismissals.",
    group: "Trust",
  },
  {
    name: "crucible_review",
    description: "List or decide on curator review queue items.",
    group: "Governance",
  },
];
