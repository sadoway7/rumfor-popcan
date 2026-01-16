#!/usr/bin/env python3
"""
Rumfor Infinity Rule List - Main Orchestrator

Full Ralph-style autonomous development system with:
- Automated agent execution cycles
- Git checkpoint system
- Knowledge base accumulation
- Self-improvement analysis
- Comprehensive status tracking
- Project context and notes management
"""

import json
import subprocess
import time
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

from agent_base import AgentResult
from state_manager import RumforStateManager
from agents.frontend_agent import FrontendAgent
from agents.backend_agent import BackendAgent
from agents.api_agent import APIAgent
from agents.styling_agent import StylingAgent
from agents.testing_agent import TestingAgent
from agents.security_agent import SecurityAgent
from agents.documentation_agent import DocumentationAgent
from agents.deployment_agent import DeploymentAgent


@dataclass
class CycleResult:
    """Results of a complete development cycle."""
    cycle_number: int
    start_time: datetime
    end_time: datetime
    duration_seconds: float
    agents_executed: List[str]
    agents_succeeded: List[str]
    agents_failed: List[str]
    total_progress_made: bool
    git_checkpoints_created: List[str]
    summary: str


@dataclass
class KnowledgeEntry:
    """Entry in the knowledge base."""
    timestamp: str
    cycle: int
    agent: str
    topic: str
    content: str
    confidence: float


