#!/usr/bin/env python3
"""
Test script to demonstrate Rumfor Infinity Rule List functionality.

This script shows how to run a single agent manually for testing.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from rumfor_orchestrator.agents.frontend_agent import FrontendAgent
from rumfor_orchestrator.state_manager import RumforStateManager


def test_frontend_agent():
    """Test the frontend agent functionality."""
    print("🧪 Testing Rumfor Frontend Agent...")
    print("=" * 50)

    # Initialize state manager
    state_manager = RumforStateManager()

    # Create and configure agent
    agent = FrontendAgent()
    agent.set_state_manager(state_manager)

    print(f"🤖 Agent: {agent.name}")
    print(f"🔧 Slug: {agent.slug}")
    print()

    # Run the agent
    print("🚀 Running agent...")
    result = agent.take_turn()

    print(f"✅ Success: {result.success}")
    print(f"📊 Progress Made: {result.progress_made}")
    print(f"💬 Message: {result.message}")
    print()

    # Show metadata
    if result.metadata:
        print("📋 Metadata:")
        for key, value in result.metadata.items():
            print(f"  {key}: {value}")
        print()

    # Show next actions
    if result.next_actions:
        print("🎯 Next Actions:")
        for i, action in enumerate(result.next_actions[:5], 1):
            print(f"  {i}. {action}")
        print()

    # Show scratchpad excerpt
    print("📝 Scratchpad Excerpt:")
    scratchpad = agent.read_scratchpad()
    lines = scratchpad.split('\n')[:20]  # First 20 lines
    for line in lines:
        print(f"  {line}")
    if len(scratchpad.split('\n')) > 20:
        remaining = len(scratchpad.split('\n')) - 20
        print(f"  ... ({remaining} more lines)")

    print()
    print("✅ Test completed successfully!")

    return result.success


def show_status():
    """Show current orchestrator status."""
    print("\n📊 Current Orchestrator Status:")
    print("=" * 30)

    state_manager = RumforStateManager()
    status = state_manager.get_summary()

    print(f"Status: {status['orchestrator_status'].upper()}")
    print(f"Cycle: {status['current_cycle']}")
    print(f"Current Agent: {status['current_agent'] or 'None'}")
    print(f"Agents Summary: {status['agents_running']} running, {status['agents_complete']} complete, {status['agents_error']} error")


if __name__ == "__main__":
    try:
        success = test_frontend_agent()
        show_status()

        print(f"\n🎉 Demo {'completed successfully' if success else 'had issues'}!")

        if success:
            print("\n💡 Next steps:")
            print("1. Open tools/rumfor_world_model.html in your browser")
            print("2. Click on 'Frontend Agent' to copy a prompt")
            print("3. Paste the prompt into Roo Code (make sure agent modes are loaded)")
            print("4. The agent will run and update its scratchpad")

    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)