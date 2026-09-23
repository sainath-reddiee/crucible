export type SkillTier = 1 | 2 | 3 | 4;

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  techStack: string[];
  archetype: string;
  tier: SkillTier;
  maturity: "draft" | "review" | "published" | "deprecated";
  author: string;
  authorId: string;
  successRate: number;
  uses: number;
  clients: number;
  hoursSaved: number;
  dollarsSaved: number;
  transferConfidence: number;
  blastRadius: string;
  sensitivity: string;
  lastUsed: string;
  handles: string[];
  guardrails: string[];
};

export type Suggestion = {
  skill: Skill;
  score: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  branch: string;
  matched: string[];
};

export type WorkContext = {
  id: string;
  label: string;
  persona: string;
  trigger: string;
  branch: string;
  files: string[];
  commands: string[];
  task: string;
  why: string;
};

export const SKILLS: Skill[] = [
  {
    id: "skill-sf-stg-001",
    slug: "salesforce-staging-model",
    name: "Salesforce staging model",
    description:
      "Canonical dbt staging for Salesforce objects: UTC normalize, late-arriving CDC, archived-record filter.",
    category: "Transformations & Modeling",
    subcategory: "dbt Staging",
    techStack: ["Salesforce", "dbt", "Snowflake", "SQL"],
    archetype: "B2B SaaS Salesforce ingestion",
    tier: 2,
    maturity: "published",
    author: "Karthik",
    authorId: "eng-karthik",
    successRate: 0.87,
    uses: 121,
    clients: 8,
    hoursSaved: 360,
    dollarsSaved: 48000,
    transferConfidence: 87,
    blastRadius: "staging layer only",
    sensitivity: "generic technical",
    lastUsed: "3 days ago",
    handles: [
      "timezone normalization",
      "archived records",
      "incremental late-arriving data",
    ],
    guardrails: [
      "WHERE is_deleted = false AND is_archived = false",
      "Cast Salesforce DATETIME with to_timestamp_ntz()",
    ],
  },
  {
    id: "skill-dbt-diag-002",
    slug: "diagnose-late-dbt-run",
    name: "Diagnose late dbt run",
    description:
      "Read-only incident path: QUERY_HISTORY, COPY_HISTORY, warehouse queueing, Fivetran backfill.",
    category: "Quality, Observability & Governance",
    subcategory: "Incident diagnosis",
    techStack: ["dbt", "Snowflake", "Airflow", "Fivetran"],
    archetype: "General",
    tier: 1,
    maturity: "published",
    author: "Elena R.",
    authorId: "eng-elena",
    successRate: 0.94,
    uses: 312,
    clients: 14,
    hoursSaved: 780,
    dollarsSaved: 94000,
    transferConfidence: 95,
    blastRadius: "read only",
    sensitivity: "generic technical",
    lastUsed: "3 days ago",
    handles: ["SLA breach", "row-count spikes", "warehouse queueing"],
    guardrails: ["Read-only ACCOUNT_USAGE / INFORMATION_SCHEMA queries"],
  },
  {
    id: "skill-dbt-inc-003",
    slug: "dbt-incremental-bootstrap",
    name: "dbt incremental bootstrap",
    description:
      "Merge keys, lookback windows, and clustering for warehouse incremental models.",
    category: "Transformations & Modeling",
    subcategory: "Incremental strategies",
    techStack: ["dbt", "Snowflake", "SQL"],
    archetype: "General",
    tier: 2,
    maturity: "published",
    author: "Marcus W.",
    authorId: "eng-marcus",
    successRate: 0.92,
    uses: 187,
    clients: 6,
    hoursSaved: 440,
    dollarsSaved: 54000,
    transferConfidence: 90,
    blastRadius: "staging layer only",
    sensitivity: "generic technical",
    lastUsed: "1 week ago",
    handles: ["merge keys", "lookback windows", "unique-key clustering"],
    guardrails: [],
  },
  {
    id: "skill-dbt-mart-004",
    slug: "dbt-mart-bootstrap",
    name: "dbt mart bootstrap",
    description:
      "Dimensional fct/dim scaffold with surrogate keys, YAML docs, and exposure tests.",
    category: "Transformations & Modeling",
    subcategory: "Marts",
    techStack: ["dbt", "Snowflake", "SQL"],
    archetype: "Healthcare HL7 / HIPAA",
    tier: 2,
    maturity: "published",
    author: "Tarun",
    authorId: "eng-tarun",
    successRate: 0.91,
    uses: 187,
    clients: 5,
    hoursSaved: 220,
    dollarsSaved: 31000,
    transferConfidence: 90,
    blastRadius: "staging layer only",
    sensitivity: "healthcare PHI",
    lastUsed: "yesterday",
    handles: ["surrogate keys", "exposures", "HIPAA naming"],
    guardrails: [],
  },
  {
    id: "skill-stream-005",
    slug: "airflow-snowpipe-streaming-bootstrap",
    name: "Snowpipe streaming bootstrap",
    description:
      "Snowpipe Streaming channels, offset checkpoints, and DLQ handlers from Airflow.",
    category: "Orchestration & Pipelines",
    subcategory: "Streaming",
    techStack: ["Airflow", "Snowpipe", "Snowflake", "Kafka"],
    archetype: "Fintech transaction processing",
    tier: 3,
    maturity: "review",
    author: "Ramya",
    authorId: "eng-ramya",
    successRate: 0.82,
    uses: 19,
    clients: 3,
    hoursSaved: 190,
    dollarsSaved: 24000,
    transferConfidence: 78,
    blastRadius: "production warehouse",
    sensitivity: "financial",
    lastUsed: "60 days ago",
    handles: ["channel offsets", "schema evolution", "DLQ"],
    guardrails: ["Require schema-evolution policy before channel create"],
  },
];

