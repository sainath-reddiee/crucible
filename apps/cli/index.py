#!/usr/bin/env python3
"""
Crucible CLI — Primary interaction surface for engineers.
Five core commands:
  crucible find <query>
  crucible run <skill-id>
  crucible review
  crucible status
  crucible onboard --engagement <type>
Plus ambient watcher (non-blocking terminal banner).
"""

import sys, argparse, time, json

# Mock import for Crucible core (simulated Python bridge to TypeScript logic for this demo)
from datetime import datetime

SKILL_REGISTRY = {
    "diagnose-late-dbt-run": {
        "name": "Diagnose Late dbt Run SLA Incident",
        "author": "Karthik",
        "tier": 1,
        "success_rate": "94%",
        "last_used": "3 days ago"
    },
    "salesforce-staging-model": {
        "name": "Salesforce Staging Model with Late-Arriving Filter",
        "author": "Karthik",
        "tier": 2,
        "success_rate": "87%",
        "last_used": "21 days ago"
    },
    "dbt-incremental-bootstrap": {
        "name": "dbt Incremental Bootstrap Pattern",
        "author": "Tarun",
        "tier": 2,
        "success_rate": "91%",
        "last_used": "5 days ago"
    }
}

def find(query_text):
    print(f"\n[CRUCIBLE] Skill suggestions for: '{query_text}'\n")
    matches = []
    for sid, meta in SKILL_REGISTRY.items():
        if query_text.lower() in meta['name'].lower() or query_text.lower() in sid:
            matches.append(meta | {'id': sid})

    if not matches:
        print("No matching skills found. Try refining your query or running 'crucible review' to see proposed skills.")
        return

    for i, m in enumerate(matches, 1):
        print(f"  {i}. {m['id']}")
        print(f"     {m['name']}  |  Author: {m['author']}  |  Success: {m['success_rate']}  |  Tier: {m['tier']}")
        print()

def run(skill_id):
    print(f"\n[CRUCIBLE] Executing skill '{skill_id}'...\n")
    if skill_id not in SKILL_REGISTRY:
        print(f"Error: Skill '{skill_id}' not found in library.")
        return
    meta = SKILL_REGISTRY[skill_id]
    print(f"Skill: {meta['name']}")
    print(f"Author: {meta['author']}")
    print(f"Tier: {meta['tier']} (autonomy level: {'low' if meta['tier']==1 else 'medium' if meta['tier']==2 else 'high'})")
    if meta['author'] == 'Karthik':
        print("Note: You authored this skill 21 days ago. It's interesting to see it come back!")
    print("\nExecuting... [simulated end-to-end pipeline execution]\nExecution completed successfully.")

def review():
    print("\n[CRUCIBLE] Review Queue (pending human approval)\n")
    skills_to_review = [
        ('airflow-snowpipe-streaming-bootstrap', 'Airflow Snowpipe Streaming Bootstrap', 'Tier 3 (requires senior review)', 'Confidence: 78'),
        ('salesforce-staging-model', 'Salesforce Staging Model', 'Tier 2 (ready for review)', 'Confidence: 87'),
    ]
    for sid, name, review_note, confidence in skills_to_review:
        print(f"  • {sid}")
        print(f"    {name}")
        print(f"    {review_note}  |  {confidence}")
    print("\nUse 'crucible approve <skill-id>' or 'crucible reject <skill-id>' to take action.")

def status():
    print("\n[CRUCIBLE] Personal Transparency Dashboard (This Week)\n")
    print("Events captured:")
    print("  • 3 Git PR commits (Salesforce staging patterns)")
    print("  • 7 Snowflake queries executed (staging models)")
    print("  • 0 AI conversations captured (optional consent disabled)")
    print("  • 1 dbt run log captured")
    print("Proposed skills from your work:")
    print("  • 'salesforce-staging-model' (draft, awaiting your review)")
    print("  • 'dbt-mart-bootstrap' (approved, published)")
    print("Skills you authored and used:")
    print("  • salesforce-staging-model (authored 21 days ago, used 4 times)")

