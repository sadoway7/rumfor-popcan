# Ralph's Infinity Rule List - Custom Agents Guide

How to create and customize your own specialist agents.

---

## Agent Anatomy

A Ralph agent has three parts:

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT ANATOMY                           │
└─────────────────────────────────────────────────────────────┘

1. ROOMODES ENTRY
   └──> Defines the agent's personality and capabilities
   └──> File: .roomodes

2. PYTHON CLASS
   └──> Implements the agent's behavior
   └──> File: ralph_orchestrator/agents/{name}_agent.py

3. UI CONFIGURATION
   └──> Adds the agent to the dashboard
   └──> File: zoom_world_model.html (ralphAgents array)
```

---

## Creating a New Agent

### Step 1: Define in .roomodes

Add your agent to `.roomodes`:

```yaml
customModes:
  # ... existing agents ...

  - slug: agent9-security
    name: "Security Agent"
    roleDefinition: |-
      You are the Security specialist for YOUR_PROJECT.

      Your responsibilities:
      - Security audit and vulnerability scanning
      - Dependency security updates
      - Secret detection and management
      - Authentication and authorization review
      - Security testing and penetration testing

      Key Security Principles:
      - Defense in depth
      - Least privilege
      - Secure by default

    whenToUse: "Security audits, vulnerability scans, secret detection"
    description: "Security, vulnerability scanning, and secret detection specialist"
    groups: ["read", "edit", "command"]
    customInstructions: |-
      Always:
      - Run security scans before making changes
      - Check for exposed credentials
      - Verify dependency versions
      - Document security findings
      - Never commit secrets to git
```

### Step 2: Create the Python Class

Create `ralph_orchestrator/agents/security_agent.py`:

```python
"""
Chimera VR - Security Agent

Specialist for security audits, vulnerability scanning, and secret detection.
"""

from pathlib import Path
from typing import List, Optional
from .agent_base import RalphAgent, AgentResult


