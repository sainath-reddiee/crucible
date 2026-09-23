/**
 * Crucible Agent Pipeline Orchestrator
 * Orchestrates the full six-agent pipeline: Detector -> Refiner -> Critic -> Anonymizer -> Governance
 */

import { globalSnowflakeDB, SkillSeed, Skill } from '@crucible/core';
import { DetectorAgent } from './agents/detector.js';
import { RefinerAgent } from './agents/refiner.js';
import { CriticAgent } from './agents/critic.js';
import { AnonymizerAgent } from './agents/anonymizer.js';
import { GovernanceAgent } from './agents/governance.js';
import { SuggesterAgent } from './agents/suggester.js';

export class CruciblePipelineOrchestrator {
  private detector: DetectorAgent;
  private refiner: RefinerAgent;
  private critic: CriticAgent;
  private anonymizer: AnonymizerAgent;
  private governance: GovernanceAgent;
  private suggester: SuggesterAgent;

  constructor() {
    this.detector = new DetectorAgent(globalSnowflakeDB);
    this.refiner = new RefinerAgent(globalSnowflakeDB);
    this.critic = new CriticAgent(globalSnowflakeDB);
    this.anonymizer = new AnonymizerAgent(globalSnowflakeDB);
    this.governance = new GovernanceAgent(globalSnowflakeDB);
    this.suggester = new SuggesterAgent(globalSnowflakeDB);
  }

  /**
   * Full nightly pipeline: Capture -> Detect -> Refine -> Critic -> Anonymize -> Governance
   */
  public async runNightlyPipeline(): Promise<Skill[]> {
    console.log('[CRUCIBLE] Starting nightly pipeline...');

    // Step 1: Detector finds candidate seeds
    console.log('[CRUCIBLE] Agent 1 (Detector) scanning event stream...');
    const seeds = await this.detector.runDetectionBatch();
    console.log(`[CRUCIBLE] Detector produced ${seeds.length} candidate seed(s).`);

    const publishedSkills: Skill[] = [];
    for (const seed of seeds) {
      // Step 2: Refiner writes the skill
      console.log(`[CRUCIBLE] Agent 2 (Refiner) writing skill for cluster '${seed.clusterTitle}'...`);
      const draftSkill = await this.refiner.refineSkillSeed(seed);

      // Step 3: Critic adversarial tests
      console.log(`[CRUCIBLE] Agent 3 (Critic) running adversarial tests on '${draftSkill.metadata.slug}'...`);
      const testedSkill = await this.critic.runAdversarialTests(draftSkill);

      // Step 4: Anonymizer scrubs client identifiers
      console.log(`[CRUCIBLE] Agent 4 (Anonymizer) scrubbing client identifiers...`);
      const { skill: anonymizedSkill, confidenceScore, clearanceLevel } = await this.anonymizer.anonymizeSkill(testedSkill);

      // Step 5: Governance classifies and routes
      console.log(`[CRUCIBLE] Agent 5 (Governance) classifying and routing...`);
      const classification = await this.governance.classifyAndRoute(anonymizedSkill, confidenceScore, clearanceLevel);

      // Auto-publish if auto-cleared and tier 1
      if (clearanceLevel === 'auto_cleared' && classification.tier === 1) {
        anonymizedSkill.metadata.maturity = 'published';
        await globalSnowflakeDB.upsertSkill(anonymizedSkill);
        publishedSkills.push(anonymizedSkill);
        console.log(`[CRUCIBLE] Skill '${anonymizedSkill.metadata.slug}' auto-published.`);
      } else {
        console.log(`[CRUCIBLE] Skill '${anonymizedSkill.metadata.slug}' routed to human reviewers.`);
      }
    }

    console.log(`[CRUCIBLE] Nightly pipeline complete. Published ${publishedSkills.length} skill(s).`);
    return publishedSkills;
  }
}

// CLI entry point
if (require.main === module) {
  const orchestrator = new CruciblePipelineOrchestrator();
  orchestrator.runNightlyPipeline()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[CRUCIBLE] Pipeline failed:', err);
      process.exit(1);
    });
}