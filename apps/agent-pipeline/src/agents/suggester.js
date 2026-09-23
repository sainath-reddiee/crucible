"use strict";
/**
 * Agent 6: The Suggester (Real-time Colleague)
 * Watches engineer context in real time and surfaces relevant skills proactively.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggesterAgent = void 0;
const core_1 = require("@crucible/core");
class SuggesterAgent {
    db;
    navigator;
    dismissedCache = new Map();
    silencedSessions = new Set();
    lastSuggestionTime = new Map();
    constructor(db) {
        this.db = db;
        this.navigator = new core_1.ExplainableReasoningTreeNavigator(db);
    }
    /**
     * Real-time suggestion engine. Filters ~60-70% of triggers before API calls.
     */
    async suggestForContext(context) {
        const engineerId = context.engineerId;
        // Pre-filter 1: Silenced sessions
        if (this.silencedSessions.has(engineerId)) {
            return [];
        }
        // Pre-filter 2: Context changed substantively in the last hour?
        const now = Date.now();
        const lastTime = this.lastSuggestionTime.get(engineerId) || 0;
        const contextChanged = (now - lastTime) > 3600000; // 1 hour
        if (!contextChanged) {
            return [];
        }
        // Pre-filter 3: Dismissed similar suggestions recently
        const dismissed = this.dismissedCache.get(engineerId) || new Set();
        if (dismissed.size > 0) {
            // If the current context matches a recently dismissed skill, skip
            const contextSig = this.hashContext(context);
            if (dismissed.has(contextSig)) {
                return [];
            }
        }
        // Navigation pipeline: Vector pre-filter -> Reasoning tree -> Top-3
        const { suggestions, traceLog } = await this.navigator.navigate(context);
        // Update tracking
        this.lastSuggestionTime.set(engineerId, now);
        return suggestions;
    }
    dismissSuggestion(engineerId, skillId) {
        const set = this.dismissedCache.get(engineerId) || new Set();
        set.add(skillId);
        this.dismissedCache.set(engineerId, set);
    }
    silenceSession(engineerId) {
        this.silencedSessions.add(engineerId);
    }
    unsilenceSession(engineerId) {
        this.silencedSessions.delete(engineerId);
    }
    hashContext(context) {
        const sig = [
            context.currentBranch || '',
            (context.openFiles || []).slice(0, 3).join(','),
            context.activeTaskDescription || ''
        ].join('|');
        return sig;
    }
}
exports.SuggesterAgent = SuggesterAgent;
