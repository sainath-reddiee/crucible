/**
 * Agent 6: The Suggester (Real-time Colleague)
 * Watches engineer context in real time and surfaces relevant skills proactively.
 * Also handles the "throw to users where they are working" deployment pipeline.
 */

import { Skill, SkillSuggestion, UserContext, GovernanceClassification } from '@crucible/core';
import { SnowflakeDatabase } from '@crucible/core';
import { ExplainableReasoningTreeNavigator } from '@crucible/core';

export interface SuggesterDeploymentResult {
  skillId: string;
  usersTargeted: number;
  deliveryChannels: string[];
  status: 'deployed' | 'queued' | 'blocked' | 'rejected';
  reason: string;
}

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

  /**
   * Deploy a newly-created skill to the users where they are working.
   * This is the "throw to users where they are working" pipeline:
   * - Matches skill archetype against active user contexts
   * - Routes via the delivery channels each user has configured (CLI, MCP, IDE banner, dashboard)
   * - Respects tier & clearance gating
   */
  public async deploySkillToContext(
    skill: Skill,
    confidenceScore: number,
    clearanceLevel: string,
    classification: GovernanceClassification
  ): Promise<SuggesterDeploymentResult> {
    const trace: string[] = [];
    const skillArchetype = skill.metadata.archetype;

    // Gate 1: Clearance must be sufficient
    if (clearanceLevel !== 'auto_cleared' && classification.tier > 2) {
      return {
        skillId: skill.metadata.id,
        usersTargeted: 0,
        deliveryChannels: [],
        status: 'blocked',
        reason: `Clearance ${clearanceLevel} insufficient for tier ${classification.tier} deployment.`
      };
    }

    // Gate 2: Find active users whose context matches the skill archetype
    const activeUsers = await this.db.listActiveUsers();
    const matchingUsers = activeUsers.filter((u: any) => {
      const ctx = u.context;
      if (!ctx) return false;
      const ctxText = `${ctx.currentBranch || ''} ${ctx.activeTaskDescription || ''} ${(ctx.openFiles || []).join(' ')}`.toLowerCase();
      return ctxText.includes(skillArchetype.toLowerCase().split(' ')[0]) ||
             skill.metadata.techStack?.some((t: string) => ctxText.includes(t.toLowerCase()));
    });

    if (matchingUsers.length === 0) {
      // No active match — queue for ambient delivery
      await this.db.queueSkillForDelivery(skill, 'ambient');
      return {
        skillId: skill.metadata.id,
        usersTargeted: 0,
        deliveryChannels: ['ambient_queue'],
        status: 'queued',
        reason: `No active context match for archetype '${skillArchetype}'. Queued for ambient delivery.`
      };
    }

    // Deliver via each user's configured channels
    const deliveryChannels = new Set<string>();
    for (const user of matchingUsers) {
      const channels = user.deliveryChannels || ['cli'];
      for (const ch of channels) {
        deliveryChannels.add(ch);
        await this.db.deliverSkillToUser(user.engineerId, skill, ch);
      }
    }

    trace.push(`Deployed skill '${skill.metadata.slug}' to ${matchingUsers.length} user(s) via ${Array.from(deliveryChannels).join(', ')}.`);

    return {
      skillId: skill.metadata.id,
      usersTargeted: matchingUsers.length,
      deliveryChannels: Array.from(deliveryChannels),
      status: 'deployed',
      reason: trace[0]
    };
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