export const WORK_CONTEXTS: WorkContext[] = [
  {
    id: "salesforce",
    label: "Salesforce staging",
    persona: "Karthik · senior",
    trigger: "git checkout -b feature/salesforce-contacts-stg",
    branch: "feature/salesforce-contacts-stg",
    files: [
      "models/staging/salesforce/stg_contacts.sql",
      "models/staging/salesforce/_salesforce.yml",
    ],
    commands: ["git checkout -b feature/salesforce-contacts-stg"],
    task: "Build Salesforce contacts staging model with timezone and archived records",
    why: "Branch + open files look like a Salesforce → dbt staging task.",
  },
  {
    id: "incident",
    label: "Late dbt SLA",
    persona: "Priya · junior",
    trigger: 'crucible find "fct_orders pipeline late"',
    branch: "hotfix/fct-orders-sla",
    files: ["models/marts/fct_orders.sql", "logs/dbt.log"],
    commands: ["dbt run --select fct_orders", "crucible find fct_orders late"],
    task: "fct_orders pipeline late, where do I start?",
    why: "dbt run + SLA language routes to incident diagnosis.",
  },
  {
    id: "onboard",
    label: "Healthcare onboard",
    persona: "Tarun · new hire",
    trigger: "crucible onboard --engagement healthcare-snowflake",
    branch: "onboard/healthcare-snowflake",
    files: ["models/marts/fct_claims.sql"],
    commands: ["crucible onboard --engagement healthcare-snowflake"],
    task: "Onboard to healthcare Snowflake engagement, week 6 marts build",
    why: "Healthcare + marts intent matches the firm starter pack.",
  },
  {
    id: "streaming",
    label: "Snowpipe streaming",
    persona: "Ramya · specialist",
    trigger: "airflow dags list --subdir snowpipe_streaming",
    branch: "feature/snowpipe-streaming",
    files: ["dags/snowpipe_streaming.py", "include/snowpipe_channel.json"],
    commands: ["airflow dags list"],
    task: "Bootstrap Snowpipe Streaming with Airflow sensors",
    why: "Airflow + Snowpipe tokens hit the streaming branch of the tree.",
  },
];

export const CAPTURED_EVENTS = [
  {
    id: "evt-1",
    when: "Today · 10:14",
    source: "GitHub",
    title: "Opened PR #1842 · stg_salesforce__contacts incremental keys",
    consented: true,
  },
  {
    id: "evt-2",
    when: "Today · 09:02",
    source: "Snowflake",
    title: "QUERY_HISTORY cluster: timezone casts on CONTACT.CREATED_DATE",
    consented: true,
  },
  {
    id: "evt-3",
    when: "Yesterday",
    source: "dbt",
    title: "Manifest diff · 3 Salesforce staging models, same shape as Client B",
    consented: true,
  },
  {
    id: "evt-4",
    when: "Mon",
    source: "GitHub",
    title: "Merged Client C late-arriving CDC pattern",
    consented: true,
  },
];

export const REVIEW_QUEUE = [
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
    title: "Loyalty points accrual (rejected candidate)",
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

export const LEADERSHIP = {
  quarter: "Q2 2026",
  published: 247,
  trustTier1: 89,
  deprecated: 18,
  sunsetting: 6,
  hours: 4847,
  dollars: 612000,
  reuse3plus: 23,
  acceptance: 71,
  active: 47,
  total: 52,
  ramp: 7.2,
  priorRamp: 28,
  executions: 1840,
  cli: 47,
  mcp: 38,
  capture: { git: 94, snowflake: 91, dbt: 88, jira: 41 },
  governance: {
    tier3Reviewed: 100,
    unauthorized: 0,
    lastAudit: "Mar 12",
    anonQueue: 0,
  },
  risks: [
    "2 skills with declining success rate (Snowflake behavior change last week)",
    "4 skills single-author — including airflow-snowpipe-streaming-bootstrap (Ramya)",
    "1 skill flagged for re-anonymization (new client overlap)",
    "1 critical skill not invoked in 60 days",
  ],
};

export const AUDIT = [
  {
    time: "10:14:22",
    action: "skill_suggested",
    actor: "Suggester",
    detail: "salesforce-staging-model → Karthik · score 0.93 · branch match",
  },
  {
    time: "09:02:11",
    action: "event_captured",
    actor: "Capture",
    detail: "Snowflake QUERY_HISTORY · consented · Karthik",
  },
  {
    time: "Mon 08:12",
    action: "governance_routed",
    actor: "Governance",
    detail: "tier 2 · author + domain senior · Slack + dashboard",
  },
  {
    time: "Fri 02:14",
    action: "pattern_detected",
    actor: "Detector",
    detail: "3 Salesforce staging clusters · similarity 0.84",
  },
];