class RumforOrchestrator:
    """Main orchestrator implementing full Ralph Infinity Rule List functionality."""

    def __init__(self, project_root: Optional[Path] = None):
        """Initialize the Rumfor orchestrator."""
        self.project_root = project_root or Path(__file__).parent.parent.parent
        self.rumfor_dir = self.project_root / ".rumfor"

        # Initialize components
        self.state_manager = RumforStateManager(self.rumfor_dir)
        self.git_manager = GitCheckpointManager(self.project_root, self.rumfor_dir)
        self.knowledge_base = KnowledgeBase(self.rumfor_dir)
        self.metrics_collector = MetricsCollector(self.rumfor_dir)
        self.context_manager = ProjectContextManager(self.rumfor_dir)

        # Initialize agents
        self.agents = self._initialize_agents()

        # Orchestrator lock for thread safety
        self.lock = threading.RLock()

    def _initialize_agents(self) -> Dict[str, Any]:
        """Initialize all specialist agents."""
        agents = {}

        # Create agent instances
        agent_classes = [
            ('frontend', FrontendAgent),
            ('backend', BackendAgent),
            ('api', APIAgent),
            ('styling', StylingAgent),
            ('testing', TestingAgent),
            ('security', SecurityAgent),
            ('documentation', DocumentationAgent),
            ('deployment', DeploymentAgent)
        ]

        for agent_slug, agent_class in agent_classes:
            try:
                agent = agent_class()
                agent.set_state_manager(self.state_manager)
                agents[agent_slug] = agent
            except Exception as e:
                print(f"Failed to initialize {agent_slug} agent: {e}")

        return agents

    def run_full_cycle(self) -> CycleResult:
        """Run a complete development cycle with all agents."""
        with self.lock:
            cycle_number = self.state_manager.get_orchestrator_status()['current_cycle'] + 1
            start_time = datetime.now()

            print(f"🚀 Starting Rumfor Cycle #{cycle_number}")
            self.state_manager.update_orchestrator_status(
                status="running",
                current_cycle=cycle_number,
                start_time=start_time.isoformat()
            )

            # Initialize cycle tracking
            agents_executed = []
            agents_succeeded = []
            agents_failed = []
            git_checkpoints_created = []
            total_progress_made = False

            try:
                # Execute each agent in sequence
                agent_sequence = [
                    'frontend', 'backend', 'api', 'styling',
                    'testing', 'security', 'documentation', 'deployment'
                ]

                for agent_slug in agent_sequence:
                    if agent_slug not in self.agents:
                        print(f"⚠️  Agent {agent_slug} not available, skipping")
                        continue

                    agent = self.agents[agent_slug]
                    print(f"🤖 Running {agent.name}...")

                    # Update orchestrator status
                    self.state_manager.update_orchestrator_status(
                        current_agent=agent_slug,
                        last_update=datetime.now().isoformat()
                    )

                    # Execute agent
                    try:
                        agents_executed.append(agent_slug)
                        result = agent.take_turn()

                        # Track results
                        if result.success:
                            agents_succeeded.append(agent_slug)
                            if result.progress_made:
                                total_progress_made = True

                                # Create git checkpoint for successful progress
                                try:
                                    checkpoint_name = self.git_manager.create_checkpoint(
                                        agent_slug, cycle_number, result
                                    )
                                    if checkpoint_name:
                                        git_checkpoints_created.append(checkpoint_name)
                                except Exception as e:
                                    print(f"⚠️  Git checkpoint failed: {e}")

                        else:
                            agents_failed.append(agent_slug)
                            print(f"❌ {agent.name} failed: {result.error}")

                        # Collect metrics
                        self.metrics_collector.record_agent_execution(
                            agent_slug, cycle_number, result, datetime.now() - start_time
                        )

                        # Add to knowledge base if significant learning occurred
                        if result.metadata:
                            self.knowledge_base.add_from_agent_result(
                                agent_slug, cycle_number, result
                            )

                    except Exception as e:
                        agents_failed.append(agent_slug)
                        print(f"💥 Critical error in {agent.name}: {e}")
                        agent.mark_error(str(e))

                    # Brief pause between agents
                    time.sleep(1)

                # Cycle complete - run self-improvement analysis
                print("🧠 Running self-improvement analysis...")
                self.run_self_improvement_analysis(cycle_number)

                # Update World Model cards (placeholder for future implementation)
                self.update_world_model_cards(cycle_number)

            except Exception as e:
                print(f"💥 Critical orchestrator error: {e}")
                self.state_manager.update_orchestrator_status(
                    status="error",
                    error=str(e)
                )
                raise

            finally:
                # Finalize cycle
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()

                # Create cycle summary
                summary = self._create_cycle_summary(
                    cycle_number, agents_executed, agents_succeeded,
                    agents_failed, git_checkpoints_created, duration
                )

                self.state_manager.update_orchestrator_status(
                    status="idle",
                    current_agent=None,
                    current_cycle=cycle_number,
                    last_update=end_time.isoformat()
                )

                print(f"✅ Cycle #{cycle_number} complete in {duration:.1f}s")
                print(f"📊 Results: {len(agents_succeeded)}/{len(agents_executed)} agents succeeded")

                return CycleResult(
                    cycle_number=cycle_number,
                    start_time=start_time,
                    end_time=end_time,
                    duration_seconds=duration,
                    agents_executed=agents_executed,
                    agents_succeeded=agents_succeeded,
                    agents_failed=agents_failed,
                    total_progress_made=total_progress_made,
                    git_checkpoints_created=git_checkpoints_created,
                    summary=summary
                )

    def run_single_agent(self, agent_slug: str, context: Optional[str] = None) -> AgentResult:
        """Run a single agent with optional context."""
        if agent_slug not in self.agents:
            raise ValueError(f"Unknown agent: {agent_slug}")

        agent = self.agents[agent_slug]

        # Add context to agent's scratchpad if provided
        if context:
            agent.update_scratchpad_section("Context", f"- Current focus: {context}")

        # Run the agent
        result = agent.take_turn()

        # Create checkpoint if progress was made
        if result.success and result.progress_made:
            cycle = self.state_manager.get_orchestrator_status()['current_cycle']
            checkpoint_name = self.git_manager.create_checkpoint(agent_slug, cycle, result)
            if checkpoint_name:
                print(f"💾 Created git checkpoint: {checkpoint_name}")

        return result

    def run_self_improvement_analysis(self, cycle_number: int) -> None:
        """Analyze the cycle and improve the system."""
        try:
            # Get cycle metrics
            metrics = self.metrics_collector.get_cycle_metrics(cycle_number)

            # Analyze agent performance
            improvements = self._analyze_agent_performance(metrics)

            # Update knowledge base with learnings
            for improvement in improvements:
                self.knowledge_base.add_entry(
                    cycle=cycle_number,
                    agent="orchestrator",
                    topic="self_improvement",
                    content=improvement,
                    confidence=0.8
                )

            # Update agent prompts based on learnings (future implementation)
            # self._update_agent_prompts(improvements)

        except Exception as e:
            print(f"⚠️  Self-improvement analysis failed: {e}")

    def _analyze_agent_performance(self, metrics: Dict[str, Any]) -> List[str]:
        """Analyze agent performance and suggest improvements."""
        improvements = []

        # Check for patterns in failures
        failed_agents = [agent for agent, data in metrics['agents'].items()
                        if not data.get('success', True)]

        if failed_agents:
            improvements.append(
                f"Address recurring failures in agents: {', '.join(failed_agents)}"
            )

        # Check execution times
        for agent_slug, data in metrics['agents'].items():
            exec_time = data.get('execution_time_seconds', 0)
            if exec_time > 300:  # 5 minutes
                improvements.append(
                    f"Optimize {agent_slug} agent execution time (currently {exec_time:.1f}s)"
                )

        # Check progress frequency
        progress_agents = [agent for agent, data in metrics['agents'].items()
                          if data.get('progress_made', False)]
        if len(progress_agents) < 2:
            improvements.append("Focus on making more agents create progress each cycle")

        return improvements

    def update_world_model_cards(self, cycle_number: int) -> None:
        """Update World Model cards based on cycle learnings. (Future implementation)"""
        # This would analyze agent outputs and update the DOT files
        # representing the current state of the project
        pass

    def get_project_context(self) -> Dict[str, Any]:
        """Get comprehensive project context."""
        return {
            "current_cycle": self.state_manager.get_orchestrator_status()['current_cycle'],
            "active_agents": list(self.agents.keys()),
            "current_focus": self.context_manager.get_current_focus(),
            "recent_learnings": self.knowledge_base.get_recent_entries(5),
            "performance_metrics": self.metrics_collector.get_summary_metrics(),
            "git_status": self.git_manager.get_status()
        }

    def set_project_context(self, context: str, notes: Optional[str] = None) -> None:
        """Set project context and notes for current work."""
        self.context_manager.set_context(context, notes)

    def _create_cycle_summary(self, cycle_number: int, executed: List[str],
                            succeeded: List[str], failed: List[str],
                            checkpoints: List[str], duration: float) -> str:
        """Create a summary of the development cycle."""
        summary_lines = [
            f"# Cycle {cycle_number} Summary",
            f"- Duration: {duration:.1f} seconds",
            f"- Agents Executed: {len(executed)}",
            f"- Success Rate: {len(succeeded)}/{len(executed)}",
        ]

        if succeeded:
            summary_lines.append(f"- Successful Agents: {', '.join(succeeded)}")

        if failed:
            summary_lines.append(f"- Failed Agents: {', '.join(failed)}")

        if checkpoints:
            summary_lines.append(f"- Git Checkpoints: {len(checkpoints)} created")

        return "\n".join(summary_lines)


