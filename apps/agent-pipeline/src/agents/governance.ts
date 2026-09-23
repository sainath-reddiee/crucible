/**
 * Agent 5: The Governance Agent (Gatekeeper)
 * Classifies skills by tier, blast radius, and sensitivity, then routes them to the appropriate human reviewers.
 */

import { Skill, GovernanceClassification } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';

export class GovernanceAgent {
  private db: SnowflakeDatabase;

  constructor(db: SnowflakeDatabase) {
    this.db = db;
  }

  public async classifyAndRoute(skill: Skill, confidenceScore: number, clearanceLevel: string): Promise<GovernanceClassification> {
    const tier = this.determineTier(skill);
    const blastRadius = this.determineBlastRadius(skill);
    const sensitivity = this.determineSensitivity(skill);

    const classification: GovernanceClassification = {
      skillId: skill.metadata.id,
      tier,
      blastRadius,
      sensitivity,
      requiredReviewers: this.determineRequiredReviewers(tier, sensitivity),
      approvalStatus: 'pending',
      reasoning: this.buildReasoningTrace(tier, blastRadius, sensitivity, confidenceScore, clearanceLevel),
      escalatedToLeadership: tier === 4
    };

    // Save classification to Snowflake
    await this.db.saveGovernanceClassification(classification);

    // Notify reviewers (simulated Slack / email / dashboard alert)
    this.notifyReviewers(classification, skill);

    // Log audit entry
    await this.db.logAudit({
      actorId: 'agent-governance',
      actorName: 'Agent 5 (The Governance Agent)',
      action: 'governance_routed',
      targetSkillId: skill.metadata.id,
      tier,
      reasoningTrace: `Classified skill '${skill.metadata.slug}' as Tier ${tier}, Blast Radius: ${blastRadius}, Sensitivity: ${sensitivity}. Routed to ${classification.requiredReviewers.length} reviewers for human approval.`
    });

    return classification;
  }

  private determineTier(skill: Skill): 1 | 2 | 3 | 4 {
    const blastRadius = this.determineBlastRadius(skill);
    if (blastRadius === 'read_only') return 1;
    if (blastRadius === 'staging_layer') return 2;
    if (blastRadius === 'prod_warehouse') return 3;
    return 4;
  }

  private determineBlastRadius(skill: Skill): 'read_only' | 'staging_layer' | 'prod_warehouse' | 'multi_system' {
    // Lightweight blast radius determination - rule-based
    const slug = skill.metadata.slug.toLowerCase();
    const name = skill.metadata.name.toLowerCase();
    const markdown = skill.skillMarkdown.toLowerCase();

    // Use simplified patterns for blast radius classification
    if (this.isProductionSystem(slug, name, markdown)) {
      return 'prod_warehouse';
    }
    if (this.isStagingSystem(slug, name, markdown)) {
      return 'staging_layer';
    }
    if (this.isReadOnlySystem(slug, name, markdown)) {
      return 'read_only';
    }

    return 'multi_system';
  }

  private isProductionSystem(slug: string, name: string, markdown: string): boolean {
    // Production system indicators
    const productionIndicators = [
      'streaming', 'snowpipe', 'tasks', 'pipelines', 'warehouse',
      'production', 'prod', 'critical', 'mission-critical'
    ];

    return productionIndicators.some(indicator =>
      slug.includes(indicator) || name.includes(indicator) || markdown.includes(indicator)
    );
  }

  private isStagingSystem(slug: string, name: string, markdown: string): boolean {
    // Staging system indicators
    const stagingIndicators = [
      'staging', 'stage', 'incremental', 'temp', 'sandbox', 'development'
    ];

    return stagingIndicators.some(indicator =>
      slug.includes(indicator) || name.includes(indicator) || markdown.includes(indicator)
    );
  }

  private isReadOnlySystem(slug: string, name: string, markdown: string): boolean {
    // Read-only system indicators
    const readOnlyIndicators = [
      'diagnose', 'audit', 'query', 'read', 'view', 'report',
      'analysis', 'insight', 'monitoring'
    ];

    return readOnlyIndicators.some(indicator =>
      slug.includes(indicator) || name.includes(indicator) || markdown.includes(indicator)
    );
  }

  // Add lightweight risk scoring for governance decisions
  private calculateRiskScore(skill: Skill): number {
    // Lightweight risk calculation - no LLM needed
    let score = 50; // Base risk score

    // Adjust based on tier
    const tierMultipliers = {
      1: 0.5, // Low risk
      2: 1.0, // Medium risk
      3: 1.5, // High risk
      4: 2.0  // Critical risk
    };

    score *= tierMultipliers[skill.metadata.tier] || 1.0;

    // Adjust based on sensitivity
    const sensitivityAdjustments = {
      'generic_technical': 0,
      'financial': 30,
      'pii': 40,
      'healthcare_phi': 50,
      'confidential_ip': 35
    };

    score += (sensitivityAdjustments[skill.metadata.sensitivity] || 0);

    // Adjust based on blast radius
    if (skill.metadata.blastRadius === 'multi_system') score += 20;
    else if (skill.metadata.blastRadius === 'prod_warehouse') score += 15;

    return Math.min(100, Math.max(0, score));
  }

  private determineSensitivity(skill: Skill): 'generic_technical' | 'financial' | 'pii' | 'healthcare_phi' | 'confidential_ip' {
    const archetype = skill.metadata.archetype.toLowerCase();
    if (archetype.includes('healthcare') || archetype.includes('phi') || archetype.includes('hipaa')) return 'healthcare_phi';
    if (archetype.includes('financial') || archetype.includes('fintech') || archetype.includes('stripe')) return 'financial';
    if (skill.skillMarkdown.toLowerCase().includes('pii') || skill.skillMarkdown.toLowerCase().includes('masking')) return 'pii';
    return 'generic_technical';
  }

  private determineRequiredReviewers(tier: number, sensitivity: string): Array<{ role: string; name?: string; email?: string }> {
    const reviewers: Array<{ role: string; name?: string; email?: string }> = [
      { role: 'Original Author', name: 'Auto-assigned' }
    ];

    if (tier >= 2) {
      reviewers.push({ role: 'Senior Architect', name: 'Mishra', email: 'mishra@anblicks.com' });
    }
    if (tier >= 3) {
      reviewers.push({ role: 'Domain Lead', name: 'Karthik', email: 'karthik@anblicks.com' });
    }
    if (sensitivity === 'pii' || sensitivity === 'healthcare_phi') {
      reviewers.push({ role: 'Compliance Reviewer', name: 'Compliance Team', email: 'compliance@anblicks.com' });
    }
    if (tier >= 4) {
      reviewers.push({ role: 'Executive Sign-off', name: 'Director of Data Engineering' });
    }

    return reviewers;
  }

  private buildReasoningTrace(tier: number, blastRadius: string, sensitivity: string, confidenceScore: number, clearanceLevel: string): string {
    return `Skill classified as Tier ${tier} (blast radius: ${blastRadius}, sensitivity: ${sensitivity}). Transfer-confidence score: ${confidenceScore}/100. Clearance level: ${clearanceLevel}. Routed for human approval based on risk matrix.`;
  }

  private notifyReviewers(classification: GovernanceClassification, skill: Skill): void {
    // Simulate Slack / Email / Dashboard notification
    const reviewerNames = classification.requiredReviewers.map(r => r.name).filter(Boolean).join(', ');
    console.log(`[GOVERNANCE NOTIFY] Skill '${skill.metadata.slug}' awaiting review. Reviewers notified: ${reviewerNames}`);
  }
}