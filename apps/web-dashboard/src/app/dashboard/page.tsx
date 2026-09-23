"use client";

import React, { useState } from 'react';

// Mock dashboard data from Snowflake executive metrics
const metrics = {
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

type ViewMode = 'engineer' | 'curator' | 'leadership';

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>('leadership');

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#0f172a' }}>⚙️ Crucible Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {(['engineer', 'curator', 'leadership'] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: view === v ? '#2563eb' : '#fff',
              color: view === v ? '#fff' : '#334155',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {v} View
          </button>
        ))}
      </div>

      {view === 'leadership' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Leadership View</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#64748b' }}>Library Health</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.totalPublishedSkills} <span style={{ fontSize: '1rem', color: '#64748b' }}>skills</span></p>
              <p>89% above tier-1 trust threshold</p>
              <p>18 deprecated, 6 sunsetting</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#64748b' }}>Business Value (Q2)</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>${(metrics.dollarValueSaved/1000).toFixed(0)}K</p>
              <p>Hours saved: {metrics.hoursSavedQuarter.toLocaleString()}</p>
              <p>Equivalent senior time savings</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#64748b' }}>Adoption</h3>
              <p>{metrics.activeEngineersCount}/{metrics.totalEngineersCount} engineers active</p>
              <p>Junior ramp: {metrics.juniorRampDays} days (was {metrics.previousRampDays})</p>
              <p>CLI users: 47 | MCP users: 38</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#64748b' }}>Top Impact</h3>
              <ul>
                <li>🔍 diagnose-late-dbt-run — 312 uses, $94K saved</li>
                <li>🔍 dbt-incremental-bootstrap — 187 uses, $54K saved</li>
                <li>🔍 salesforce-staging-model — 121 uses, 8 clients</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {view === 'engineer' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Engineer Transparency View</h2>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Personal Capture Dashboard</h3>
            <p>Events captured this week:</p>
            <ul>
              <li>3 Git PR commits</li>
              <li>7 Snowflake queries</li>
              <li>1 dbt run log</li>
            </ul>
            <p>Skills proposed from your work:</p>
            <ul>
              <li>salesforce-staging-model (draft — awaiting review)</li>
              <li>dbt-mart-bootstrap (approved — published)</li>
            </ul>
          </div>
        </div>
      )}

      {view === 'curator' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Curator Review Queue</h2>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Skills Awaiting Review</h3>
            <p>3 tier-3 skills need your eye this week.</p>
            <p>1 skill knowledge-concentration risk: <em>airflow-snowpipe-streaming-bootstrap</em> (Ramya)</p>
            <p>8 existing skills trending down — re-validate after Snowflake release.</p>
            <p>2 skills not used in 90 days — candidates for deprecation.</p>
          </div>
        </div>
      )}
    </div>
  );
}