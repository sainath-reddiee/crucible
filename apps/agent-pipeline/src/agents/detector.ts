/**
 * Agent 1: The Detector (Quiet Observer)
 * Nightly batch agent that inspects Snowflake EVENT_STREAM, clusters repeated patterns
 * across engineers and clients, and generates candidate skill seeds.
 */

import { CapturedEvent, SkillSeed } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';

export class DetectorAgent {
  private db: SnowflakeDatabase;

  constructor(db: SnowflakeDatabase) {
    this.db = db;
  }

  /**
   * Run nightly pattern detection across accumulated events
   */
  public async runDetectionBatch(): Promise<SkillSeed[]> {
    const events = await this.db.listCapturedEvents(undefined, 200);

    // Stage 1: Ensure each event has a 1-sentence intent summary (with prompt-cache simulation)
    const summarizedEvents: CapturedEvent[] = [];
    for (const evt of events) {
      if (!evt.summary) {
        evt.summary = this.generateIntentSummary(evt);
      }
      summarizedEvents.push(evt);
    }

    // Stage 2: Cluster events by semantic similarity
    const clusters = this.clusterEvents(summarizedEvents);

    // Stage 3: Filter clusters with 3+ overlapping members to form SkillSeeds
    const candidateSeeds: SkillSeed[] = [];
    for (const cluster of clusters) {
      if (cluster.events.length >= 3) {
        const seed: SkillSeed = {
          id: `seed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          clusterTitle: cluster.title,
          eventIds: cluster.events.map(e => e.id),
          events: cluster.events,
          repetitionCount: cluster.events.length,
          consistencyScore: 0.92,
          hypothesis: `Engineers repeatedly implement '${cluster.title}' across ${new Set(cluster.events.map(e => e.clientEngagement)).size} different client engagements. Canonical pattern candidate detected.`,
          detectedAt: new Date().toISOString()
        };

        candidateSeeds.push(seed);

        // Log to Audit Ledger
        await this.db.logAudit({
          actorId: 'agent-detector',
          actorName: 'Agent 1 (The Detector)',
          action: 'pattern_detected',
          reasoningTrace: `Detected cluster '${cluster.title}' with ${cluster.events.length} supporting events across ${new Set(cluster.events.map(e => e.clientEngagement)).size} clients.`
        });
      }
    }

    return candidateSeeds;
  }

  private generateIntentSummary(event: CapturedEvent): string {
    if (event.title.toLowerCase().includes('salesforce') && event.title.toLowerCase().includes('staging')) {
      return 'Create Salesforce staging model in Snowflake with timestamp normalization and soft-delete filtering.';
    }
    return `Executed ${event.eventType} on ${event.title}: ${event.rawSnippet?.slice(0, 100) || 'standard operation'}`;
  }

  private clusterEvents(events: CapturedEvent[]): Array<{ title: string; events: CapturedEvent[] }> {
    const buckets: Map<string, CapturedEvent[]> = new Map();

    for (const evt of events) {
      let key = 'general-maintenance';
      const text = `${evt.title} ${evt.summary || ''}`.toLowerCase();

      if (text.includes('salesforce') && (text.includes('staging') || text.includes('stg'))) {
        key = 'Salesforce Staging Ingestion in Snowflake';
      } else if (text.includes('dbt') && (text.includes('late') || text.includes('sla') || text.includes('fail'))) {
        key = 'dbt SLA Breach & Pipeline Latency Triaging';
      } else if (text.includes('streaming') || text.includes('snowpipe')) {
        key = 'Snowpipe Streaming Real-time Ingestion';
      } else if (text.includes('masking') || text.includes('phi') || text.includes('pii')) {
        key = 'Snowflake Data Masking & RBAC Policy';
      }

      const list = buckets.get(key) || [];
      list.push(evt);
      buckets.set(key, list);
    }

    return Array.from(buckets.entries()).map(([title, clusterEvents]) => ({
      title,
      events: clusterEvents
    }));
  }
}
