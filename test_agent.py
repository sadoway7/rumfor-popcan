#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'rumfor-market-tracker'))

try:
    from tools.ralph_orchestrator.agents.user_types_agent import UserTypesAgent
    print('Import successful')

    agent = UserTypesAgent()
    print('Agent created')

    result = agent.take_turn()
    print('Agent executed')
    print('Success:', result.success)
    print('Message preview:', result.message[:100] if result.message else 'No message')
    if not result.success:
        print('Error:', result.error)
        print('Metadata:', result.metadata)

except Exception as e:
    print('Error:', str(e))
    import traceback
    traceback.print_exc()