def onboard(engagement_type):
    print(f"\n[CRUCIBLE] Personalized Onboarding Pack: '{engagement_type}'\n")
    skills = {
        "healthcare-snowflake": [
            ("dbt-mart-bootstrap", "Generate dimensional marts for healthcare data"),
            ("sql-window-patterns", "Patient tracking sessionization"),
            ("snowpipe-streaming", "Real-time EHR event ingestion")
        ],
        "b2b-saas-salesforce": [
            ("salesforce-staging-model", "Standard SaaS ingestion from Salesforce"),
            ("dbt-incremental-bootstrap", "Incremental strategy for subscription data"),
            ("snowflake-cost-optimizer", "Manage warehouse costs for large-scale B2B data")
        ],
        "fintech-payments": [
            ("stripe-subscription-staging", "Subscription lifecycle data modeling"),
            ("airflow-snowpipe-streaming", "Real-time transaction ingestion pipeline"),
            ("dbt-sla-triager", "Diagnose late pipeline failures quickly")
        ]
    }
    pack = skills.get(engagement_type, skills["b2b-saas-salesforce"])
    for sid, desc in pack:
        meta = SKILL_REGISTRY.get(sid)
        if meta:
            print(f"  • {sid}  —  {meta['name']}")
        else:
            print(f"  • {sid}  —  {desc}")
    print("\nEach skill includes a 'First Time Using This?' walkthrough in sandbox mode.")

def ambient_watcher():
    """Simulated ambient watcher that monitors branch checkouts and surfaces non-blocking banners."""
    print("[CRUCIBLE] Ambient watcher active (simulated).")
    print("Monitoring: git branch checkouts, dbt command runs, new file creation...")
    time.sleep(1)
    print("\n  ╭──────────────────────────────────────────╮")
    print("  │  CRUCIBLE ▸ I see you're starting a  │")
    print("  │  Salesforce staging model.            │")
    print("  │                                          │")
    print("  │  Suggested skill: salesforce-staging- │")
    print("  │  model ★ 87% success rate, used 12× │")
    print("  │  Authored by you, 21 days ago         │")
    print("  │                                          │")
    print("  │  [Use it?] [c]  Dismiss [d]  More [m] │")
    print("  ╰──────────────────────────────────────────╯")
    print("Banner fades in 10 seconds if ignored...")

def main():
    parser = argparse.ArgumentParser(description="Crucible — Agentic Skill Factory CLI", prog="crucible")
    sub = parser.add_subparsers(dest="command", help="Available commands")

    find_parser = sub.add_parser("find", help="Search and suggest skills")
    find_parser.add_argument("query", type=str, help="Task or issue description")

    run_parser = sub.add_parser("run", help="Run a skill by ID")
    run_parser.add_argument("skill_id", type=str, help="Skill identifier")

    sub.add_parser("review", help="Show review queue for skills proposed to you")
    sub.add_parser("status", help="Show personal transparency and capture view")
    onboard_parser = sub.add_parser("onboard", help="Generate personalized onboarding pack")
    onboard_parser.add_argument("--engagement", type=str, default="b2b-saas-salesforce", help="Engagement archetype")

    sub.add_parser("quiet", help="Silence ambient suggestions for session")

    args = parser.parse_args()

    if args.command == "find":
        find(args.query)
    elif args.command == "run":
        run(args.skill_id)
    elif args.command == "review":
        review()
    elif args.command == "status":
        status()
    elif args.command == "onboard":
        onboard(args.engagement)
    elif args.command == "quiet":
        print("Ambient watcher silenced for this session. Type 'crucible unquiet' to restore.")
    else:
        # Default: show ambient banner (simulated real-time interaction)
        ambient_watcher()

if __name__ == "__main__":
    main()
