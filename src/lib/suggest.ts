import { SKILLS, type Skill, type WorkContext } from "./data";

export type Suggestion = {
  skill: Skill;
  score: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  branch: string;
  matched: string[];
};

const TECH = [
  "salesforce",
  "snowflake",
  "dbt",
  "airflow",
  "kafka",
  "snowpipe",
  "fivetran",
  "healthcare",
];

const INTENT = [
  "staging",
  "incident",
  "late",
  "sla",
  "incremental",
  "onboard",
  "stream",
  "mart",
  "model",
  "contacts",
];

function tokens(ctx: WorkContext) {
  const raw = [
    ctx.task,
    ctx.branch,
    ctx.trigger,
    ...ctx.files,
    ...ctx.commands,
  ]
    .join(" ")
    .toLowerCase();
  return {
    raw,
    tech: TECH.filter((t) => raw.includes(t)),
    intent: INTENT.filter((i) => raw.includes(i)),
  };
}

export function suggestForContext(ctx: WorkContext): {
  suggestions: Suggestion[];
  trace: string[];
} {
  const signals = tokens(ctx);
  const trace = [
    `[1. Intake] branch="${ctx.branch}", files=[${ctx.files.join(", ")}]`,
    `[2. Signals] tech=[${signals.tech.join(", ")}] intent=[${signals.intent.join(", ")}]`,
    `[3. Pre-filter] local keyword + taxonomy score (demo: no Claude call)`,
  ];

  const scored: Suggestion[] = SKILLS.map((skill) => {
    const title = `${skill.slug.replace(/-/g, " ")} ${skill.name}`.toLowerCase();
    const stack = skill.techStack.join(" ").toLowerCase();
    let score = 0.2;
    const reasons: string[] = [];
    const matched: string[] = [];

    for (const t of signals.tech) {
      if (stack.includes(t) || title.includes(t)) {
        score += 0.2;
        matched.push(t);
      }
    }
    for (const i of signals.intent) {
      if (title.includes(i)) {
        score += 0.16;
        matched.push(i);
      }
    }
    // Penalize skills whose primary stack token is absent from the live context
    const primary = skill.techStack[0]?.toLowerCase();
    if (primary && !signals.tech.includes(primary) && !signals.raw.includes(primary)) {
      score -= 0.28;
    }
    if (signals.raw.includes(skill.slug.replace(/-/g, " "))) {
      score += 0.22;
      reasons.push("exact task pattern match");
    }
    if (skill.successRate > 0.85) {
      score += 0.06;
      reasons.push(`${Math.round(skill.successRate * 100)}% success across ${skill.uses} uses`);
    }
    if (matched.length) {
      reasons.unshift(`matches ${matched.slice(0, 4).join(", ")}`);
    }

    const capped = Math.min(0.99, score);
    return {
      skill,
      score: Number(capped.toFixed(2)),
      confidence: capped > 0.8 ? "high" : capped > 0.6 ? "medium" : "low",
      reason: reasons.join(" · ") || "taxonomy neighbor",
      branch: `${skill.category} / ${skill.subcategory}`,
      matched,
    };
  })
    .filter((s) => s.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored[0]) {
    trace.push(
      `[4. Tree] routed to "${scored[0].branch}" · top skill ${scored[0].skill.slug} @ ${scored[0].score}`
    );
  } else {
    trace.push("[4. Tree] no candidate above confidence threshold — silence preferred");
  }

  return { suggestions: scored, trace };
}
