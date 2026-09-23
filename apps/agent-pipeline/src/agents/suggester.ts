/**
 * Agent 6: The Suggester (Real-time Colleague)
 * Watches engineer context in real time and surfaces relevant skills proactively.
 */

import { Skill, SkillSuggestion, UserContext } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';
import { ExplainableReasoningTreeNavigator } from '@crucible/core';

export class SuggesterAgent {
  private db: SnowflakeDatabase;
  private navigator: ExplainableReasoningTreeNavigator;
  private dismissedCache: Map<string, Set<string>> = new Map();
  private silencedSessions: Set<string> = new Set();
  private lastSuggestionTime: Map<string, number> = new Map();

  constructor(db: SnowflakeDatabase) {
    this.db = db;
    this.navigator = new ExplainableReasoningTreeNavigator(db);
  }

  /**
   * Real-time suggestion engine. Filters ~60-70% of triggers before API calls.
   */
  public async suggestForContext(context: UserContext): Promise<{ suggestions: SkillSuggestion[], traceLog: string[] }> {
    const engineerId = context.engineerId;

    // Pre-filter 1: Silenced sessions
    if (this.silencedSessions.has(engineerId)) {
      return { suggestions: [], traceLog: ['Session silenced'] };
    }

    // Pre-filter 2: Context changed substantively in the last hour?
    const now = Date.now();
    const lastTime = this.lastSuggestionTime.get(engineerId) || 0;
    const contextChanged = (now - lastTime) > 3600000; // 1 hour
    if (!contextChanged) {
      return { suggestions: [], traceLog: ['Context unchanged substantively in last hour'] };
    }

    // Pre-filter 3: Dismissed similar suggestions recently
    const dismissed = this.dismissedCache.get(engineerId) || new Set();
    if (dismissed.size > 0) {
      // If the current context matches a recently dismissed skill, skip
      const contextSig = this.hashContext(context);
      if (dismissed.has(contextSig)) {
        return { suggestions: [], traceLog: ['Similar context recently dismissed'] };
      }
    }

    // Navigation pipeline: Vector pre-filter -> Reasoning tree -> Top-3
    const { suggestions, traceLog } = await this.navigator.navigate(context);

    // Update tracking
    this.lastSuggestionTime.set(engineerId, now);

    return { suggestions, traceLog };
  }

  public dismissSuggestion(engineerId: string, skillId: string): void {
    const set = this.dismissedCache.get(engineerId) || new Set();
    set.add(skillId);
    this.dismissedCache.set(engineerId, set);
  }

  public silenceSession(engineerId: string): void {
    this.silencedSessions.add(engineerId);
  }

  public unsilenceSession(engineerId: string): void {
    this.silencedSessions.delete(engineerId);
  }

  private hashContext(context: UserContext): string {
    const sig = [
      context.currentBranch || '',
      (context.openFiles || []).slice(0, 3).join(','),
      context.activeTaskDescription || ''
    ].join('|');
    return sig;
  }
}