class GitCheckpointManager:
    """Manages git checkpoints for agent progress."""

    def __init__(self, project_root: Path, rumfor_dir: Path):
        self.project_root = project_root
        self.checkpoints_dir = rumfor_dir / "checkpoints"
        self.checkpoints_dir.mkdir(exist_ok=True)

    def create_checkpoint(self, agent_slug: str, cycle_number: int,
                         result: AgentResult) -> Optional[str]:
        """Create a git checkpoint for agent progress."""
        try:
            # Check if there are changes to commit
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )

            if not result.stdout.strip():
                return None  # No changes to commit

            # Create descriptive commit message
            commit_msg = self._create_commit_message(agent_slug, cycle_number, result)

            # Create the commit
            subprocess.run(['git', 'add', '.'], cwd=self.project_root, check=True)
            subprocess.run(['git', 'commit', '-m', commit_msg],
                         cwd=self.project_root, check=True)

            # Create a tag for the checkpoint
            tag_name = f"{agent_slug}-cycle{cycle_number}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            subprocess.run(['git', 'tag', tag_name], cwd=self.project_root, check=True)

            # Record checkpoint metadata
            self._record_checkpoint_metadata(tag_name, agent_slug, cycle_number, result)

            return tag_name

        except subprocess.CalledProcessError as e:
            print(f"⚠️  Git checkpoint failed: {e}")
            return None

    def _create_commit_message(self, agent_slug: str, cycle_number: int,
                              result: AgentResult) -> str:
        """Create a descriptive commit message."""
        base_msg = f"[{agent_slug}] cycle {cycle_number}"

        if result.message:
            base_msg += f": {result.message[:100]}"  # Limit message length

        # Add file count if available
        if result.files_modified:
            base_msg += f" ({len(result.files_modified)} files)"

        return base_msg

    def _record_checkpoint_metadata(self, tag_name: str, agent_slug: str,
                                   cycle_number: int, result: AgentResult) -> None:
        """Record metadata about the checkpoint."""
        metadata = {
            "tag": tag_name,
            "agent": agent_slug,
            "cycle": cycle_number,
            "timestamp": datetime.now().isoformat(),
            "commit_message": self._create_commit_message(agent_slug, cycle_number, result),
            "files_modified": result.files_modified,
            "progress_made": result.progress_made,
            "metadata": result.metadata
        }

        metadata_file = self.checkpoints_dir / f"checkpoint_{tag_name}.json"
        metadata_file.write_text(json.dumps(metadata, indent=2))

    def get_status(self) -> Dict[str, Any]:
        """Get git repository status."""
        try:
            # Check if we're in a git repo
            result = subprocess.run(
                ['git', 'rev-parse', '--git-dir'],
                capture_output=True,
                cwd=self.project_root
            )
            if result.returncode != 0:
                return {"initialized": False}

            # Get branch and status
            branch_result = subprocess.run(
                ['git', 'branch', '--show-current'],
                capture_output=True, text=True, cwd=self.project_root
            )

            status_result = subprocess.run(
                ['git', 'status', '--porcelain'],
                capture_output=True, text=True, cwd=self.project_root
            )

            return {
                "initialized": True,
                "branch": branch_result.stdout.strip(),
                "has_changes": bool(status_result.stdout.strip()),
                "clean": not bool(status_result.stdout.strip())
            }

        except Exception as e:
            return {"error": str(e)}


