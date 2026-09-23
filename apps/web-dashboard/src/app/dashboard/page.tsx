"use client";

import React, { useState } from 'react';

// Core Executive & Operational Telemetry
const METRICS = {
  totalPublishedSkills: 247,
  hoursSavedQuarter: 4847,
  dollarValueSaved: 612000,
  crossEngagementReuseCount: 23,
  acceptanceRatePercentage: 71,
  activeEngineersCount: 47,
  totalEngineersCount: 52,
  juniorRampDays: 7.2,
  previousRampDays: 28,
  skillExecutionsQuarter: 1840,
  tier3ExecutionsReviewedPercentage: 100,
  unauthorizedActionsDetected: 0,
};

// 7-Stage Crucible Skill Lifecycle from the core engine
const LIFECYCLE_STAGES = [
  {
    step: '01',
    id: 'detector',
    name: 'Nightly Detector',
    badge: 'Snowflake Stream',
    summary: 'Mines past 30 days of PRs, queries & logs. Clusters repeated engineering patterns with semantic similarity.',
    details: 'Triggered across 3 clients · 3 candidate events identified · Semantic cluster threshold > 0.82',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
      </svg>
    ),
    activeColor: '#38bdf8'
  },
  {
    step: '02',
    id: 'refiner',
    name: 'SKILL.md Refiner',
    badge: 'Anthropic Spec',
    summary: 'Auto-synthesizes trigger conditions, exact tool sequence, success metrics, and guardrail constraints.',
    details: 'Generates clean markdown + YAML frontmatter with full source citations from original engineer workflows.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    activeColor: '#818cf8'
  },
  {
    step: '03',
    id: 'critic',
    name: 'Adversarial Critic',
    badge: 'Code Sandbox',
    summary: 'Generates edge cases & stress-tests execution against malicious inputs, schema drifts, and null states.',
    details: '8 adversarial variants tested · 85% pass rate · 2 automated guardrails dynamically injected.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    activeColor: '#f43f5e'
  },
  {
    step: '04',
    id: 'anonymizer',
    name: 'Sanitizer & Redactor',
    badge: 'Zero-Leakage',
    summary: 'Redacts client names, internal schemas, and proprietary tokens while preserving transferable technical logic.',
    details: 'Transfer Confidence: 87/100 · Auto-cleared for cross-client propagation with complete audit trail.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    activeColor: '#fbbf24'
  },
  {
    step: '05',
    id: 'governance',
    name: 'Governance & Tiering',
    badge: 'Tier 2 Policy',
    summary: 'Calculates blast radius and blast tier. Routes proposal directly to the original author for 1-click verification.',
    details: 'Blast Radius: staging_layer · Sensitivity: generic_technical · Reviewer: Karthik (Author)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    activeColor: '#a855f7'
  },
  {
    step: '06',
    id: 'approval',
    name: 'Curator Approval',
    badge: 'Human-in-the-Loop',
    summary: 'Side-by-side diff review of source work vs. sanitized skill template before committing to institutional index.',
    details: 'Curator approved 2m ago · SHA: c8f01b9 · Indexed to MCP vector storage & CLI catalog.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    activeColor: '#10b981'
  },
  {
    step: '07',
    id: 'reuse',
    name: 'Contextual Reuse',
    badge: 'CLI & MCP Live',
    summary: 'Auto-suggests relevant skill right when an engineer runs git checkout or asks Claude in their IDE.',
    details: 'Reduces 15-min repetitive setups to 20 seconds. 23 cross-client deployments this quarter.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
    activeColor: '#06b6d4'
  }
];

