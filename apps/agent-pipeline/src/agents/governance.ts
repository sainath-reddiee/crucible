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
    const text = `${skill.metadata.slug} ${skill.metadata.name} ${skill.skillMarkdown}`.toLowerCase();
    if (text.includes('streaming') || text.includes('snowpipe') || text.includes('task')) return 'prod_warehouse';
    if (text.includes('staging') || text.includes('incremental')) return 'staging_layer';
    if (text.includes('diagnose') || text.includes('audit') || text.includes('query')) return 'read_only';
    return 'multi_system';
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