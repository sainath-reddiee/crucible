/**
 * Core type definitions for Crucible Platform
 */

export type SkillTier = 1 | 2 | 3 | 4;

export type SkillMaturity = 'draft' | 'under_review' | 'published' | 'deprecated' | 'archived';

export type BlastRadius = 'read_only' | 'staging_layer' | 'snowflake_tasks' | 'prod_warehouse' | 'multi_system';

export type DataSensitivity = 'generic_technical' | 'financial' | 'pii' | 'healthcare_phi' | 'confidential_ip';

export type EventType =
  | 'git_pr'
  | 'snowflake_query'
  | 'dbt_manifest'
  | 'airflow_dag'
  | 'jira_ticket'
  | 'ai_conversation';

export interface TestFixture {
  id: string;
  name: string;
  input: Record<string, any>;
  expectedOutput: Record<string, any>;
  isAdversarial?: boolean;
  adversarialType?: 'malformed_input' | 'missing_fields' | 'edge_values' | 'race_condition' | 'empty_dataset';
}

export interface SkillGuardrail {
  rule: string;
  enforcement: 'pre_condition' | 'runtime_filter' | 'post_validation';
  originAgent: 'refiner' | 'critic' | 'governance';
  reason: string;
}

export interface SkillMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  techStack: string[];
  archetype: string;
  tier: SkillTier;
  maturity: SkillMaturity;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviewers: Array<{
    id: string;
    name: string;
    role: string;
    approvedAt?: string;
  }>;
  successRate: number; // 0.0 to 1.0
  totalUses: number;
  lastUsedAt?: string;
  transferConfidenceScore: number; // 0 to 100
  blastRadius: BlastRadius;
  sensitivity: DataSensitivity;
  rollbackPath?: string;
  citations: Array<{
    sourceEventId: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  metadata: SkillMetadata;
  skillMarkdown: string; // Compliant with Anthropic SKILL.md format
  testFixtures: TestFixture[];
  guardrails: SkillGuardrail[];
  knownLimitations: string[];
  embedding?: number[];
}

export interface CapturedEvent {
  id: string;
  timestamp: string;
  engineerId: string;
  engineerName: string;
  clientEngagement: string; // e.g. "Client-A-Retail", "Client-B-Fintech"
  eventType: EventType;
  title: string;
  details: Record<string, any>;
  rawSnippet?: string;
  summary?: string; // One-sentence summary from Claude
  summaryEmbedding?: number[];
  consented: boolean;
}

export interface SkillSeed {
  id: string;
  clusterTitle: string;
  eventIds: string[];
  events: CapturedEvent[];
  repetitionCount: number;
  consistencyScore: number;
  hypothesis: string;
  detectedAt: string;
}

export interface CriticReport {
  skillId: string;
  testedAt: string;
  testCount: number;
  passCount: number;
  failCount: number;
  identifiedEdgeCases: string[];
  injectedGuardrails: SkillGuardrail[];
  knownLimitations: string[];
  isProductionReady: boolean;
  trace: string;
}

export interface AnonymizerReport {
  skillId: string;
  anonymizedAt: string;
  scrubbedEntities: Array<{
    original: string;
    replacement: string;
    entityType: 'client_name' | 'table_name' | 'schema_name' | 'business_term' | 'pii';
  }>;
  engagementArchetype: string;
  transferConfidenceScore: number; // 0-100
  clearanceLevel: 'auto_cleared' | 'human_review_required' | 'rejected_un_anonymizable';
}

export interface GovernanceClassification {
  skillId: string;
  tier: SkillTier;
  blastRadius: BlastRadius;
  sensitivity: DataSensitivity;
  requiredReviewers: Array<{
    role: string;
    name?: string;
    email?: string;
  }>;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  reasoning: string;
  escalatedToLeadership: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action:
    | 'event_captured'
    | 'pattern_detected'
    | 'skill_refined'
    | 'critic_adversarial_test'
    | 'skill_anonymized'
    | 'governance_routed'
    | 'skill_approved'
    | 'skill_suggested'
    | 'skill_executed'
    | 'skill_rollback';
  targetSkillId?: string;
  tier?: SkillTier;
  reasoningTrace: string;
  metadata?: Record<string, any>;
  rollbackToken?: string;
}

export interface UserContext {
  engineerId: string;
  engineerName: string;
  clientEngagement?: string;
  currentBranch?: string;
  openFiles?: string[];
  recentCommands?: string[];
  recentErrors?: string[];
  queryContext?: string;
  activeTaskDescription?: string;
  timestamp: string;
}

export interface SkillSuggestion {
  skill: SkillMetadata;
  relevanceScore: number; // 0.0 - 1.0
  reasonForSuggestion: string;
  matchedCategoryBranch: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ExecutiveMetrics {
  totalPublishedSkills: number;
  hoursSavedQuarter: number;
  dollarValueSaved: number;
  crossEngagementReuseCount: number;
  acceptanceRatePercentage: number;
  activeEngineersCount: number;
  totalEngineersCount: number;
  juniorRampDays: number;
  previousRampDays: number;
  skillExecutionsQuarter: number;
  tier3ExecutionsReviewedPercentage: number;
  unauthorizedActionsDetected: number;
  riskFlags: Array<{
    skillId: string;
    skillName: string;
    flagType: 'declining_success' | 'single_author_risk' | 'stale_skill' | 're_anonymization_needed';
    description: string;
  }>;
  topImpactSkills: Array<{
    id: string;
    name: string;
    uses: number;
    hoursSaved: number;
    dollarsSaved: number;
    author: string;
  }>;
}