class KnowledgeBase:
    """Accumulated knowledge and learnings across cycles."""

    def __init__(self, rumfor_dir: Path):
        self.knowledge_file = rumfor_dir / "knowledge" / "knowledge_base.json"
        self.knowledge_file.parent.mkdir(parents=True, exist_ok=True)

    def add_entry(self, cycle: int, agent: str, topic: str,
                  content: str, confidence: float = 0.5) -> None:
        """Add a knowledge entry."""
        entry = KnowledgeEntry(
            timestamp=datetime.now().isoformat(),
            cycle=cycle,
            agent=agent,
            topic=topic,
            content=content,
            confidence=confidence
        )

        # Load existing knowledge
        knowledge = self._load_knowledge()
        knowledge.append(asdict(entry))

        # Save updated knowledge
        self.knowledge_file.write_text(json.dumps(knowledge, indent=2))

    def add_from_agent_result(self, agent_slug: str, cycle: int,
                             result: AgentResult) -> None:
        """Extract knowledge from agent execution results."""
        # Add learnings from metadata
        if result.metadata:
            for key, value in result.metadata.items():
                if isinstance(value, str) and len(value) > 10:  # Meaningful content
                    self.add_entry(
                        cycle=cycle,
                        agent=agent_slug,
                        topic=f"execution_{key}",
                        content=f"From {agent_slug}: {value}",
                        confidence=0.7
                    )

        # Extract learnings from next_actions
        if result.next_actions:
            for action in result.next_actions:
                self.add_entry(
                    cycle=cycle,
                    agent=agent_slug,
                    topic="future_work",
                    content=f"Suggested: {action}",
                    confidence=0.8
                )

    def get_recent_entries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent knowledge entries."""
        knowledge = self._load_knowledge()
        return knowledge[-limit:] if knowledge else []

    def search_knowledge(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search knowledge base for relevant entries."""
        knowledge = self._load_knowledge()
        matching = []

        query_lower = query.lower()
        for entry in knowledge:
            if (query_lower in entry.get('content', '').lower() or
                query_lower in entry.get('topic', '').lower()):
                matching.append(entry)
                if len(matching) >= limit:
                    break

        return matching

    def _load_knowledge(self) -> List[Dict[str, Any]]:
        """Load knowledge from file."""
        if not self.knowledge_file.exists():
            return []

        try:
            return json.loads(self.knowledge_file.read_text())
        except json.JSONDecodeError:
            return []


