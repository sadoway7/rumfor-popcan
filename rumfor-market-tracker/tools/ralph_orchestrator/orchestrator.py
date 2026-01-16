"""Main orchestrator loop for Ralph Infinity Rule List."""

from __future__ import annotations

import time
from datetime import datetime
from pathlib import Path
from typing import List

from .agent_base import AgentResult, RalphAgent
from .agents.applications_agent import ApplicationsAgent
from .agents.community_agent import CommunityAgent
from .agents.api_agent import APIAgent
from .agents.backend_agent import BackendAgent
from .agents.documentation_agent import DocumentationAgent
from .agents.logic_agent import LogicAgent
from .agents.market_types_agent import MarketTypesAgent
from .agents.research_agent import ResearchAgent
from .agents.simple_solution_agent import SimpleSolutionAgent
from .agents.ui_styles_agent import UIStylesAgent
from .agents.user_flows_agent import UserFlowsAgent
from .agents.user_types_agent import UserTypesAgent
from .state_manager import get_state_manager


def create_agents(project_root: Path) -> List[RalphAgent]:
    scratch_dir = project_root / ".ralph" / "scratchpads"
    return [
        UserTypesAgent(scratch_dir),
        MarketTypesAgent(scratch_dir),
        UserFlowsAgent(scratch_dir),
        UIStylesAgent(scratch_dir),
        CommunityAgent(scratch_dir),
        ApplicationsAgent(scratch_dir),
        BackendAgent(scratch_dir),
        APIAgent(scratch_dir),
        DocumentationAgent(scratch_dir),
        ResearchAgent(scratch_dir),
        SimpleSolutionAgent(scratch_dir),
        LogicAgent(scratch_dir),
    ]


def run_cycle(project_root: Path) -> None:
    state = get_state_manager(project_root)
    agents = create_agents(project_root)
    state.update_orchestrator(
        status="running",
        current_agent=None,
        start_time=datetime.utcnow().isoformat(),
    )

    for agent in agents:
        state.update_orchestrator(current_agent=agent.AGENT_SLUG)
        result = agent.take_turn()
        if not isinstance(result, AgentResult):
            agent.mark_error("Agent did not return AgentResult")
        time.sleep(0.5)

    status = state._read_status()
    state.update_orchestrator(
        status="idle",
        current_agent=None,
        current_cycle=status["orchestrator"]["current_cycle"] + 1,
    )


if __name__ == "__main__":
    run_cycle(Path(__file__).resolve().parents[2])
