#!/usr/bin/env python3
"""
Rumfor Infinity Rule List - Orchestrator Runner

Run the complete Ralph-style autonomous development system.
"""

import sys
from pathlib import Path

# Add the orchestrator to Python path
sys.path.insert(0, str(Path(__file__).parent / "rumfor_orchestrator"))

from rumfor_orchestrator.orchestrator import RumforOrchestrator


def main():
    """Run the Rumfor orchestrator with Ralph-style features."""

    print("🤖 RUMFOR INFINITY RULE LIST - FULL RALPH-STYLE ORCHESTRATOR")
    print("=" * 70)
    print()

    # Initialize orchestrator
    print("🚀 Initializing Rumfor Orchestrator...")
    orchestrator = RumforOrchestrator()

    # Show current context
    context = orchestrator.get_project_context()
    print(f"📊 Current Cycle: {context['current_cycle']}")
    print(f"🎯 Project Focus: {context['current_focus'].get('current_context', 'No context set')}")
    print(f"🤖 Active Agents: {', '.join(context['active_agents'])}")
    print(f"💾 Git Status: {context['git_status']}")
    print()

    # Check command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "cycle":
            print("🔄 Running full development cycle...")
            result = orchestrator.run_full_cycle()
            print_cycle_results(result)

        elif command == "single" and len(sys.argv) > 2:
            agent_slug = sys.argv[2]
            context_msg = f"Focused execution on {agent_slug} agent"
            print(f"🎯 Running single agent: {agent_slug}")
            result = orchestrator.run_single_agent(agent_slug, context_msg)
            print_single_result(agent_slug, result)

        elif command == "context" and len(sys.argv) > 2:
            new_context = sys.argv[2]
            notes = sys.argv[3] if len(sys.argv) > 3 else None
            orchestrator.set_project_context(new_context, notes)
            print(f"✅ Project context set: {new_context}")

        elif command == "status":
            show_detailed_status(orchestrator)

        else:
            show_usage()

    else:
        show_usage()


def print_cycle_results(result):
    """Print comprehensive cycle results."""
    print(f"\n🎉 CYCLE {result.cycle_number} COMPLETE")
    print("-" * 40)
    print(f"⏱️  Duration: {result.duration_seconds:.1f} seconds")
    print(f"🤖 Agents Executed: {len(result.agents_executed)}")
    print(f"✅ Agents Succeeded: {len(result.agents_succeeded)}")
    print(f"❌ Agents Failed: {len(result.agents_failed)}")

    if result.agents_succeeded:
        print(f"🏆 Successful: {', '.join(result.agents_succeeded)}")

    if result.agents_failed:
        print(f"💥 Failed: {', '.join(result.agents_failed)}")

    print(f"🚀 Progress Made: {'Yes' if result.total_progress_made else 'No'}")

    if result.git_checkpoints_created:
        print(f"💾 Git Checkpoints: {len(result.git_checkpoints_created)}")
        for checkpoint in result.git_checkpoints_created[:3]:  # Show first 3
            print(f"   • {checkpoint}")
        if len(result.git_checkpoints_created) > 3:
            print(f"   ... and {len(result.git_checkpoints_created) - 3} more")

    print(f"\n📝 Summary: {result.summary}")
    print("\n🧠 Self-improvement analysis completed")
    print("📚 Knowledge base updated")
    print("📊 Metrics collected")


def print_single_result(agent_slug, result):
    """Print single agent execution result."""
    status = "✅ SUCCESS" if result.success else "❌ FAILED"
    print(f"\n🤖 {agent_slug.upper()} AGENT RESULT")
    print("-" * 30)
    print(f"📊 Status: {status}")
    print(f"🚀 Progress Made: {result.progress_made}")
    print(f"💬 Message: {result.message}")

    if result.execution_time_seconds:
        print(f"⏱️  Execution Time: {result.execution_time_seconds:.1f}s")

    if result.files_modified:
        print(f"📁 Files Modified: {len(result.files_modified)}")

    if result.next_actions:
        print(f"🎯 Next Actions: {len(result.next_actions)}")
        for action in result.next_actions[:3]:
            print(f"   • {action}")

    if result.metadata:
        print("📋 Key Metadata:")
        for key, value in list(result.metadata.items())[:5]:
            print(f"   • {key}: {value}")

    if result.error:
        print(f"💥 Error: {result.error}")

    print(f"\n{result.get_summary()}")


def show_detailed_status(orchestrator):
    """Show detailed orchestrator status."""
    context = orchestrator.get_project_context()

    print("\n📊 RUMFOR ORCHESTRATOR STATUS")
    print("=" * 35)

    print("🎯 PROJECT CONTEXT:")
    project_context = context['current_focus']
    if project_context.get('current_context'):
        print(f"   Focus: {project_context['current_context']}")
        if project_context.get('notes'):
            print(f"   Notes: {project_context['notes']}")
    else:
        print("   No project context set")

    print("\n🤖 AGENTS:")
    for agent in context['active_agents']:
        print(f"   • {agent}")

    print("\n📈 PERFORMANCE METRICS:")
    metrics = context['performance_metrics']
    print(f"   Total Cycles: {metrics.get('total_cycles', 0)}")
    print(f"   Total Executions: {metrics.get('total_executions', 0)}")
    print(f"   Success Rate: {metrics.get('success_rate', 0):.1%}")
    if metrics.get('most_active_agent'):
        print(f"   Most Active: {metrics['most_active_agent']}")

    print("\n📚 KNOWLEDGE BASE:")
    recent_knowledge = context.get('recent_learnings', [])
    if recent_knowledge:
        print(f"   Recent Entries: {len(recent_knowledge)}")
        for entry in recent_knowledge[:3]:
            print(f"   • [{entry.get('agent', 'unknown')}] {entry.get('content', '')[:60]}...")
    else:
        print("   Knowledge base is empty")

    print("\n💾 GIT STATUS:")
    git_status = context['git_status']
    if git_status.get('initialized'):
        print(f"   Branch: {git_status.get('branch', 'unknown')}")
        print(f"   Has Changes: {git_status.get('has_changes', False)}")
        print(f"   Clean: {git_status.get('clean', False)}")
    else:
        print("   Git not initialized")


def show_usage():
    """Show usage information."""
    print("USAGE:")
    print("  python run_rumfor_orchestrator.py <command> [options]")
    print()
    print("COMMANDS:")
    print("  cycle                    Run complete development cycle")
    print("  single <agent>           Run specific agent (frontend, backend, etc.)")
    print("  context <text> [notes]   Set project context and notes")
    print("  status                   Show detailed orchestrator status")
    print()
    print("EXAMPLES:")
    print("  python run_rumfor_orchestrator.py cycle")
    print("  python run_rumfor_orchestrator.py single frontend")
    print("  python run_rumfor_orchestrator.py context 'Add user notifications' 'High priority'")
    print("  python run_rumfor_orchestrator.py status")
    print()
    print("RALPH-STYLE FEATURES:")
    print("  ✅ Git checkpoint system (auto-commits progress)")
    print("  ✅ Knowledge base (accumulated learnings)")
    print("  ✅ Metrics collection (performance tracking)")
    print("  ✅ Self-improvement analysis (cycle optimization)")
    print("  ✅ Project context & notes")
    print("  ✅ Thread-safe state management")
    print("  ✅ Rich agent metadata")


if __name__ == "__main__":
    main()