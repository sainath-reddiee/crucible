/**
 * Seed data representing Crucible's canonical 200+ skills library and scenario test fixtures.
 */

import { Skill, CapturedEvent } from './types.js';
import { CRUCIBLE_TAXONOMY } from './taxonomy.js';

export const SEEDED_SKILLS: Skill[] = [
  {
    metadata: {
      id: 'skill-sf-stg-001',
      slug: 'salesforce-staging-model',
      name: 'Salesforce Staging Model with Late-Arriving & Archive Filtering',
      description: 'Generates standardized dbt staging model for Salesforce objects with UTC timezone normalization, late-arriving CDC delta logic, and archived record exclusion.',
      category: '2. Transformations & Modeling',
      subcategory: 'dbt Staging & Intermediate Patterns',
      techStack: ['Snowflake', 'dbt', 'Salesforce', 'SQL'],
      archetype: 'B2B SaaS Salesforce ingestion',
      tier: 2,
      maturity: 'published',
      author: {
        id: 'eng-karthik',
        name: 'Karthik',
        email: 'karthik@anblicks.com'
      },
      reviewers: [
        {
          id: 'eng-mishra',
          name: 'Mishra',
          role: 'Senior Architect',
          approvedAt: '2026-03-01T10:00:00Z'
        }
      ],
      successRate: 0.87,
      totalUses: 12,
      lastUsedAt: '2026-03-18T14:32:00Z',
      transferConfidenceScore: 87,
      blastRadius: 'staging_layer',
      sensitivity: 'generic_technical',
      rollbackPath: 'git checkout HEAD~1 -- models/staging/salesforce/',
      citations: [
        { sourceEventId: 'evt-pr-101', description: 'Client A: Initial Salesforce staging implementation' },
        { sourceEventId: 'evt-pr-102', description: 'Client B: Added timezone UTC casting macro' },
        { sourceEventId: 'evt-pr-103', description: 'Client C: Incremental surrogate key deduplication' }
      ],
      createdAt: '2026-03-01T08:00:00Z',
      updatedAt: '2026-03-15T09:12:00Z'
    },
    guardrails: [
      {
        rule: 'Filter out soft-deleted and archived records: WHERE is_deleted = false AND is_archived = false',
        enforcement: 'runtime_filter',
        originAgent: 'critic',
        reason: 'Critic discovered Sandbox and Bulk API test cases produce duplicate counts with archived items.'
      },
      {
        rule: 'Ensure all Salesforce DATETIME fields are converted with to_timestamp_ntz() to avoid silent UTC skew',
        enforcement: 'runtime_filter',
        originAgent: 'refiner',
        reason: 'Client B timezone discrepancy fix.'
      }
    ],
    knownLimitations: [
      'Does not automatically handle compound custom fields with nested JSON without a preceding flatten step.',
      'Salesforce BigObjects require async bulk extract query instead of direct Fivetran staging table.'
    ],
    testFixtures: [
      {
        id: 'fix-001',
        name: 'Standard Contact Table with Archived Rows',
        input: {
          source_table: 'raw_salesforce.contacts',
          target_schema: 'analytics_staging',
          fields: ['id', 'email', 'created_date', 'is_deleted', 'account_id']
        },
        expectedOutput: {
          dbt_sql_contains: ['is_deleted = false', 'to_timestamp_ntz', 'unique_key="id"']
        }
      }
    ],
    skillMarkdown: `# Salesforce Staging Model Generator
<!-- @dsCard group="Transformations" name="Salesforce Staging Model" -->
## Purpose
Scaffold a production-grade dbt staging model from raw Salesforce ingestion tables in Snowflake.

## Inputs
- \`source_table\`: Fully-qualified Snowflake table (e.g., \`RAW.SALESFORCE.CONTACT\`)
- \`target_model_name\`: e.g. \`stg_salesforce__contacts\`
- \`primary_key\`: e.g. \`id\`

## Generated dbt Pattern
\`\`\`sql
{{ config(
    materialized = 'incremental',
    unique_key = 'contact_id',
    cluster_by = ['created_at_utc::date']
) }}

WITH source AS (
    SELECT * FROM {{ source('salesforce', 'contact') }}
    WHERE is_deleted = FALSE
),
renamed AS (
    SELECT
        id AS contact_id,
        account_id,
        email,
        to_timestamp_ntz(created_date) AS created_at_utc,
        to_timestamp_ntz(system_modstamp) AS last_modified_at_utc
    FROM source
)
SELECT * FROM renamed
{% if is_incremental() %}
  WHERE last_modified_at_utc > (SELECT max(last_modified_at_utc) FROM {{ this }})
{% endif %}
\`\`\`
`
  },
  {
    metadata: {
      id: 'skill-dbt-diag-002',
      slug: 'diagnose-late-dbt-run',
      name: 'Diagnose Late or Stalled dbt Run SLA Incident',
      description: 'Rapid diagnostic workflow to trace Snowflake QUERY_HISTORY, Airflow tasks, and upstream ingestion pipelines when dbt SLAs are breached.',
      category: '3. Orchestration & Pipelines',
      subcategory: 'Airflow DAGs & Operators',
      techStack: ['Snowflake', 'dbt', 'Airflow', 'Fivetran'],
      archetype: 'General',
      tier: 1, // Read-only diagnostic
      maturity: 'published',
      author: {
        id: 'eng-karthik',
        name: 'Karthik',
        email: 'karthik@anblicks.com'
      },
      reviewers: [
        {
          id: 'eng-mishra',
          name: 'Mishra',
          role: 'Senior Architect',
          approvedAt: '2026-02-15T11:00:00Z'
        }
      ],
      successRate: 0.94,
      totalUses: 47,
      lastUsedAt: '2026-03-21T09:14:00Z',
      transferConfidenceScore: 95,
      blastRadius: 'read_only',
      sensitivity: 'generic_technical',
      citations: [
        { sourceEventId: 'evt-inc-001', description: 'Incident response playbook for fct_orders 4x volume spike' }
      ],
      createdAt: '2026-02-15T09:00:00Z',
      updatedAt: '2026-03-10T12:00:00Z'
    },
    guardrails: [
      {
        rule: 'Only execute read-only queries against SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY and INFORMATION_SCHEMA',
        enforcement: 'pre_condition',
        originAgent: 'governance',
        reason: 'Diagnostic skills must never modify production state.'
      }
    ],
    knownLimitations: [
      'Account Usage latency is up to 45 minutes; falls back to TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_WAREHOUSE) for live execution diagnosis.'
    ],
    testFixtures: [
      {
        id: 'fix-diag-001',
        name: 'Late dbt fct_orders Diagnosis',
        input: { model_name: 'fct_orders', max_lookback_hours: 6 },
        expectedOutput: { root_cause_identified: true }
      }
    ],
    skillMarkdown: `# Diagnose Late dbt Run SLA Incident
## Purpose
Identify the root cause of late dbt transformations in under 2 minutes.

## Automated Diagnostic Steps
1. Query Snowflake \`INFORMATION_SCHEMA.QUERY_HISTORY\` for \`fct_orders\` compile and run duration.
2. Check warehouse queueing vs execution time.
3. Check upstream raw table row insertion spike via \`COPY_HISTORY\` (e.g. Fivetran backfill).
4. Propose remediation: resize warehouse temporarily or isolate incremental partition.
`
  },
  {
    metadata: {
      id: 'skill-dbt-mart-003',
      slug: 'dbt-mart-bootstrap',
      name: 'dbt Mart Bootstrap with Surrogate Keys & Exposure Tests',
      description: 'Scaffolds clean dimensional mart tables (fct/dim) following Anblicks Spec-Driven architecture with YAML docs and custom data tests.',
      category: '2. Transformations & Modeling',
      subcategory: 'dbt Incremental Strategies & Marts',
      techStack: ['dbt', 'Snowflake', 'SQL'],
      archetype: 'Healthcare HL7 / HIPAA',
      tier: 2,
      maturity: 'published',
      author: {
        id: 'eng-tarun',
        name: 'Tarun',
        email: 'tarun@anblicks.com'
      },
      reviewers: [
        {
          id: 'eng-mishra',
          name: 'Mishra',
          role: 'Senior Architect',
          approvedAt: '2026-03-18T16:00:00Z'
        }
      ],
      successRate: 0.91,
      totalUses: 187,
      lastUsedAt: '2026-03-22T08:00:00Z',
      transferConfidenceScore: 90,
      blastRadius: 'staging_layer',
      sensitivity: 'generic_technical',
      citations: [
        { sourceEventId: 'evt-mart-001', description: 'Standard dimensional modeling boilerplate' }
      ],
      createdAt: '2026-03-05T09:00:00Z',
      updatedAt: '2026-03-18T16:00:00Z'
    },
    guardrails: [],
    knownLimitations: [],
    testFixtures: [],
    skillMarkdown: `# dbt Mart Bootstrap\nScaffolds dimensional models with standard surrogate key generation and generic tests.`
  },
  {
    metadata: {
      id: 'skill-streaming-004',
      slug: 'airflow-snowpipe-streaming-bootstrap',
      name: 'Airflow Snowpipe Streaming Dynamic Ingestion',
      description: 'Configures end-to-end Snowpipe Streaming with Snowflake Java SDK and Airflow event-driven sensors.',
      category: '3. Orchestration & Pipelines',
      subcategory: 'Streaming & Real-Time Patterns',
      techStack: ['Airflow', 'Snowpipe', 'Snowflake', 'Python'],
      archetype: 'Fintech Transaction Processing',
      tier: 3, // Requires approval to touch prod warehouse streams
      maturity: 'published',
      author: {
        id: 'eng-ramya',
        name: 'Ramya',
        email: 'ramya@anblicks.com'
      },
      reviewers: [
        {
          id: 'eng-mishra',
          name: 'Mishra',
          role: 'Senior Architect',
          approvedAt: '2026-01-20T14:00:00Z'
        }
      ],
      successRate: 0.82,
      totalUses: 19,
      lastUsedAt: '2026-01-25T11:00:00Z',
      transferConfidenceScore: 78,
      blastRadius: 'prod_warehouse',
      sensitivity: 'financial',
      citations: [],
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-01-20T14:00:00Z'
    },
    guardrails: [
      {
        rule: 'Require explicit schema evolution policy configuration before creating Snowflake streaming channel',
        enforcement: 'pre_condition',
        originAgent: 'governance',
        reason: 'Avoid unmapped column drop in production table.'
      }
    ],
    knownLimitations: [],
    testFixtures: [],
    skillMarkdown: `# Airflow Snowpipe Streaming Bootstrap\nDeploys high-throughput sub-second ingestion pipeline into Snowflake.`
  }
];

