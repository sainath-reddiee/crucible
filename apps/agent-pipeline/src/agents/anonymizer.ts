/**
 * Agent 4: The Anonymizer (Trust-Builder)
 * Removes client-specific identifiers from skills so they can safely transfer between engagements.
 */

import { Skill, CapturedEvent } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';

export class AnonymizerAgent {
  private db: SnowflakeDatabase;

  constructor(db: SnowflakeDatabase) {
    this.db = db;
  }

  public async anonymizeSkill(skill: Skill): Promise<{ skill: Skill; confidenceScore: number; clearanceLevel: 'auto_cleared' | 'human_review_required' | 'rejected_un_anonymizable' }> {
    const anonymizedSkill = { ...skill };
    const scrubbedEntities: Array<{ original: string; replacement: string; entityType: string }> = [];

    // Scan for client names in citations and metadata
    const clientNames = new Set<string>();
    for (const citation of anonymizedSkill.metadata.citations) {
      if (citation.description.includes('Client-')) {
        const match = citation.description.match(/Client-(A|B|C)-([A-Za-z]+)\b/);
        if (match) clientNames.add(match[2]);
      }
    }

    // Scan for specific table names and column values in skill markdown
    const tablePattern = /(RAW\.|analytics_staging\.)?([A-Za-z_]+)/g;
    const matches = anonymizedSkill.skillMarkdown.matchAll(tablePattern);
    for (const match of matches) {
      const fullTable = match[0];
      const tableName = match[2];
      if (!['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'].includes(tableName)) {
        scrubbedEntities.push({
          original: fullTable,
          replacement: fullTable.replace(/RAW\./, '').replace(/analytics_staging\./, ''),
          entityType: 'table_name'
        });
      }
    }

    // Scrub client-specific identifiers
    if (clientNames.size > 0) {
      for (const client of clientNames) {
        scrubbedEntities.push({
          original: client,
          replacement: 'Client-[X]',
          entityType: 'client_name'
        });
      }
    }

    // Apply scrubbing transformations
    anonymizedSkill.skillMarkdown = this.applyScrubbing(anonymizedSkill.skillMarkdown, scrubbedEntities);

    // Determine engagement archetype from original context
    const archetype = this.inferArchetype(skill.metadata.archetype);
    anonymizedSkill.metadata.archetype = archetype;

    // Calculate transfer-confidence score
    const confidenceScore = this.calculateTransferConfidence(skill, scrubbedEntities);

    // Determine clearance level
    let clearanceLevel: 'auto_cleared' | 'human_review_required' | 'rejected_un_anonymizable';
    if (confidenceScore >= 70) {
      clearanceLevel = 'auto_cleared';
    } else if (confidenceScore >= 50) {
      clearanceLevel = 'human_review_required';
    } else {
      clearanceLevel = 'rejected_un_anonymizable';
    }

    // Store audit trail
    await this.db.logAudit({
      actorId: 'agent-anonymizer',
      actorName: 'Agent 4 (The Anonymizer)',
      action: 'skill_anonymized',
      targetSkillId: skill.metadata.id,
      reasoningTrace: `Anonymized skill '${skill.metadata.slug}' for cross-client transfer. Scrubbed ${scrubbedEntities.length} identifiers. Transfer-confidence score: ${confidenceScore}/100. Clearance: ${clearanceLevel}`
    });

    return { skill: anonymizedSkill, confidenceScore, clearanceLevel };
  }

  private applyScrubbing(markdown: string, entities: Array<{ original: string; replacement: string; entityType: string }>): string {
    let result = markdown;
    for (const entity of entities) {
      const regex = new RegExp(entity.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, entity.replacement);
    }
    return result;
  }

  private inferArchetype(originalArchetype: string): string {
    const archetypeMap: Record<string, string> = {
      'B2B SaaS Salesforce ingestion': 'B2B SaaS Integration',
      'Financial transaction processing': 'Financial Processing',
      'Healthcare HL7 integration': 'Healthcare Integration',
      'General Enterprise': 'General Enterprise'
    };
    return archetypeMap[originalArchetype] || 'General Enterprise';
  }

  private calculateTransferConfidence(skill: Skill, scrubbedEntities: Array<{ original: string; replacement: string; entityType: string }>): number {
    // Lightweight confidence scoring - rule-based
    let score = 85; // Base confidence score

    // Penalize skills with many sensitive identifiers
    if (skill.metadata.citations.length > 3) {
      score -= 15;
    }

    // Boost if no sensitive data was present
    if (scrubbedEntities.length === 0) {
      score += 10;
    } else {
      // Higher penalty for sensitive data types
      const sensitiveEntityCount = scrubbedEntities.filter(e =>
        e.entityType === 'client_name' || e.entityType === 'table_name'
      ).length;
      score -= sensitiveEntityCount * 5;
    }

    // Adjust based on sensitivity level
    const sensitivityMultiplier = {
      'generic_technical': 1.0,
      'financial': 0.6,
      'pii': 0.4,
      'healthcare_phi': 0.3,
      'confidential_ip': 0.5
    };

    const sensitivityFactor = sensitivityMultiplier[skill.metadata.sensitivity] || 1.0;
    score *= sensitivityFactor;

    // Boost for low-risk tier 1 skills
    if (skill.metadata.tier === 1) {
      score += 5;
    }

    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Add lightweight similarity detection for anonymization patterns
  private detectSensitivePatterns(skillMarkdown: string): Array<{ type: string; count: number }> {
    const patterns = [
      { regex: /Client-[A-Z]-\w+/g, type: 'client_name' },
      { regex: /(RAW\.|analytics_staging\.)?[A-Za-z_]+/g, type: 'table_name' },
      { regex: /\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}/g, type: 'timestamp' },
      { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, type: 'email' },
      { regex: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'ssn' }
    ];

    const detected: Array<{ type: string; count: number }> = [];
    for (const pattern of patterns) {
      const matches = skillMarkdown.match(pattern.regex) || [];
      if (matches.length > 0) {
        detected.push({ type: pattern.type, count: matches.length });
      }
    }

    return detected;
  }
}