// Production Skills Catalog Mock Data
const SKILLS_CATALOG = [
  {
    slug: 'salesforce-staging-model',
    name: 'Salesforce Staging Model Scaffolder',
    tier: 'Tier 2 (Propose + Review)',
    clientCoverage: '8 Client Accounts',
    uses: 121,
    savedHours: 360,
    dollarValue: 48000,
    author: 'Karthik P.',
    verified: true,
    passRate: '85%',
    tags: ['dbt', 'Salesforce', 'Staging', 'Snowflake'],
    description: 'Scaffolds clean dbt staging models with UTC timezone normalization, late-arriving CDC joins, and soft-delete filtering.'
  },
  {
    slug: 'diagnose-late-dbt-run',
    name: 'dbt Run Latency Diagnostics & Profiler',
    tier: 'Tier 1 (Automated Read)',
    clientCoverage: '14 Client Accounts',
    uses: 312,
    savedHours: 780,
    dollarValue: 94000,
    author: 'Elena R.',
    verified: true,
    passRate: '98%',
    tags: ['dbt-core', 'Snowflake Warehouses', 'Performance'],
    description: 'Inspects query run histories and spilling disks in Snowflake to pinpoint bottleneck models in nightly batch DAGs.'
  },
  {
    slug: 'dbt-incremental-bootstrap',
    name: 'dbt Incremental Pattern Generator',
    tier: 'Tier 2 (Propose + Review)',
    clientCoverage: '6 Client Accounts',
    uses: 187,
    savedHours: 440,
    dollarValue: 54000,
    author: 'Marcus W.',
    verified: true,
    passRate: '92%',
    tags: ['Incremental', 'BigQuery', 'Snowflake'],
    description: 'Generates fault-tolerant merge keys, lookback window filters, and unique key clustering specs for warehouse models.'
  },
  {
    slug: 'airflow-snowpipe-streaming-bootstrap',
    name: 'Snowpipe Streaming Connector Setup',
    tier: 'Tier 3 (Supervised Execute)',
    clientCoverage: '3 Client Accounts',
    uses: 42,
    savedHours: 190,
    dollarValue: 24000,
    author: 'Ramya S.',
    verified: true,
    passRate: '89%',
    tags: ['Kafka', 'Snowpipe', 'Airflow', 'Streaming'],
    description: 'Scaffolds end-to-end Snowpipe streaming channels with channel offset checkpointing and automated Dead-Letter Queue handlers.'
  }
];