/**
 * Automatically expands the library to 200+ structured skills across the 5 categories
 */
export function generateFull200SkillsLibrary(): Skill[] {
  const library: Skill[] = [...SEEDED_SKILLS];
  let skillCount = library.length;

  for (const cat of CRUCIBLE_TAXONOMY) {
    for (const sub of cat.subcategories) {
      for (const sampleSlug of sub.sampleSkills) {
        if (!library.some(s => s.metadata.slug === sampleSlug)) {
          skillCount++;
          const tierVal: 1 | 2 | 3 = (skillCount % 3 + 1) as any;
          library.push({
            metadata: {
              id: `skill-gen-${skillCount.toString().padStart(3, '0')}`,
              slug: sampleSlug,
              name: sampleSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              description: `Institutional canonical pattern for ${sub.name}: ${sampleSlug}.`,
              category: cat.name,
              subcategory: sub.name,
              techStack: [cat.name.split(' ')[1] || 'Snowflake', 'SQL'],
              archetype: 'General Enterprise',
              tier: tierVal,
              maturity: 'published',
              author: {
                id: 'eng-anblicks-core',
                name: 'Anblicks Center of Excellence',
                email: 'coe@anblicks.com'
              },
              reviewers: [
                {
                  id: 'eng-mishra',
                  name: 'Mishra',
                  role: 'Senior Architect',
                  approvedAt: '2026-02-01T09:00:00Z'
                }
              ],
              successRate: 0.88 + (skillCount % 10) * 0.01,
              totalUses: 15 + (skillCount % 40) * 3,
              lastUsedAt: new Date(Date.now() - (skillCount % 15) * 86400000).toISOString(),
              transferConfidenceScore: 85 + (skillCount % 12),
              blastRadius: tierVal === 1 ? 'read_only' : tierVal === 2 ? 'staging_layer' : 'prod_warehouse',
              sensitivity: 'generic_technical',
              citations: [],
              createdAt: '2026-01-15T09:00:00Z',
              updatedAt: '2026-03-01T09:00:00Z'
            },
            guardrails: [],
            knownLimitations: [],
            testFixtures: [],
            skillMarkdown: `# ${sampleSlug}\n\nCanonical pattern for ${sub.name}.\n`
          });
        }
      }

      // Add synthetic leaf skills to reach 200+
      for (let i = 1; i <= 8; i++) {
        skillCount++;
        const slug = `${sub.id}-pattern-${i}`;
        library.push({
          metadata: {
            id: `skill-gen-${skillCount.toString().padStart(3, '0')}`,
            slug,
            name: `${sub.name} - Pattern #${i}`,
            description: `Validated implementation standard for ${sub.name} in enterprise engagements.`,
            category: cat.name,
            subcategory: sub.name,
            techStack: ['Snowflake', 'dbt', 'SQL'],
            archetype: 'General Enterprise',
            tier: (i % 2 === 0 ? 2 : 1) as any,
            maturity: 'published',
            author: {
              id: 'eng-anblicks-core',
              name: 'Anblicks Data CoE',
              email: 'coe@anblicks.com'
            },
            reviewers: [],
            successRate: 0.90 + (i * 0.01),
            totalUses: 10 + i * 5,
            transferConfidenceScore: 92,
            blastRadius: 'staging_layer',
            sensitivity: 'generic_technical',
            citations: [],
            createdAt: '2026-02-01T09:00:00Z',
            updatedAt: '2026-03-01T09:00:00Z'
          },
          guardrails: [],
          knownLimitations: [],
          testFixtures: [],
          skillMarkdown: `# ${sub.name} Pattern #${i}\n\nAutomated boilerplate and guardrails.`
        });
      }
    }
  }

  return library;
}

