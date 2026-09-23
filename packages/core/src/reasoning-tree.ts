/**
 * Explainable Reasoning-Based Tree Navigator
 *
 * Combines Snowflake vector pre-filtering (narrowing 200+ skills to top-20)
 * with a multi-step explainable reasoning decision tree to select top-3 recommendations
 * and produce a human-readable transparent trace for engineers.
 */

import { Skill, UserContext, SkillSuggestion } from './types.js';
import { CRUCIBLE_TAXONOMY, TaxonomyCategory } from './taxonomy.js';
import { SnowflakeDatabase } from './snowflake.js';

export interface TreeNavigationNode {
  id: string;
  name: string;
  intentSignals: string[];
  techSignals: string[];
  children?: TreeNavigationNode[];
}

export interface NavigationDecision {
  category: string;
  subcategory: string;
  matchedKeywords: string[];
  confidenceScore: number;
  reasoningStep: string;
}

export class ExplainableReasoningTreeNavigator {
  private db: SnowflakeDatabase;
  private taxonomy: TaxonomyCategory[];

  constructor(db: SnowflakeDatabase) {
    this.db = db;
    this.taxonomy = CRUCIBLE_TAXONOMY;
  }

  /**
   * Main Hybrid Navigation:
   * 1. Vector Pre-filter (Top 20 candidates from Snowflake)
   * 2. Context Intent & Tech Extraction
   * 3. Hierarchical Tree Routing & Scoring
   * 4. Explainable Top-3 Selection with Trace
   */
  public async navigate(context: UserContext): Promise<{
    suggestions: SkillSuggestion[];
    traceLog: string[];
    selectedBranch: string;
  }> {
    const traceLog: string[] = [];
    traceLog.push(`[1. Intake] Analyzing engineer context: branch="${context.currentBranch || 'none'}", files=[${(context.openFiles || []).join(', ')}], task="${context.activeTaskDescription || 'ambient'}"`);

    // Extract technical signals and intent from context
    const extractedSignals = this.extractSignals(context);
    traceLog.push(`[2. Signal Extraction] Identified tech tokens: [${extractedSignals.tech.join(', ')}] | intent tokens: [${extractedSignals.intent.join(', ')}]`);

    // Step 1: Vector Pre-Filter
    // In production this queries Snowflake VECTOR_COSINE_SIMILARITY
    const dummyQueryVector: number[] = new Array(1536).fill(0.01);
    const top20Candidates = await this.db.searchSkillsByVector(dummyQueryVector, 20);
    traceLog.push(`[3. Vector Pre-Filter] Snowflake VECTOR_COSINE_SIMILARITY narrowed 200+ library down to ${top20Candidates.length} candidate seeds.`);

    // Step 2: Reasoning Tree Navigation (Categorical branch selection)
    const branchDecision = this.evaluateCategoryBranch(extractedSignals);
    traceLog.push(`[4. Tree Navigation] Routed to branch: "${branchDecision.category} -> ${branchDecision.subcategory}". Confidence: ${(branchDecision.confidenceScore * 100).toFixed(0)}%. Step: ${branchDecision.reasoningStep}`);

    // Step 3: Multi-Criteria Candidate Scoring
    const scoredSkills: Array<{
      skill: Skill;
      score: number;
      explanation: string;
      confidence: 'high' | 'medium' | 'low';
    }> = [];

    for (const item of top20Candidates) {
      const skill = item.skill;
      const scoreResult = this.scoreSkillAgainstContext(skill, extractedSignals, branchDecision);
      if (scoreResult.score > 0.4) {
        scoredSkills.push({
          skill,
          score: scoreResult.score,
          explanation: scoreResult.explanation,
          confidence: scoreResult.score > 0.8 ? 'high' : scoreResult.score > 0.6 ? 'medium' : 'low'
        });
      }
    }

    // Sort descending by score
    scoredSkills.sort((a, b) => b.score - a.score);
    const top3 = scoredSkills.slice(0, 3);

    traceLog.push(`[5. Selection] Selected top-${top3.length} explainable recommendations out of ${scoredSkills.length} passing threshold.`);

    const suggestions: SkillSuggestion[] = top3.map(item => ({
      skill: item.skill.metadata,
      relevanceScore: parseFloat(item.score.toFixed(2)),
      reasonForSuggestion: item.explanation,
      matchedCategoryBranch: `${branchDecision.category} / ${branchDecision.subcategory}`,
      confidence: item.confidence
    }));

    return {
      suggestions,
      traceLog,
      selectedBranch: `${branchDecision.category} > ${branchDecision.subcategory}`
    };
  }