class MetricsCollector:
    """Collects performance metrics across cycles."""

    def __init__(self, rumfor_dir: Path):
        self.metrics_file = rumfor_dir / "metrics" / "metrics.json"
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)

    def record_agent_execution(self, agent_slug: str, cycle: int,
                              result: AgentResult, cycle_duration: timedelta) -> None:
        """Record metrics from agent execution."""
        metrics_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_slug,
            "cycle": cycle,
            "success": result.success,
            "progress_made": result.progress_made,
            "execution_time_seconds": cycle_duration.total_seconds(),
            "files_modified": len(result.files_modified) if result.files_modified else 0,
            "has_error": bool(result.error),
            "has_metadata": bool(result.metadata)
        }

        # Append to metrics file
        metrics = self._load_metrics()
        metrics.append(metrics_entry)
        self.metrics_file.write_text(json.dumps(metrics, indent=2))

    def get_cycle_metrics(self, cycle_number: int) -> Dict[str, Any]:
        """Get metrics for a specific cycle."""
        metrics = self._load_metrics()
        cycle_metrics = [m for m in metrics if m.get('cycle') == cycle_number]

        return {
            "cycle": cycle_number,
            "agent_count": len(cycle_metrics),
            "success_rate": sum(1 for m in cycle_metrics if m.get('success')) / len(cycle_metrics) if cycle_metrics else 0,
            "total_progress_made": any(m.get('progress_made') for m in cycle_metrics),
            "agents": {m['agent']: m for m in cycle_metrics}
        }

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Get summary metrics across all cycles."""
        metrics = self._load_metrics()

        if not metrics:
            return {"total_cycles": 0, "total_executions": 0}

        total_executions = len(metrics)
        successful_executions = sum(1 for m in metrics if m.get('success'))
        progress_made_count = sum(1 for m in metrics if m.get('progress_made'))

        return {
            "total_cycles": max((m.get('cycle', 0) for m in metrics), default=0),
            "total_executions": total_executions,
            "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
            "progress_rate": progress_made_count / total_executions if total_executions > 0 else 0,
            "most_active_agent": self._get_most_active_agent(metrics)
        }

    def _get_most_active_agent(self, metrics: List[Dict]) -> str:
        """Find the most active agent."""
        agent_counts = {}
        for metric in metrics:
            agent = metric.get('agent', 'unknown')
            agent_counts[agent] = agent_counts.get(agent, 0) + 1

        return max(agent_counts.items(), key=lambda x: x[1])[0] if agent_counts else "none"

    def _load_metrics(self) -> List[Dict[str, Any]]:
        """Load metrics from file."""
        if not self.metrics_file.exists():
            return []

        try:
            return json.loads(self.metrics_file.read_text())
        except json.JSONDecodeError:
            return []


class ProjectContextManager:
    """Manages project context and notes."""

    def __init__(self, rumfor_dir: Path):
        self.context_file = rumfor_dir / "context.json"
        self.notes_file = rumfor_dir / "project_notes.md"

    def set_context(self, context: str, notes: Optional[str] = None) -> None:
        """Set the current project context."""
        context_data = {
            "current_context": context,
            "set_at": datetime.now().isoformat(),
            "notes": notes
        }

        self.context_file.write_text(json.dumps(context_data, indent=2))

        # Also add to project notes if provided
        if notes:
            self.add_note(f"Context set: {context}", notes)

    def get_current_focus(self) -> Dict[str, Any]:
        """Get the current project focus."""
        if not self.context_file.exists():
            return {"context": "No context set", "notes": None}

        try:
            return json.loads(self.context_file.read_text())
        except json.JSONDecodeError:
            return {"error": "Could not read context"}

    def add_note(self, title: str, content: str) -> None:
        """Add a note to the project notes."""
        timestamp = datetime.now().isoformat()
        note_entry = f"## {title}\n**{timestamp}**\n\n{content}\n\n---\n\n"

        # Append to notes file
        if self.notes_file.exists():
            existing_content = self.notes_file.read_text()
            self.notes_file.write_text(note_entry + existing_content)
        else:
            self.notes_file.write_text(f"# Project Notes\n\n{note_entry}")

    def get_recent_notes(self, limit: int = 5) -> str:
        """Get recent project notes."""
        if not self.notes_file.exists():
            return "No notes available"

        content = self.notes_file.read_text()

        # Simple extraction of recent notes (can be improved)
        sections = content.split("---")
        recent_sections = sections[:limit]

        return "---".join(recent_sections)


def main():
    """Main entry point for running the orchestrator."""
    import argparse

    parser = argparse.ArgumentParser(description="Rumfor Infinity Rule List Orchestrator")
    parser.add_argument("--cycle", action="store_true", help="Run full development cycle")
    parser.add_argument("--agent", help="Run specific agent (e.g., frontend, backend)")
    parser.add_argument("--context", help="Set project context")
    parser.add_argument("--notes", help="Add project notes")
    parser.add_argument("--status", action="store_true", help="Show system status")

    args = parser.parse_args()

    orchestrator = RumforOrchestrator()

    if args.context or args.notes:
        orchestrator.set_project_context(args.context or "General development", args.notes)
        print("✅ Project context updated")

    if args.status:
        context = orchestrator.get_project_context()
        print("📊 System Status:")
        print(f"  Current Cycle: {context['current_cycle']}")
        print(f"  Active Agents: {', '.join(context['active_agents'])}")
        print(f"  Current Focus: {context['current_focus'].get('current_context', 'None set')}")
        print(f"  Git Status: {context['git_status']}")

    elif args.cycle:
        print("🚀 Starting full development cycle...")
        result = orchestrator.run_full_cycle()

        print(f"✅ Cycle {result.cycle_number} completed in {result.duration_seconds:.1f}s")
        print(f"📊 Results: {len(result.agents_succeeded)}/{len(result.agents_executed)} agents succeeded")
        if result.git_checkpoints_created:
            print(f"💾 Created {len(result.git_checkpoints_created)} git checkpoints")

    elif args.agent:
        print(f"🤖 Running {args.agent} agent...")
        result = orchestrator.run_single_agent(args.agent)
        print(f"✅ Result: {result.message}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()