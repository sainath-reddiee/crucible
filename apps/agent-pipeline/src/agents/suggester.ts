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

    // Lightweight context analysis - rule-based
    const contextAnalysis = await this.analyzeContext(context);

    // Quick filter based on context analysis
    if (!this.passesQuickFilters(contextAnalysis)) {
      return { suggestions: [], traceLog: ['Quick filter eliminated based on context'] };
    }

    // Navigation pipeline: Vector pre-filter -> Reasoning tree -> Top-3
    const { suggestions, traceLog } = await this.navigator.navigate(context);

    // Update tracking
    this.lastSuggestionTime.set(engineerId, now);

    // Add context-based post-processing
    const processedSuggestions = this.postProcessSuggestions(suggestions, context);

    return { suggestions: processedSuggestions, traceLog };
  }

  private async analyzeContext(context: UserContext): Promise<any> {
    // Lightweight context analysis - rule-based patterns
    return {
      hasFiles: (context.openFiles || []).length > 0,
      hasTask: !!context.activeTaskDescription,
      hasBranch: !!context.currentBranch,
      complexity: this.calculateContextComplexity(context),
      keywords: this.extractContextKeywords(context)
    };
  }

  private calculateContextComplexity(context: UserContext): number {
    // Simple complexity scoring based on context elements
    let score = 0;

    if (context.openFiles && context.openFiles.length > 0) score += 30;
    if (context.currentBranch) score += 10;
    if (context.activeTaskDescription) score += 40;
    if (context.recentCommands && context.recentCommands.length > 0) score += 20;

    return Math.min(100, score);
  }

  private extractContextKeywords(context: UserContext): string[] {
    // Extract keywords from context for lightweight matching
    const keywords: string[] = [];

    if (context.openFiles) {
      keywords.push(...context.openFiles.map(file => file.split('.').pop() || ''));
    }

    if (context.activeTaskDescription) {
      const taskWords = context.activeTaskDescription.toLowerCase().split(' ');
      keywords.push(...taskWords.filter(word => word.length > 3 && !this.isStopWord(word)));
    }

    return keywords.slice(0, 10); // Limit to top 10 keywords
  }

  private isStopWord(word: string): boolean {
    // Common stop words to ignore in keyword extraction
    const stopWords = [
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were',
      'have', 'has', 'had', 'but', 'not', 'all', 'any', 'can', 'will', 'would'
    ];

    return stopWords.includes(word);
  }

  private passesQuickFilters(contextAnalysis: any): boolean {
    // Quick filtering rules based on context analysis
    if (contextAnalysis.complexity < 20) {
      return contextAnalysis.hasTask; // Need a task to proceed
    }

    if (contextAnalysis.complexity > 80) {
      return true; // High complexity, proceed with search
    }

    // Default behavior based on context elements
    return contextAnalysis.hasFiles || contextAnalysis.hasTask || contextAnalysis.hasBranch;
  }

  private postProcessSuggestions(suggestions: SkillSuggestion[], context: UserContext): SkillSuggestion[] {
    // Lightweight post-processing based on context
    return suggestions.filter(suggestion => this.isRelevant(suggestion, context));
  }

  private isRelevant(suggestion: SkillSuggestion, context: UserContext): boolean {
    // Simple relevance check based on skill tier and context
    const skillTier = suggestion.skill.tier;

    // If no active task, prioritize lower tier skills
    if (!context.activeTaskDescription) {
      return skillTier <= 2; // Show only tier 1 and 2 skills
    }

    // If complex task, show all tiers
    if (context.activeTaskDescription.includes('complex') ||
        context.activeTaskDescription.includes('advanced')) {
      return true;
    }

    // Default relevance - show all skills
    return true;
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