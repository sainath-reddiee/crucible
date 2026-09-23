/**
 * Agent 2: The Refiner (Writer)
 * Takes candidate SkillSeeds and turns them into complete SKILL.md files,
 * structured test fixtures, and authorable skills ready for adversarial testing.
 */

import { SkillSeed, Skill, CapturedEvent } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';

export class RefinerAgent {
  private db: SnowflakeDatabase;

  constructor(db: SnowflakeDatabase) {
    this.db = db;
  }

  public async refineSkillSeed(seed: SkillSeed): Promise<Skill> {
    // 1. Aggregate all source events
    const events = seed.events;
    const narrative = this.buildCanonicalNarrative(events);
    const techStacks = this.extractCommonTechStack(events);
    const triggerConditions = this.extractTriggerConditions(events);

    const skill: Skill = {
      metadata: {
        id: `skill-${seed.id}`,
        slug: this.generateSlug(seed.clusterTitle),
        name: this.titleCase(seed.clusterTitle),
        description: `Canonical pattern: ${narrative.slice(0, 150)}...`,
        category: this.determineCategory(techStacks, seed.clusterTitle),
        subcategory: this.determineSubcategory(techStacks, seed.clusterTitle),
        techStack: techStacks,
        archetype: this.extractArchetype(events),
        tier: 2,
        maturity: 'draft',
        author: {
          id: this.inferAuthor(events),
          name: this.inferAuthorName(events),
          email: `${this.inferAuthorName(events).toLowerCase().replace(' ', '.')}@anblicks.com`
        },
        reviewers: [],
        successRate: 0,
        totalUses: 0,
        transferConfidenceScore: 0,
        blastRadius: 'staging_layer',
        sensitivity: 'generic_technical',
        citations: events.map(e => ({ sourceEventId: e.id, description: e.title })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      guardrails: [],
      knownLimitations: [],
      testFixtures: this.generateTestFixtures(events),
      skillMarkdown: this.generateSkillMarkdown(seed.clusterTitle, narrative, triggerConditions, techStacks),
      embedding: undefined
    };

    // Log to audit
    await this.db.logAudit({
      actorId: 'agent-refiner',
      actorName: 'Agent 2 (The Refiner)',
      action: 'skill_refined',
      targetSkillId: skill.metadata.id,
      reasoningTrace: `Derived canonical skill '${skill.metadata.slug}' from ${events.length} source events, built narrative: ${narrative.slice(0, 200)}...`
    });

    return skill;
  }

  private buildCanonicalNarrative(events: CapturedEvent[]): string {
    // Use lightweight pattern extraction instead of Claude
    const patterns = events.map(e => this.extractPattern(e));

    // Use rule-based narrative construction
    return this.constructNarrativeFromPatterns(patterns);
  }

  private extractPattern(event: CapturedEvent): string {
    const snippet = event.rawSnippet || '';
    const title = event.title.toLowerCase();

    // Rule-based pattern extraction
    if (snippet.includes('to_timestamp_ntz') && snippet.includes('is_deleted')) {
      return 'timestamp conversion & soft-delete filtering';
    }
    if (title.includes('incremental') || title.includes('merge')) {
      return 'incremental dbt staging';
    }
    if (title.includes('staging') && title.includes('salesforce')) {
      return 'salesforce to snowflake staging pipeline';
    }
    if (title.includes('streaming') || title.includes('snowpipe')) {
      return 'real-time streaming ingestion';
    }
    if (title.includes('mask') || title.includes('phi') || title.includes('pii')) {
      return 'data masking & compliance';
    }

    // Lightweight semantic grouping
    return this.groupIntoSemanticCategory(event);
  }

  private groupIntoSemanticCategory(event: CapturedEvent): string {
    // Lightweight categorization based on event attributes
    const categoryMap: Record<string, string> = {
      'salesforce': 'Salesforce data integration',
      'snowflake': 'Snowflake warehouse operations',
      'dbt': 'Data transformation workflows',
      'streaming': 'Real-time data pipelines',
      'masking': 'Data privacy and compliance',
      'api': 'API integration and transformations'
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (event.title.toLowerCase().includes(keyword) ||
          (event.summary && event.summary.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'Standard data processing operation';
  }

  private constructNarrativeFromPatterns(patterns: string[]): string {
    // Rule-based narrative construction
    const patternCounts = this.countPatternFrequency(patterns);

    let narrative = 'This canonical pattern involves:';

    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count >= 2) {
        narrative += ` ${count} occurrences of ${pattern},`;
      } else {
        narrative += ` ${pattern},`;
      }
    }

    // Clean up and return
    return narrative.replace(/,\s*$/, '') + '.';
  }

  private countPatternFrequency(patterns: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const pattern of patterns) {
      counts[pattern] = (counts[pattern] || 0) + 1;
    }
    return counts;
  }

  private extractCommonTechStack(events: CapturedEvent[]): string[] {
    const stacks = new Set<string>();
    for (const e of events) {
      const text = e.title + ' ' + (e.summary || '');
      if (text.includes('salesforce')) stacks.add('Salesforce');
      if (text.includes('snowflake')) stacks.add('Snowflake');
      if (text.includes('dbt')) stacks.add('dbt');
      if (text.includes('airflow')) stacks.add('Airflow');
      if (text.includes('python')) stacks.add('Python');
    }
    return Array.from(stacks);
  }

  private extractTriggerConditions(events: CapturedEvent[]): string {
    const triggers: string[] = [];
    if (events.some(e => e.title.includes('late') || e.title.includes('sla'))) triggers.push('SLO breach detection');
    if (events.some(e => e.title.includes('staging'))) triggers.push('Need to scaffold Snowflake staging models');
    if (events.some(e => e.title.includes('fail'))) triggers.push('Pipeline failure remediation');
    return triggers.join(' OR ');
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[\s:&]+/g, '-').replace(/[()]/g, '').replace(/--/g, '-').replace(/^-/, '').replace(/-$/, '');
  }

  private titleCase(str: string): string {
    return str.replace(/^./, c => c.toUpperCase()).replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  private determineCategory(techStack: string[], title: string): string {
    if (techStack.includes('Snowflake') && (title.includes('streaming') || title.includes('pipeline'))) return '3. Orchestration & Pipelines';
    if (techStack.includes('Snowflake') && title.includes('staging')) return '2. Transformations & Modeling';
    if (techStack.includes('dbt') && title.includes('diagnose') || title.includes('late')) return '3. Orchestration & Pipelines';
    return '2. Transformations & Modeling';
  }

  private determineSubcategory(techStack: string[], title: string): string {
    if (techStack.includes('Salesforce') && title.includes('staging')) return 'dbt Staging & Intermediate Patterns';
    if (techStack.includes('Snowflake') && techStack.includes('Airflow')) return 'Airflow DAGs & Operators';
    if (techStack.includes('Snowflake') && title.includes('streaming')) return 'Snowpipe Streaming Real-time Ingestion';
    if (techStack.includes('Snowflake') && (title.includes('mask') || title.includes('policy'))) return 'Snowflake Objects, RBAC & Policies';
    return 'dbt Staging & Intermediate Patterns';
  }

  private extractArchetype(events: CapturedEvent[]): string {
    const archetypes: Set<string> = new Set();
    for (const e of events) {
      if (e.clientEngagement.includes('Client-A-Retail')) archetypes.add('B2B SaaS Salesforce ingestion');
      if (e.clientEngagement.includes('Client-B-Fintech')) archetypes.add('Financial transaction processing');
      if (e.clientEngagement.includes('Client-C-Healthcare')) archetypes.add('Healthcare HL7 integration');
    }
    return Array.from(archetypes)[0] || 'General Enterprise';
  }

  private inferAuthor(events: CapturedEvent[]): string {
    const engineers = events.map(e => e.engineerId);
    const counts: Record<string, number> = {};
    for (const id of engineers) counts[id] = (counts[id] || 0) + 1;
    const mostActive = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return mostActive;
  }

  private inferAuthorName(events: CapturedEvent[]): string {
    const names = [...new Set(events.map(e => e.engineerName))];
    return names[0] || 'Anblicks Data CoE';
  }

  private generateTestFixtures(events: CapturedEvent[]): {
    id: string; name: string; input: Record<string, any>; expectedOutput: Record<string, any>; isAdversarial?: boolean; adversarialType?: 'malformed_input' | 'missing_fields' | 'edge_values' | 'race_condition' | 'empty_dataset';
  }[] {
    return [
      {
        id: 'fixture-main',
        name: 'Primary scenario',
        input: {
          source_table: 'RAW.SALESFORCE.CONTACTS',
          target_schema: 'ANALYTICS_STAGING',
          target_model: 'stg_salesforce__contacts',
          author: 'Karthik'
        },
        expectedOutput: {
          model_created: true,
          column_mapping_valid: true,
          partition_correct: true
        }
      },
      {
        id: 'fixture-adversarial-1',
        name: 'Malformed primary key',
        input: {
          source_table: 'RAW.SALESFORCE.CONTACTS',
          target_schema: 'ANALYTICS_STAGING',
          primary_key: null
        },
        expectedOutput: {
          validation_error: 'Primary key cannot be null.'
        },
        isAdversarial: true,
        adversarialType: 'malformed_input'
      }
    ];
  }

  private generateSkillMarkdown(title: string, narrative: string, triggers: string, techStack: string[]): string {
    return `## ${title}

**Purpose:** ${narrative}

**Trigger Conditions:** ${triggers}

**Technology Stack:** ${techStack.join(', ')}

**Canonical Pattern:**
- Extract source system events
- Map to Snowflake staging model
- Apply incremental strategy

<!-- @dsCard group="${techStack[0] || 'Snowflake'}" -->
`;
  }
}