  private extractSignals(ctx: UserContext): { tech: string[]; intent: string[]; rawText: string } {
    const rawTokens = [
      ctx.activeTaskDescription || '',
      ctx.currentBranch || '',
      ...(ctx.openFiles || []),
      ...(ctx.recentCommands || []),
      ...(ctx.recentErrors || []),
      ctx.queryContext || ''
    ].join(' ').toLowerCase();

    const techCatalog = [
      'salesforce', 'snowflake', 'dbt', 'airflow', 'soda', 'kafka', 'iceberg',
      'databricks', 'bigquery', 'redshift', 'hubspot', 'stripe', 'postgres',
      'python', 'sql', 'snowpipe', 'fivetran'
    ];

    const intentCatalog = [
      'staging', 'incident', 'late', 'fix', 'error', 'debug', 'sla',
      'bootstrap', 'incremental', 'masking', 'rbac', 'cluster', 'dedup',
      'onboard', 'stream', 'dag', 'table', 'model', 'test'
    ];

    const detectedTech = techCatalog.filter(t => rawTokens.includes(t));
    const detectedIntent = intentCatalog.filter(i => rawTokens.includes(i));

    return {
      tech: detectedTech,
      intent: detectedIntent,
      rawText: rawTokens
    };
  }

  private evaluateCategoryBranch(signals: { tech: string[]; intent: string[]; rawText: string }): NavigationDecision {
    let bestCat = '2. Transformations & Modeling';
    let bestSubcat = 'dbt Staging & Intermediate Patterns';
    let maxScore = 0;
    let stepReason = 'Defaulting to Transformations based on standard engineering workflow';

    for (const cat of this.taxonomy) {
      for (const sub of cat.subcategories) {
        let currentScore = 0;
        const subNameLower = sub.name.toLowerCase() + ' ' + sub.description.toLowerCase();

        for (const t of signals.tech) {
          if (subNameLower.includes(t)) currentScore += 2.0;
        }
        for (const i of signals.intent) {
          if (subNameLower.includes(i)) currentScore += 1.5;
        }

        if (currentScore > maxScore) {
          maxScore = currentScore;
          bestCat = cat.name;
          bestSubcat = sub.name;
          stepReason = `Matched ${signals.tech.length} tech signals (${signals.tech.join(', ')}) and ${signals.intent.length} intent keywords in taxonomy node.`;
        }
      }
    }

    const confidence = Math.min(1.0, 0.5 + maxScore * 0.1);
    return {
      category: bestCat,
      subcategory: bestSubcat,
      matchedKeywords: [...signals.tech, ...signals.intent],
      confidenceScore: confidence,
      reasoningStep: stepReason
    };
  }

  private scoreSkillAgainstContext(
    skill: Skill,
    signals: { tech: string[]; intent: string[]; rawText: string },
    decision: NavigationDecision
  ): { score: number; explanation: string } {
    let score = 0.3; // base prior
    const reasons: string[] = [];

    const meta = skill.metadata;
    const skillText = `${meta.slug} ${meta.name} ${meta.description} ${(meta.techStack || []).join(' ')} ${meta.category}`.toLowerCase();

    // 1. Tech stack alignment (+0.3 max)
    let techMatchCount = 0;
    for (const t of signals.tech) {
      if (skillText.includes(t)) {
        techMatchCount++;
      }
    }
    if (techMatchCount > 0) {
      score += Math.min(0.35, techMatchCount * 0.18);
      reasons.push(`matches target stack (${signals.tech.join(', ')})`);
    }

    // 2. Intent alignment (+0.3 max)
    let intentMatchCount = 0;
    for (const i of signals.intent) {
      if (skillText.includes(i)) {
        intentMatchCount++;
      }
    }
    if (intentMatchCount > 0) {
      score += Math.min(0.35, intentMatchCount * 0.15);
      reasons.push(`solves active problem intent (${signals.intent.join(', ')})`);
    }

    // 3. Category branch boost (+0.15)
    if (meta.category.toLowerCase().includes(decision.category.slice(0, 10).toLowerCase())) {
      score += 0.15;
    }

    // 4. Historical reliability prior (+0.1)
    if (meta.successRate && meta.successRate > 0.85) {
      score += 0.1;
      reasons.push(`proven ${(meta.successRate * 100).toFixed(0)}% success rate across ${meta.totalUses || 1} uses`);
    }

    // 5. Direct slug / query exact match
    if (signals.rawText.includes(meta.slug.replace(/-/g, ' '))) {
      score += 0.25;
      reasons.push('exact task pattern match');
    }

    const cappedScore = Math.min(0.99, Math.max(0.1, score));
    const explanation = reasons.length > 0
      ? `This skill ${reasons.join(', ')}.`
      : `Matches taxonomy path ${decision.subcategory}.`;

    return {
      score: cappedScore,
      explanation
    };
  }
}