const MCP_CLIENTS = [
  { id: 'claude', name: 'Claude Desktop / Code', command: 'claude mcp add crucible http://localhost:3000/api/mcp', icon: 'Claude' },
  { id: 'cursor', name: 'Cursor IDE', command: 'Add to .cursor/mcp.json -> "crucible": { "url": "http://localhost:3000/api/mcp" }', icon: 'Cursor' },
  { id: 'vscode', name: 'VS Code (Roo/Cline)', command: 'mcpServers: { "crucible": { "transport": "sse", "url": "http://localhost:3000/api/mcp" } }', icon: 'VSCode' },
  { id: 'windsurf', name: 'Windsurf / Codeium', command: 'Configure MCP -> Server: crucible, Type: SSE, URL: http://localhost:3000/api/mcp', icon: 'Windsurf' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'curator' | 'mcp'>('overview');
  const [selectedStage, setSelectedStage] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState<string>('claude');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedSkills, setApprovedSkills] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleApprove = (slug: string) => {
    setApprovedSkills(prev => ({ ...prev, [slug]: true }));
  };

  const filteredSkills = SKILLS_CATALOG.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f8fafc', paddingBottom: '5rem' }}>
      
      {/* 1. TOP NOTICE STRIP */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.12) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0.45rem 1.5rem',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        color: '#94a3b8'
      }}>
        <span style={{ 
          background: 'rgba(16,185,129,0.2)', 
          color: '#10b981', 
          fontWeight: 600, 
          padding: '0.15rem 0.5rem', 
          borderRadius: '4px',
          fontSize: '0.7rem',
          letterSpacing: '0.05em'
        }}>
          MCP v1.30 READY
        </span>
        <span>Crucible Agentic Skill Pipeline is connected to Snowflake Event Stream. 247 skills indexed.</span>
        <a href="#mcp-section" onClick={() => setActiveTab('mcp')} style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          Connect MCP <span>&rarr;</span>
        </a>
      </div>

      {/* 2. STICKY SAAS NAVIGATION BAR (Tapetide Style) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => setActiveTab('overview')}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8"/><path d="m4.93 10.93 4.24 4.24"/><path d="M2 18h8"/><path d="M20 18h2"/><path d="m19.07 10.93-4.24 4.24"/><path d="M22 2l-7 7"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#fff' }}>CRUCIBLE</span>
                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>ENTERPRISE</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[
              { id: 'overview', label: 'Executive Overview', icon: '📊' },
              { id: 'catalog', label: 'Skills Catalog', count: SKILLS_CATALOG.length, icon: '⚡' },
              { id: 'curator', label: 'Curator Queue', count: 3, alert: true, icon: '🛡️' },
              { id: 'mcp', label: 'MCP Server', icon: '🔌' },
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#fff' : '#94a3b8',
                    backgroundColor: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: active ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      backgroundColor: tab.alert ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: tab.alert ? '#f43f5e' : '#cbd5e1',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Header Action / Quick Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.8rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#64748b'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Find skill, author, or table..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
            <kbd style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: '#94a3b8' }}>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} className="live-pulse" />
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>DAEMON LIVE</span>
          </div>
        </div>
      </header>

      {/* HERO SECTION / ONE-CONNECTION ENDPOINT STRIP (Tapetide MCP Signature Pattern) */}
      <section style={{
        padding: '3rem 2rem 2rem 2rem',
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                fontWeight: 700,
                color: '#10b981',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                AGENTIC SKILL FACTORY FOR CONSULTING FIRMS
              </span>
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '0.85rem'
            }}>
              Where engineering work becomes <br/>
              <span style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                executable institutional knowledge.
              </span>
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Crucible captures implicit dbt, Snowflake, and API patterns directly from git commits and queries, 
              tests them adversarially, sanitizes client data, and serves them to Claude and Cursor over standard MCP.
            </p>
          </div>

          {/* Quick Stats Pill Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.07)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>SAVED (Q2)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                ${(METRICS.dollarValueSaved / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.15rem' }}>+18% from last month</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>DEV HOURS SAVED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {METRICS.hoursSavedQuarter.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '0.15rem' }}>47 engineers active</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>JUNIOR RAMP</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                {METRICS.juniorRampDays}d
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>down from 28.0 days</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>ACTIVE SKILLS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                {METRICS.totalPublishedSkills}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a855f7', marginTop: '0.15rem' }}>89% Tier-1 Trust</div>
            </div>
          </div>
        </div>

        {/* ONE CONNECTION ENDPOINT STRIP (Directly modeled on Tapetide MCP) */}
        <div style={{
          backgroundColor: '#111115',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#10b981'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              ONE CONNECTION
            </span>
            <code style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              http://localhost:3000/api/mcp
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => copyToClipboard('http://localhost:3000/api/mcp', 'endpoint')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#f8fafc',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              {copiedText === 'endpoint' ? 'Copied!' : 'Copy MCP URL'}
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              style={{
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#09090b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Setup Clients &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 7-STEP SKILL LIFECYCLE PIPELINE (VISUALIZER) */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 2rem 2.5rem 2rem' }}>
        <div style={{
          backgroundColor: '#111115',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                THE AUTONOMOUS SKILL FACTORY LOOP
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                7-Step Lifecycle: Implicit Code to Instant Reuse
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Click any stage to inspect agent behavior & telemetry
            </div>
          </div>

          {/* Stepper Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isSelected = selectedStage === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(idx)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? `1px solid ${stage.activeColor}` : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '0.85rem 0.6rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isSelected ? stage.activeColor : '#64748b' }}>
                      {stage.step}
                    </span>
                    <span style={{ color: isSelected ? stage.activeColor : '#64748b' }}>
                      {stage.icon}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#fff' : '#94a3b8', lineHeight: 1.25 }}>
                    {stage.name}
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '20%',
                      right: '20%',
                      height: '2px',
                      backgroundColor: stage.activeColor,
                      borderRadius: '999px'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Stage Detail Inspector */}
          {(() => {
            const active = LIFECYCLE_STAGES[selectedStage];
            return (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${active.activeColor}40`,
                    color: active.activeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {active.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Stage {active.step}: {active.name}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: `${active.activeColor}20`,
                        color: active.activeColor,
                        fontWeight: 600
                      }}>
                        {active.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {active.summary}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  color: '#64748b',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  maxWidth: '380px'
                }}>
                  <strong style={{ color: '#cbd5e1' }}>Live Telemetry:</strong> {active.details}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 4. MAIN VIEW TABS CONTENT */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 2rem' }}>
        
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem'
            }}>
              {/* Card 1: Snowflake Library Health */}
              <div style={{
                backgroundColor: '#121215',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>SKILL LIBRARY HEALTH</span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Active Index</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff' }}>
                    {METRICS.totalPublishedSkills}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Verified reusable technical assets
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Tier-1 Trust (Auto-execute):</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>89%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Deprecated / Sunsetting:</span>
                    <span style={{ color: '#e2e8f0' }}>24 skills</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Governance Coverage:</span>
                    <span style={{ color: '#a855f7', fontWeight: 600 }}>100% audited</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Engagement Velocity & Reuse */}
              <div style={{
                backgroundColor: '#121215',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>CROSS-CLIENT REUSE</span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>Q2 Realized</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8' }}>
                    {METRICS.crossEngagementReuseCount}
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b', marginLeft: '0.35rem' }}>deployments</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Zero client data leakage across boundaries
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Total Quarterly Executions:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{METRICS.skillExecutionsQuarter.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Acceptance in IDE:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{METRICS.acceptanceRatePercentage}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Unauthorized Actions Blocked:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>0 (Clean)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Team Leverage & Ramp Speed */}
              <div style={{
                backgroundColor: '#121215',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>CONSULTANT RAMP ACCELERATION</span>
                    <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600 }}>4x Faster</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc' }}>
                    {METRICS.juniorRampDays}
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b', marginLeft: '0.35rem' }}>days</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Historical benchmark: 28 days to first PR
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Active Engineers:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{METRICS.activeEngineersCount} of {METRICS.totalEngineersCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span>Claude / Cursor MCP:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>38 engineers</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Direct CLI Hook:</span>
                    <span style={{ color: '#e2e8f0' }}>47 engineers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Impact Skills Table */}
            <div style={{
              backgroundColor: '#121215',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Highest Value Skills in Production</h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Quantified economic output derived from Snowflake execution logs and developer time logs</p>
                </div>
                <button 
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  View All 247 Skills &rarr;
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>SKILL NAME</th>
                      <th style={{ padding: '0.75rem 1rem' }}>TIER</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CLIENTS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>EXECUTIONS</th>
                      <th style={{ padding: '0.75rem 1rem' }}>PASS RATE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>HOURS SAVED</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ECONOMIC ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SKILLS_CATALOG.map((skill) => (
                      <tr key={skill.slug} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#e2e8f0' }}>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{skill.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{skill.slug}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: skill.tier.includes('Tier 1') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: skill.tier.includes('Tier 1') ? '#10b981' : '#818cf8',
                            border: `1px solid ${skill.tier.includes('Tier 1') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                          }}>
                            {skill.tier}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: '#94a3b8' }}>{skill.clientCoverage}</td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{skill.uses}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#10b981', fontWeight: 600 }}>{skill.passRate}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#38bdf8' }}>{skill.savedHours} hrs</td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                          ${(skill.dollarValue / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS CATALOG & EXPLORER */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Verified Crucible Skills Catalog</h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>All skills are standardized to Anthropic SKILL.md specs and callable over MCP</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['All', 'dbt', 'Snowflake', 'Salesforce', 'Streaming'].map(filter => (
                  <button
                    key={filter}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {filteredSkills.map(skill => (
                <div
                  key={skill.slug}
                  style={{
                    backgroundColor: '#121215',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{skill.name}</h3>
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontWeight: 600
                          }}>
                            VERIFIED
                          </span>
                        </div>
                        <code style={{ fontSize: '0.75rem', color: '#64748b' }}>{skill.slug}</code>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Author: {skill.author}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {skill.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                      {skill.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <strong style={{ color: '#10b981' }}>{skill.uses}</strong> runs · <strong style={{ color: '#fff' }}>${(skill.dollarValue/1000).toFixed(0)}K</strong> saved
                    </div>

                    <button
                      onClick={() => copyToClipboard(`call crucible_suggest({ skill: "${skill.slug}" })`, skill.slug)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.35rem 0.7rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {copiedText === skill.slug ? 'Copied Prompt!' : 'Copy MCP Prompt'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CURATOR & GOVERNANCE REVIEW QUEUE */}
        {activeTab === 'curator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Curator & Knowledge Governance Queue</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Review candidate skills synthesized from nightly events before pushing to cross-client distribution</p>
            </div>

            <div style={{
              backgroundColor: '#121215',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#f43f5e'
                  }} />
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                    salesforce-staging-model (Synthesized from 3 PRs)
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    color: '#f43f5e',
                    fontWeight: 600
                  }}>
                    Awaiting Curator Signoff
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleApprove('salesforce-staging-model')}
                    style={{
                      backgroundColor: approvedSkills['salesforce-staging-model'] ? '#059669' : '#10b981',
                      color: '#09090b',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 1rem',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {approvedSkills['salesforce-staging-model'] ? '✓ Approved & Published' : 'Approve & Publish to MCP'}
                  </button>
                </div>
              </div>

              {/* Side-by-Side Review Simulation */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f43f5e', marginBottom: '0.75rem' }}>
                    ADVERSARIAL CRITIC INSPECTION REPORT (PASS RATE: 85%)
                  </div>
                  <ul style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                    <li>✅ Standard Contact table — PASS</li>
                    <li>✅ Empty dataset — PASS</li>
                    <li><strong style={{ color: '#f43f5e' }}>❌ Salesforce Sandbox with archived records — FAIL (Fixed with guardrail)</strong></li>
                    <li><strong style={{ color: '#f43f5e' }}>❌ Missing is_deleted column — FAIL (Fixed with schema assertion)</strong></li>
                  </ul>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                    Automated Guardrail Injected: <code>WHERE is_deleted = false</code> and compile-time schema validation.
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
                    ANONYMIZER AUDIT LOG & REDACTION DIFF
                  </div>
                  <ul style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
                    <li>• Client-A-Retail &rarr; <span style={{ color: '#38bdf8' }}>generic_client_staging</span></li>
                    <li>• analytics_staging.client_salesforce_contacts &rarr; <span style={{ color: '#38bdf8' }}>stg_salesforce_contacts</span></li>
                    <li>• Karthik's timezone conversion algorithm &rarr; <span style={{ color: '#10b981' }}>Retained (essential logic)</span></li>
                  </ul>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                    Transfer Confidence Score: <strong>87 / 100</strong> (Zero PII or internal credentials detected)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MCP SERVER CONNECTION HUB (Detailed Tapetide MCP Pattern) */}
        {activeTab === 'mcp' && (
          <div id="mcp-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Model Context Protocol (MCP) Integration</h2>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Connect your AI assistant directly to Crucible's enterprise skill repository. One connection enables semantic discovery and automated prompt execution in Claude, Cursor, and Windsurf.
              </p>
            </div>

            {/* Client Selectors */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              {MCP_CLIENTS.map(client => {
                const isSelected = selectedClient === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#121215',
                      border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {client.id === 'claude' ? '🧠' : client.id === 'cursor' ? '⚡' : client.id === 'vscode' ? '💻' : '🏄'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#10b981' : '#fff' }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Official Connector
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Configuration Snippet for Selected Client */}
            <div style={{
              backgroundColor: '#121215',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    Configuration for {MCP_CLIENTS.find(c => c.id === selectedClient)?.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Paste into your IDE or terminal setup configuration file</p>
                </div>
                <button
                  onClick={() => {
                    const cmd = MCP_CLIENTS.find(c => c.id === selectedClient)?.command || '';
                    copyToClipboard(cmd, 'client-config');
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {copiedText === 'client-config' ? 'Copied Config!' : 'Copy Setup Command'}
                </button>
              </div>

              <div style={{
                backgroundColor: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#38bdf8',
                overflowX: 'auto'
              }}>
                {selectedClient === 'cursor' && (
                  <pre style={{ margin: 0, color: '#f8fafc' }}>
{`// .cursor/mcp.json
{
  "mcpServers": {
    "crucible": {
      "url": "http://localhost:3000/api/mcp",
      "transport": "sse",
      "env": {
        "CRUCIBLE_API_KEY": "cr_live_sec_99382103"
      }
    }
  }
}`}
                  </pre>
                )}
                {selectedClient === 'claude' && (
                  <pre style={{ margin: 0, color: '#f8fafc' }}>
{`# Add via Claude CLI
claude mcp add crucible http://localhost:3000/api/mcp

# Or in Claude Desktop config (claude_desktop_config.json):
{
  "mcpServers": {
    "crucible": {
      "command": "npx",
      "args": ["-y", "@crucible/mcp-server", "--endpoint", "http://localhost:3000/api/mcp"]
    }
  }
}`}
                  </pre>
                )}
                {selectedClient === 'vscode' && (
                  <pre style={{ margin: 0, color: '#f8fafc' }}>
{`// VS Code Roo Code / Cline settings.json
{
  "mcpServers": {
    "crucible": {
      "command": "node",
      "args": ["c:/Users/satyasainath.p/Downloads/crucible/apps/mcp-server/dist/mcp-server.js"]
    }
  }
}`}
                  </pre>
                )}
                {selectedClient === 'windsurf' && (
                  <pre style={{ margin: 0, color: '#f8fafc' }}>
{`// Windsurf mcp_config.json
{
  "mcpServers": {
    "crucible": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer cr_live_sec_99382103"
      }
    }
  }
}`}
                  </pre>
                )}
              </div>
            </div>

            {/* MCP Available Tools List */}
            <div style={{
              backgroundColor: '#121215',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.75rem'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Exposed Crucible MCP Tools
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <code style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>crucible_suggest(context)</code>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Compresses branch name, modified files, and prompts into 200-500 tokens to return high-confidence matching skills.
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <code style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>crucible_search(query)</code>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Semantic vector search across all 247 verified skills in the organization's institutional repository.
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <code style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.85rem' }}>crucible_execute(skill, params)</code>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Executes vetted skill with injected guardrails and returns deterministic code scaffolding or run outputs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}