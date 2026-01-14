#!/usr/bin/env python3
"""
Simple verification that Ralph's Infinity Rule List is working.
"""

import os
from pathlib import Path

def check_system():
    """Check if all Ralph components are in place."""
    print("🔍 Verifying Ralph's Infinity Rule List System...")
    print("=" * 60)

    # Check core files
    files_to_check = [
        (".roomodes", "Agent mode definitions"),
        (".rumfor/status.json", "State management file"),
        (".rumfor/scratchpads/frontend_scratchpad.md", "Agent scratchpad"),
        ("tools/rumfor_world_model.html", "Control dashboard"),
        ("tools/rumfor_orchestrator/agent_base.py", "Agent framework"),
        ("tools/compile_rumfor_status.py", "Status compiler"),
        ("rumfor_status.js", "Status data file"),
    ]

    all_good = True
    for file_path, description in files_to_check:
        if Path(file_path).exists():
            print(f"✅ {file_path:<40} - {description}")
        else:
            print(f"❌ {file_path:<40} - MISSING: {description}")
            all_good = False

    print()
    print("🎯 System Status:")
    print(f"Agent Modes:    Found in .roomodes")
    print(f"Status File:    {Path('.rumfor/status.json').exists()}")
    print(f"Dashboard:      tools/rumfor_world_model.html")
    print(f"Last Cycle:     Check .rumfor/status.json")
    print(f"Scratchpads:    {len(list(Path('.rumfor/scratchpads').glob('*.md'))) if Path('.rumfor/scratchpads').exists() else 0} files")

    if all_good:
        print("\n🎉 SYSTEM IS READY!")
        print("\nNext steps:")
        print("1. Open tools/rumfor_world_model.html in browser")
        print("2. Click any agent button to copy prompt")
        print("3. Paste prompt into Roo Code")
        print("4. Agent will run autonomously!")
    else:
        print("\n⚠️  Some components missing. Run setup again.")

    return all_good

if __name__ == "__main__":
    check_system()