export const SAMPLE_CAPTURED_EVENTS: CapturedEvent[] = [
  {
    id: 'evt-pr-101',
    timestamp: '2026-03-02T14:20:00Z',
    engineerId: 'eng-karthik',
    engineerName: 'Karthik',
    clientEngagement: 'Client-A-Retail',
    eventType: 'git_pr',
    title: 'feat: add salesforce contact staging model with timezone normalization',
    details: {
      repo: 'anblicks-client-a/dbt-analytics',
      prNumber: 42,
      filesChanged: ['models/staging/salesforce/stg_salesforce__contact.sql']
    },
    rawSnippet: 'SELECT id, email, to_timestamp_ntz(created_date) as created_at_utc FROM {{ source("salesforce", "contact") }} WHERE is_deleted = false',
    summary: 'Created dbt staging model for Salesforce Contacts converting created_date to UTC timestamp and filtering deleted rows.',
    consented: true
  },
  {
    id: 'evt-pr-102',
    timestamp: '2026-03-09T16:10:00Z',
    engineerId: 'eng-karthik',
    engineerName: 'Karthik',
    clientEngagement: 'Client-B-Fintech',
    eventType: 'git_pr',
    title: 'feat(dbt): salesforce lead and contact staging with late arriving records handling',
    details: {
      repo: 'anblicks-client-b/bi-models',
      prNumber: 88,
      filesChanged: ['models/staging/salesforce/stg_salesforce__leads.sql']
    },
    rawSnippet: 'SELECT id, lead_email, to_timestamp_ntz(system_modstamp) as modified_at_utc FROM {{ source("salesforce", "lead") }} WHERE is_deleted = false',
    summary: 'Implemented Salesforce Lead staging model with system_modstamp tracking for late-arriving records.',
    consented: true
  },
  {
    id: 'evt-pr-103',
    timestamp: '2026-03-16T11:45:00Z',
    engineerId: 'eng-karthik',
    engineerName: 'Karthik',
    clientEngagement: 'Client-C-Healthcare',
    eventType: 'git_pr',
    title: 'feat: salesforce account and contact incremental staging',
    details: {
      repo: 'anblicks-client-c/dw-transform',
      prNumber: 15,
      filesChanged: ['models/staging/stg_sf_accounts.sql']
    },
    rawSnippet: 'SELECT id, name, to_timestamp_ntz(created_date) as created_at_utc FROM {{ source("salesforce", "account") }} WHERE is_deleted = false',
    summary: 'Built Salesforce staging model applying standard UTC timezone conversion and deleted flag exclusion.',
    consented: true
  }
];