class SecurityAgent(RalphAgent):
    """Security specialist for the project."""

    # Agent configuration
    AGENT_NAME = "Security Agent"
    AGENT_SLUG = "security"
    TIMEOUT_SECONDS = 600  # 10 minutes for scans
    MAX_RETRIES = 2

    # Security tools to use
    SECURITY_TOOLS = [
        "bandit",      # Python security linter
        "safety",      # Dependency vulnerability scanner
        "git-secrets", # Secret detection
        "trivy",       # Container scanner
    ]

    def __init__(self, scratch_dir: Optional[Path] = None, config: Optional[dict] = None):
        super().__init__(scratch_dir, config)
        self.project_root = Path(__file__).parent.parent.parent.parent

    def take_turn(self) -> AgentResult:
        """Execute one turn of the Security Agent."""
        self.mark_start()

        try:
            # Read previous context
            previous_context = self.read_scratchpad()

            # Phase 1: Security Scan
            self.update_progress(10, "Running security scan...")
            scan_results = self.run_security_scan()

            # Phase 2: Dependency Check
            self.update_progress(40, "Checking dependencies...")
            dependency_results = self.check_dependencies()

            # Phase 3: Secret Detection
            self.update_progress(70, "Scanning for secrets...")
            secret_results = self.scan_for_secrets()

            # Phase 4: Compile Report
            self.update_progress(90, "Compiling security report...")
            report = self.compile_report(scan_results, dependency_results, secret_results)

            # Update scratchpad with findings
            self.write_scratchpad(self.build_scratchpad_content(report))

            self.mark_complete(f"Security scan complete: {len(report['findings'])} findings")

            return self.create_result(
                success=True,
                progress_made=len(report['findings']) > 0,
                message=f"Security scan complete. {len(report['findings'])} findings.",
                next_actions=report['recommendations'],
                files_modified=report['files_changed'],
                metadata={
                    'findings_count': len(report['findings']),
                    'critical': len([f for f in report['findings'] if f['severity'] == 'critical']),
                    'scan_duration_seconds': report['duration']
                }
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(
                success=False,
                error=str(e)
            )

    def run_security_scan(self) -> dict:
        """Run security scanning tools."""
        results = {
            'bandit': self.run_bandit(),
            'safety': self.run_safety(),
        }
        return results

    def run_bandit(self) -> dict:
        """Run Bandit security linter."""
        import subprocess

        try:
            result = subprocess.run(
                ['bandit', '-r', str(self.project_root / 'src'), '-f', 'json'],
                capture_output=True,
                text=True,
                timeout=300
            )
            return {'output': result.stdout, 'errors': result.stderr}
        except FileNotFoundError:
            return {'error': 'Bandit not installed'}
        except subprocess.TimeoutExpired:
            return {'error': 'Bandit scan timed out'}

    def run_safety(self) -> dict:
        """Run Safety dependency scanner."""
        import subprocess

        try:
            result = subprocess.run(
                ['safety', 'check', '--json'],
                capture_output=True,
                text=True,
                timeout=120,
                cwd=self.project_root
            )
            return {'output': result.stdout, 'errors': result.stderr}
        except FileNotFoundError:
            return {'error': 'Safety not installed'}

    def check_dependencies(self) -> dict:
        """Check for vulnerable dependencies."""
        # Implementation depends on your package manager
        return {'status': 'checked'}

    def scan_for_secrets(self) -> dict:
        """Scan for potential secrets in code."""
        import re
        from pathlib import Path

        secrets = []
        secret_patterns = [
            r'api[_-]?key\s*=\s*["\'][^"\']+["\']',
            r'password\s*=\s*["\'][^"\']+["\']',
            r'secret[_-]?key\s*=\s*["\'][^"\']+["\']',
            r'token\s*=\s*["\'][^"\']+["\']',
            r'AKIA[0-9A-Z]{16}',  # AWS access key
        ]

        for py_file in self.project_root.rglob('*.py'):
            content = py_file.read_text()
            for pattern in secret_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    secrets.append({
                        'file': str(py_file.relative_to(self.project_root)),
                        'line': content[:match.start()].count('\n') + 1,
                        'pattern': pattern,
                        'context': content[max(0, match.start()-30):match.end()+30]
                    })

        return {'secrets': secrets}

    def compile_report(self, scan_results: dict, dependency_results: dict, secret_results: dict) -> dict:
        """Compile all security findings into a report."""
        findings = []

        # Process scan results
        # ... compile findings from all sources

        return {
            'findings': findings,
            'recommendations': self.generate_recommendations(findings),
            'files_changed': [],
            'duration': 0
        }

    def generate_recommendations(self, findings: list) -> List[str]:
        """Generate security recommendations."""
        recommendations = []

        # Add recommendations based on findings
        if any(f['severity'] == 'critical' for f in findings):
            recommendations.append("Address critical findings immediately")

        recommendations.append("Schedule quarterly security audits")
        recommendations.append("Enable automated security scanning in CI/CD")

        return recommendations

    def build_scratchpad_content(self, report: dict) -> str:
        """Build the scratchpad markdown content."""
        import datetime

        content = f"""# Security Agent Scratchpad

## Context
- Project: {self.project_root.name}
- Security Tools: {', '.join(self.SECURITY_TOOLS)}

## Last Scan
- Date: {datetime.datetime.now().isoformat()}
- Findings: {len(report['findings'])}
- Critical: {len([f for f in report['findings'] if f['severity'] == 'critical'])}

## Findings
"""
        for finding in report['findings']:
            content += f"\n### [{finding['severity'].upper()}] {finding['title']}\n"
            content += f"- **Location**: {finding['location']}\n"
            content += f"- **Description**: {finding['description']}\n"
            content += f"- **Remediation**: {finding['remediation']}\n"

        content += "\n## Recommendations\n"
        for rec in report['recommendations']:
            content += f"- {rec}\n"

        content += "\n## Next Actions\n"
        content += "1. Review and address critical findings\n"
        content += "2. Update dependencies with vulnerabilities\n"
        content += "3. Rotate any exposed credentials\n"

        return content
```

### Step 3: Add to State Manager

Update `ralph_orchestrator/state_manager.py`:

```python
class RalphStateManager:
    # Agent definitions
    AGENTS = [
        "build",
        "assets",
        "world_data",
        "vr",
        "physics",
        "testing",
        "screenshot",
        "documentation",
        "security",  # NEW
    ]
```

### Step 4: Add to UI

Update the `ralphAgents` array in `zoom_world_model.html`:

```javascript
const ralphAgents = [
    { id: 'build', name: 'Build', icon: '🔨' },
    { id: 'assets', name: 'Assets', icon: '📦' },
    { id: 'world_data', name: 'World Data', icon: '🌍' },
    { id: 'vr', name: 'VR', icon: '🥽' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'testing', name: 'Testing', icon: '🧪' },
    { id: 'screenshot', name: 'Screenshot', icon: '📷' },
    { id: 'documentation', name: 'Documentation', icon: '📝' },
    { id: 'security', name: 'Security', icon: '🔒' },  // NEW
];
```

Add the mode slug mapping in `getAgentModeSlug()`:

```javascript
function getAgentModeSlug(agentId) {
    const modeMap = {
        'build': 'agent1-build',
        'assets': 'agent2-assets',
        'world_data': 'agent3-world',
        'vr': 'agent4-vr',
        'physics': 'agent5-physics',
        'testing': 'agent6-testing',
        'screenshot': 'agent8-screenshot',
        'documentation': 'agent7-docs',
        'security': 'agent9-security',  // NEW
    };
    return modeMap[agentId] || 'ralph-orchestrator';
}
```

### Step 5: Update the Compiler

Update `tools/compile_ralph_status.py`:

```python
# Add to default agents
"security": {"status": "idle", "progress": 0, "message": "Ready"}
```

---

## Agent Templates

### Simple Agent Template

For agents that just need to run a few commands:

```python
from pathlib import Path
from .agent_base import RalphAgent, AgentResult

class SimpleAgent(RalphAgent):
    AGENT_NAME = "Simple Agent"
    AGENT_SLUG = "simple"

    def take_turn(self) -> AgentResult:
        self.mark_start()

        # Do your work
        result = self.do_work()

        self.mark_complete(f"Completed: {result}")

        return self.create_result(
            success=True,
            progress_made=True,
            message=f"Work complete: {result}"
        )

    def do_work(self) -> str:
        # Implement your agent's work here
        return "something useful"
```

### API-Calling Agent Template

For agents that need to call external APIs:

```python
import requests
from pathlib import Path
from .agent_base import RalphAgent, AgentResult

class APICallAgent(RalphAgent):
    AGENT_NAME = "API Agent"
    AGENT_SLUG = "api_agent"
    TIMEOUT_SECONDS = 120

    def __init__(self, scratch_dir=None, config=None):
        super().__init__(scratch_dir, config)
        self.api_endpoint = config.get('api_endpoint', 'https://api.example.com')
        self.api_key = config.get('api_key')

    def take_turn(self) -> AgentResult:
        self.mark_start()

        try:
            self.update_progress(50, "Calling API...")
            data = self.fetch_data()

            self.update_progress(90, "Processing data...")
            result = self.process_data(data)

            self.mark_complete(f"Fetched and processed {len(data)} items")

            return self.create_result(
                success=True,
                progress_made=True,
                message=f"Processed {len(data)} items"
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(success=False, error=str(e))

    def fetch_data(self) -> list:
        headers = {}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'

        response = requests.get(
            f'{self.api_endpoint}/data',
            headers=headers,
            timeout=self.TIMEOUT_SECONDS
        )
        response.raise_for_status()
        return response.json()
```

### File-Processing Agent Template

For agents that process files:

```python
from pathlib import Path
from .agent_base import RalphAgent, AgentResult

class FileProcessorAgent(RalphAgent):
    AGENT_NAME = "File Processor"
    AGENT_SLUG = "file_processor"

    # File patterns to process
    PATTERNS = ['*.txt', '*.md', '*.py']
    EXCLUDE_DIRS = ['venv', 'node_modules', '.git']

    def __init__(self, scratch_dir=None, config=None):
        super().__init__(scratch_dir, config)
        self.project_root = Path(__file__).parent.parent.parent.parent

    def take_turn(self) -> AgentResult:
        self.mark_start()

        try:
            # Find files to process
            files = self.find_files()
            self.update_progress(20, f"Found {len(files)} files")

            # Process each file
            results = []
            for i, file in enumerate(files):
                self.update_progress(
                    20 + (i / len(files)) * 60,
                    f"Processing {file.name}..."
                )
                result = self.process_file(file)
                results.append(result)

            # Write summary
            self.write_scratchpad(self.build_summary(results))

            self.mark_complete(f"Processed {len(files)} files")

            return self.create_result(
                success=True,
                progress_made=len(results) > 0,
                message=f"Processed {len(files)} files",
                files_modified=[str(r) for r in results if r.changed]
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(success=False, error=str(e))

    def find_files(self) -> list[Path]:
        files = []
        for pattern in self.PATTERNS:
            for file in self.project_root.rglob(pattern):
                if not any(excl in str(file) for excl in self.EXCLUDE_DIRS):
                    files.append(file)
        return files

    def process_file(self, file: Path):
        """Override this in your subclass."""
        # Process the file and return result
        return ProcessResult(file=file, changed=False)
```

---

## Agent Best Practices

### 1. Clear Progress Updates

```python
# Good
self.update_progress(25, "Scanning source files...")
self.update_progress(50, "Analyzing dependencies...")
self.update_progress(75, "Generating report...")

# Bad
self.update_progress(50, "")  # No context
```

### 2. Handle Errors Gracefully

```python
def take_turn(self) -> AgentResult:
    self.mark_start()

    try:
        # Do work
        result = self.do_work()
        self.mark_complete("Done")
        return self.create_result(success=True, message=result)

    except FileNotFoundError as e:
        self.mark_error(f"File not found: {e}")
        return self.create_result(success=False, error=str(e))

    except Exception as e:
        self.mark_error(f"Unexpected error: {e}")
        return self.create_result(success=False, error=str(e))
```

### 3. Use Persistent Scratchpads

```python
# Always read previous state first
previous = self.read_scratchpad()

# Build on previous work
if "last_position" in previous:
    start_from = previous["last_position"]
else:
    start_from = 0

# Write new state
self.write_scratchpad(f"Last position: {end_position}")
```

### 4. Mark Progress Appropriately

```python
# Only create checkpoint if actual progress was made
return self.create_result(
    success=True,
    progress_made=len(fixed_bugs) > 0,  # Checkpoint only if we fixed something
    message=f"Fixed {len(fixed_bugs)} bugs"
)
```

### 5. Return Useful Metadata

```python
return self.create_result(
    success=True,
    message="Scan complete",
    metadata={
        'files_scanned': 150,
        'issues_found': 5,
        'duration_seconds': 45,
        'tools_used': ['bandit', 'safety']
    }
)
```

---

## Example: Complete Custom Agent

Here's a complete example of a Code Review Agent:

```python
"""
Chimera VR - Code Review Agent

Automated code review specialist.
"""

from pathlib import Path
import subprocess
import re
from .agent_base import RalphAgent, AgentResult


class CodeReviewAgent(RalphAgent):
    """Code review specialist."""

    AGENT_NAME = "Code Review Agent"
    AGENT_SLUG = "code_review"
    TIMEOUT_SECONDS = 300

    # Review categories
    CATEGORIES = [
        'complexity',    # Cyclomatic complexity
        'duplication',   # Code duplication
        'style',         # Style violations
        'security',      # Security issues
        'performance',   # Performance concerns
    ]

    def __init__(self, scratch_dir=None, config=None):
        super().__init__(scratch_dir, config)
        self.project_root = Path(__file__).parent.parent.parent.parent

    def take_turn(self) -> AgentResult:
        """Execute code review."""
        self.mark_start()

        try:
            # Get changed files since last review
            changed_files = self.get_changed_files()
            self.update_progress(20, f"Reviewing {len(changed_files)} files")

            # Run review checks
            findings = []
            for i, file in enumerate(changed_files):
                self.update_progress(
                    20 + (i / len(changed_files)) * 60,
                    f"Reviewing {file.relative_to(self.project_root)}"
                )
                findings.extend(self.review_file(file))

            # Generate report
            report = self.generate_report(findings)
            self.write_scratchpad(report)

            self.mark_complete(f"Reviewed {len(changed_files)} files, {len(findings)} findings")

            return self.create_result(
                success=True,
                progress_made=len(findings) > 0,
                message=f"Reviewed {len(changed_files)} files. {len(findings)} findings.",
                next_actions=self.get_recommendations(findings),
                files_modified=[str(f) for f in changed_files],
                metadata={
                    'files_reviewed': len(changed_files),
                    'findings_count': len(findings),
                    'by_category': self.categorize_findings(findings)
                }
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(success=False, error=str(e))

    def get_changed_files(self) -> list[Path]:
        """Get files changed since last checkpoint."""
        try:
            result = subprocess.run(
                ['git', 'diff', '--name-only', 'HEAD~1'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            files = []
            for line in result.stdout.strip().split('\n'):
                if line and line.endswith('.py'):
                    file_path = self.project_root / line
                    if file_path.exists():
                        files.append(file_path)
            return files
        except subprocess.CalledProcessError:
            return []

    def review_file(self, file: Path) -> list:
        """Review a single file."""
        findings = []
        content = file.read_text()
        lines = content.split('\n')

        # Check for complex functions
        findings.extend(self.check_complexity(file, lines))

        # Check for code smells
        findings.extend(self.check_smells(file, content))

        # Check for TODO/FIXME comments
        findings.extend(self.check_todos(file, content))

        return findings

    def check_complexity(self, file: Path, lines: list) -> list:
        """Check for overly complex functions."""
        findings = []
        function_lines = []
        function_name = None
        complexity = 1

        for i, line in enumerate(lines, 1):
            if re.match(r'^def \w+\(', line):
                function_name = line.strip()
                function_lines = []
                complexity = 1
            elif function_name:
                function_lines.append(i)
                # Count decision points
                complexity += line.count(' if ') + line.count(' for ') + line.count(' while ')
                if line.strip() and not line.startswith(' ') and not line.startswith('\t'):
                    # Function ended
                    if complexity > 10:
                        findings.append({
                            'file': str(file.relative_to(self.project_root)),
                            'line': function_lines[0] if function_lines else i,
                            'category': 'complexity',
                            'severity': 'medium',
                            'message': f"Function '{function_name}' has complexity {complexity}",
                            'recommendation': 'Consider breaking this function into smaller pieces'
                        })
                    function_name = None

        return findings

    def check_smells(self, file: Path, content: str) -> list:
        """Check for code smells."""
        findings = []

        # Long lines
        for i, line in enumerate(content.split('\n'), 1):
            if len(line) > 120:
                findings.append({
                    'file': str(file.relative_to(self.project_root)),
                    'line': i,
                    'category': 'style',
                    'severity': 'low',
                    'message': f"Line too long ({len(line)} characters)",
                    'recommendation': 'Break long lines or use line continuation'
                })

        # TODO/FIXME comments
        if 'TODO' in content or 'FIXME' in content:
            for match in re.finditer(r'(TODO|FIXME):(.+)', content):
                line_num = content[:match.start()].count('\n') + 1
                findings.append({
                    'file': str(file.relative_to(self.project_root)),
                    'line': line_num,
                    'category': 'style',
                    'severity': 'info',
                    'message': f"{match.group(1)} comment found",
                    'recommendation': match.group(2).strip()
                })

        return findings

    def check_todos(self, file: Path, content: str) -> list:
        """Check for TODO/FIXME/HACK comments."""
        return []  # Already covered in check_smells

    def generate_report(self, findings: list) -> str:
        """Generate markdown review report."""
        import datetime

        report = f"""# Code Review Agent Scratchpad

## Last Review
- Date: {datetime.datetime.now().isoformat()}
- Total Findings: {len(findings)}

## Findings by Severity
"""

        by_severity = {}
        for f in findings:
            severity = f['severity']
            by_severity.setdefault(severity, []).append(f)

        for severity in ['critical', 'high', 'medium', 'low', 'info']:
            if severity in by_severity:
                report += f"\n### {severity.upper()}: {len(by_severity[severity])}\n"
                for f in by_severity[severity][:10]:  # Limit to 10 per severity
                    report += f"\n- **{f['file']}:{f['line']}**\n"
                    report += f"  {f['message']}\n"
                    if f.get('recommendation'):
                        report += f"  💡 {f['recommendation']}\n"

        report += "\n## Next Actions\n"
        report += "1. Address critical and high findings\n"
        report += "2. Review medium severity items\n"
        report += "3. Consider style improvements\n"

        return report

    def get_recommendations(self, findings: list) -> list:
        """Generate action recommendations."""
        recommendations = []

        critical_count = len([f for f in findings if f['severity'] == 'critical'])
        high_count = len([f for f in findings if f['severity'] == 'high'])

        if critical_count > 0:
            recommendations.append(f"Address {critical_count} critical findings immediately")
        if high_count > 0:
            recommendations.append(f"Review {high_count} high-priority items")
        if len(findings) > 50:
            recommendations.append("Consider scheduling a dedicated refactoring sprint")

        return recommendations

    def categorize_findings(self, findings: list) -> dict:
        """Categorize findings by type."""
        by_category = {}
        for f in findings:
            category = f.get('category', 'other')
            by_category[category] = by_category.get(category, 0) + 1
        return by_category
```

---

## Testing Your Agent

### Unit Test Template

```python
import unittest
from pathlib import Path
from ralph_orchestrator.agents.security_agent import SecurityAgent

class TestSecurityAgent(unittest.TestCase):
    def setUp(self):
        self.agent = SecurityAgent()
        self.test_scratchpad = Path('/tmp/test_scratchpad.md')

    def test_take_turn_success(self):
        result = self.agent.take_turn()
        self.assertTrue(result.success)
        self.assertIn('findings_count', result.metadata)

    def test_scan_for_secrets(self):
        secrets = self.agent.scan_for_secrets()
        self.assertIsInstance(secrets, dict)
        self.assertIn('secrets', secrets)
```

### Manual Test

```python
from ralph_orchestrator.agents.security_agent import SecurityAgent

# Create and run agent
agent = SecurityAgent()
result = agent.take_turn()

print(f"Success: {result.success}")
print(f"Message: {result.message}")
print(f"Metadata: {result.metadata}")

# Check scratchpad
print("\nScratchpad:")
print(agent.read_scratchpad())
```

---

## Next Steps

- [Architecture](ARCHITECTURE.md) - Deep dive into system internals
- [Setup](SETUP.md) - Installation and configuration
- [Usage](USAGE.md) - How to use the system day-to-day
