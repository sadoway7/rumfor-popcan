"""
Agent stub template for Rumfor Infinity Rule List.
"""

from ..agent_base import RumforAgent, AgentResult


class StubAgent(RumforAgent):
    """Agent stub template."""

    AGENT_NAME = "Stub Agent"
    AGENT_SLUG = "stub"

    def take_turn(self) -> AgentResult:
        """Execute stub agent responsibilities."""
        self.mark_start()
        self.mark_complete(f"{self.name} stub executed")

        return self.create_result(
            success=True,
            progress_made=False,
            message=f"{self.name} not yet implemented"
        )