/**
 * Crucible 5-Tier Taxonomy & Canonical Skill Definitions
 */

export interface TaxonomyCategory {
  id: string;
  name: string;
  description: string;
  subcategories: TaxonomySubcategory[];
}

export interface TaxonomySubcategory {
  id: string;
  name: string;
  description: string;
  sampleSkills: string[];
}

export const CRUCIBLE_TAXONOMY: TaxonomyCategory[] = [
  {
    id: 'data-warehousing',
    name: '1. Data Warehousing & Modeling',
    description: 'Cloud data warehouse object management, RBAC, performance tuning, and semantic modeling.',
    subcategories: [
      {
        id: 'snowflake-objects-rbac',
        name: 'Snowflake Objects, RBAC & Policies',
        description: 'Warehouses, resource monitors, masking policies, tag-based masking, row access policies.',
        sampleSkills: [
          'snowflake-dynamic-data-masking',
          'snowflake-warehouse-cost-optimizer',
          'snowflake-network-policy-setup',
          'snowflake-rbac-matrix-scaffold'
        ]
      },
      {
        id: 'snowflake-cortex-ai',
        name: 'Snowflake Cortex & Semantic Search',
        description: 'Cortex Analyst, Cortex Search, LLM functions, semantic views and vector indexing.',
        sampleSkills: [
          'snowflake-cortex-search-indexer',
          'snowflake-semantic-view-generator',
          'snowflake-cortex-analyst-setup'
        ]
      },
      {
        id: 'databricks-unity',
        name: 'Databricks Unity Catalog & Delta',
        description: 'Unity Catalog schemas, Delta Lake Liquid Clustering, volume management.',
        sampleSkills: [
          'databricks-liquid-clustering-tuning',
          'databricks-unity-catalog-governance'
        ]
      },
      {
        id: 'multi-cloud-dw',
        name: 'BigQuery / Redshift / Synapse',
        description: 'Cross-cloud migration, partitioning, clustering and dialect bridges.',
        sampleSkills: [
          'bigquery-partition-expiry-policy',
          'redshift-distribution-key-optimizer'
        ]
      }
    ]
  },
  {
    id: 'transformations-modeling',
    name: '2. Transformations & Modeling',
    description: 'dbt modeling, incremental strategies, SQL pattern optimizations, and PySpark transformations.',
    subcategories: [
      {
        id: 'dbt-staging-intermediate',
        name: 'dbt Staging & Intermediate Patterns',
        description: 'Source staging, CTE cleanup, field deduplication, column casting & naming standards.',
        sampleSkills: [
          'salesforce-staging-model',
          'hubspot-staging-model',
          'stripe-subscription-staging',
          'dbt-intermediate-dedup-pattern'
        ]
      },
      {
        id: 'dbt-incremental-marts',
        name: 'dbt Incremental Strategies & Marts',
        description: 'Merge vs delete+insert, late-arriving dimensions, surrogate keys, snowflake-specific optimizations.',
        sampleSkills: [
          'dbt-incremental-bootstrap',
          'dbt-mart-bootstrap',
          'dbt-late-arriving-fact-handler',
          'dbt-scd-type-2-snapshot'
        ]
      },
      {
        id: 'sql-patterns-tuning',
        name: 'SQL Patterns & Dialect Optimization',
        description: 'Gaps-and-islands, sessionization, recursive CTEs, window functions, Snowflake cluster pruning.',
        sampleSkills: [
          'sql-sessionization-window-pattern',
          'sql-gaps-and-islands-clustering',
          'sql-snowflake-pruning-optimizer'
        ]
      },
      {
        id: 'python-pyspark-transforms',
        name: 'Python & PySpark Modeling',
        description: 'Vectorized UDFs, Snowpark DataFrames, PySpark structured transformations.',
        sampleSkills: [
          'snowpark-python-dataframe-pipeline',
          'pyspark-window-aggregation-pack'
        ]
      }
    ]
  },
  {
    id: 'orchestration-pipelines',
    name: '3. Orchestration & Pipelines',
    description: 'Airflow DAG generation, Snowflake Tasks/Streams, Dagster, and real-time streaming.',
    subcategories: [
      {
        id: 'airflow-orchestration',
        name: 'Airflow DAGs & Operators',
        description: 'Dynamic DAG generators, sensors, dbt-airflow operators, SLA callbacks, Airflow 2 to 3 migration.',
        sampleSkills: [
          'diagnose-late-dbt-run',
          'airflow-dynamic-task-mapping',
          'airflow-snowflake-operator-sla',
          'airflow-v2-to-v3-migration-guide'
        ]
      },
      {
        id: 'snowflake-tasks-streams',
        name: 'Snowflake Native Tasks & Streams',
        description: 'Serverless tasks, change data capture streams, task dependency graphs, error notifications.',
        sampleSkills: [
          'snowflake-cdc-stream-task-pipeline',
          'snowflake-serverless-task-graph'
        ]
      },
      {
        id: 'streaming-event-pipelines',
        name: 'Streaming & Real-Time Patterns',
        description: 'Snowpipe Streaming, Kafka Connect, Kinesis consumers, Apache Iceberg ingestion.',
        sampleSkills: [
          'airflow-snowpipe-streaming-bootstrap',
          'kafka-to-snowflake-streaming-ingest',
          'iceberg-snowflake-external-table'
        ]
      }
    ]
  },
  {
    id: 'quality-observability',
    name: '4. Quality, Observability & Governance',
    description: 'Soda Core, Great Expectations, automated dbt tests, lineage freshness, compliance evidence.',
    subcategories: [
      {
        id: 'data-quality-frameworks',
        name: 'Soda Core & Great Expectations',
        description: 'Automated data profiling, freshness scans, anomaly detection thresholds, test suites.',
        sampleSkills: [
          'soda-core-snowflake-profiling',
          'great-expectations-schema-contract',
          'dbt-custom-generic-test-suite'
        ]
      },
      {
        id: 'lineage-observability',
        name: 'Lineage & Incident Diagnosis',
        description: 'Upstream root-cause tracing, SLA breach remediation, query history auditing.',
        sampleSkills: [
          'snowflake-query-history-cost-spike-analyzer',
          'dbt-lineage-column-dependency-audit',
          'pipeline-sla-breach-auto-triager'
        ]
      },
      {
        id: 'compliance-audit',
        name: 'Compliance & Audit Evidence',
        description: 'SOC 2, HIPAA, GDPR access logs, encryption validation, audit report generation.',
        sampleSkills: [
          'snowflake-soc2-access-evidence-generator',
          'hipaa-phi-column-masking-validator'
        ]
      }
    ]
  },
  {
    id: 'integration-sources',
    name: '5. Integration & Sources',
    description: 'SaaS APIs, RDBMS connectors, Cloud Storage, webhooks, rate limiting and schema evolution.',
    subcategories: [
      {
        id: 'saas-source-connectors',
        name: 'SaaS Ingestion Patterns',
        description: 'Salesforce Bulk API 2.0, HubSpot, Stripe, Workday, NetSuite incremental syncs.',
        sampleSkills: [
          'salesforce-bulk-api-cdc-loader',
          'stripe-events-webhook-idempotent-sink',
          'workday-raas-extract-processor'
        ]
      },
      {
        id: 'database-cdc-sources',
        name: 'Database & File Sources',
        description: 'Postgres logical replication, MySQL binlog, S3 / Azure Blob / GCS event notifications.',
        sampleSkills: [
          'postgres-debezium-snowflake-cdc',
          's3-snowpipe-auto-ingest-setup',
          'azure-blob-eventgrid-snowflake-pipe'
        ]
      }
    ]
  }
];
