"""
Ralph's Infinity Rule List - Orchestrator Package

A file-based autonomous development system that coordinates
specialist AI agents through deterministic cycles.
"""

__version__ = "1.0.0"
__author__ = "Ralph Wiggum"

from .orchestrator import RalphOrchestrator
from .agent_base import RalphAgent
from .state_manager import RalphStateManager

__all__ = [
    'RalphOrchestrator',
    'RalphAgent',
    'RalphStateManager'
]