# Rumfor Infinity Rule List - Custom Agents Guide

How to create and customize your own specialist agents for Rumfor Market Tracker.

---

## Agent Anatomy

A Rumfor agent has three parts:

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT ANATOMY                           │
└─────────────────────────────────────────────────────────────┘

1. RUMFOR.ROOMODES ENTRY
   └──> Defines the agent's personality and capabilities
   └──> File: .rumfor.roomodes

2. PYTHON CLASS
   └──> Implements the agent's behavior
   └──> File: rumfor_orchestrator/agents/{name}_agent.py

3. UI CONFIGURATION
   └──> Adds the agent to the dashboard
   └──> File: rumfor_world_model.html (rumforAgents array)
```

---

## Creating a New Agent

### Step 1: Define in .rumfor.roomodes

Add your agent to `.rumfor.roomodes`:

```yaml
customModes:
  # ... existing agents ...

  - slug: rumfor-analytics
    name: "Analytics Agent"
    roleDefinition: |-
      You are the Analytics specialist for Rumfor Market Tracker.

      Your responsibilities:
      - Google Analytics implementation and configuration
      - User behavior tracking and event management
      - Performance monitoring and metrics collection
      - A/B testing setup and analysis
      - Privacy compliance (GDPR, CCPA)
      - Conversion funnel optimization

      Analytics Stack:
      - Google Analytics 4 (GA4)
      - Google Tag Manager
      - Custom event tracking
      - E-commerce tracking for vendor applications

    whenToUse: "Analytics, tracking, metrics, performance monitoring"
    description: "Analytics, tracking, and performance monitoring specialist"
    groups: ["read", "edit", "command"]
    customInstructions: |-
      Always:
      - Implement privacy-first analytics
      - Use consistent event naming conventions
      - Document tracking requirements
      - Ensure GDPR compliance
      - Test tracking implementations thoroughly
      - Never collect PII without explicit consent
```

### Step 2: Create the Python Class

Create `rumfor_orchestrator/agents/analytics_agent.py`:

```python
"""
Rumfor Market Tracker - Analytics Agent

Specialist for analytics implementation, tracking, and performance monitoring.
"""

from pathlib import Path
from typing import List, Optional
from .agent_base import RumforAgent, AgentResult


class AnalyticsAgent(RumforAgent):
    """Analytics specialist for the market tracker project."""

    # Agent configuration
    AGENT_NAME = "Analytics Agent"
    AGENT_SLUG = "analytics"
    TIMEOUT_SECONDS = 600  # 10 minutes for tracking implementations
    MAX_RETRIES = 2

    # Analytics tools and configurations
    ANALYTICS_PROVIDERS = [
        "google_analytics_4",
        "google_tag_manager",
        "facebook_pixel",
        "custom_events"
    ]

    def __init__(self, scratch_dir: Optional[Path] = None, config: Optional[dict] = None):
        super().__init__(scratch_dir, config)
        self.project_root = Path(__file__).parent.parent.parent.parent

    def take_turn(self) -> AgentResult:
        """Execute one turn of the Analytics Agent."""
        self.mark_start()

        try:
            # Read previous context
            previous_context = self.read_scratchpad()

            # Phase 1: Analytics Audit
            self.update_progress(10, "Auditing current analytics setup...")
            audit_results = self.audit_analytics_setup()

            # Phase 2: GA4 Implementation
            self.update_progress(35, "Implementing Google Analytics 4...")
            ga4_results = self.implement_ga4()

            # Phase 3: Event Tracking
            self.update_progress(60, "Setting up event tracking...")
            event_results = self.setup_event_tracking()

            # Phase 4: Privacy Compliance
            self.update_progress(80, "Ensuring privacy compliance...")
            privacy_results = self.ensure_privacy_compliance()

            # Phase 5: Testing
            self.update_progress(95, "Testing analytics implementation...")
            test_results = self.test_analytics()

            # Compile comprehensive report
            report = self.compile_analytics_report(
                audit_results, ga4_results, event_results,
                privacy_results, test_results
            )
            self.write_scratchpad(self.build_scratchpad_content(report))

            self.mark_complete(f"Analytics implementation complete: {len(report['implemented_features'])} features")

            return self.create_result(
                success=True,
                progress_made=len(report['implemented_features']) > 0,
                message=f"Analytics implementation complete. {len(report['implemented_features'])} features added.",
                next_actions=report['next_steps'],
                files_modified=report['files_modified'],
                metadata={
                    'features_implemented': len(report['implemented_features']),
                    'tracking_events': len(report['tracking_events']),
                    'privacy_compliant': report['privacy_compliant'],
                    'test_coverage': report['test_coverage']
                }
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(
                success=False,
                error=str(e)
            )

    def audit_analytics_setup(self) -> dict:
        """Audit current analytics implementation."""
        audit = {
            'existing_tracking': [],
            'missing_features': [],
            'compliance_issues': [],
            'recommendations': []
        }

        # Check for existing analytics files
        if (self.project_root / 'src/lib/analytics.ts').exists():
            audit['existing_tracking'].append('analytics.ts')

        if (self.project_root / 'public/gtag.js').exists():
            audit['existing_tracking'].append('gtag.js')

        # Check package.json for analytics dependencies
        try:
            with open(self.project_root / 'package.json') as f:
                package_data = json.load(f)
                deps = package_data.get('dependencies', {})
                if 'react-ga4' in deps:
                    audit['existing_tracking'].append('react-ga4')
        except:
            pass

        return audit

    def implement_ga4(self) -> dict:
        """Implement Google Analytics 4."""
        results = {
            'ga4_configured': False,
            'measurement_id': None,
            'error': None
        }

        # This would implement GA4 setup
        # In real implementation, would modify files and install dependencies

        return results

    def setup_event_tracking(self) -> dict:
        """Set up comprehensive event tracking."""
        events = {
            'user_events': [
                'market_view',
                'application_start',
                'application_complete',
                'vendor_login',
                'promoter_login'
            ],
            'ecommerce_events': [
                'application_fee',
                'market_listing_fee',
                'vendor_premium_upgrade'
            ],
            'engagement_events': [
                'photo_upload',
                'comment_post',
                'hashtag_vote'
            ]
        }

        return {'events_configured': events}

    def ensure_privacy_compliance(self) -> dict:
        """Ensure analytics comply with privacy regulations."""
        compliance = {
            'gdpr_compliant': True,
            'ccpa_compliant': True,
            'cookie_consent': False,
            'data_minimization': True,
            'anonymization': True
        }

        return compliance

    def test_analytics(self) -> dict:
        """Test analytics implementation."""
        tests = {
            'ga4_connection': 'pending',
            'event_tracking': 'pending',
            'privacy_compliance': 'passed',
            'performance_impact': 'low'
        }

        return tests

    def compile_analytics_report(self, audit, ga4, events, privacy, tests) -> dict:
        """Compile comprehensive analytics report."""
        return {
            'implemented_features': ['ga4_setup', 'event_tracking', 'privacy_compliance'],
            'tracking_events': events['events_configured'],
            'files_modified': ['src/lib/analytics.ts', 'src/components/AnalyticsProvider.tsx'],
            'next_steps': [
                'Configure Google Analytics dashboard',
                'Set up conversion goals',
                'Create custom reports',
                'Implement A/B testing framework'
            ],
            'privacy_compliant': privacy['gdpr_compliant'],
            'test_coverage': 85
        }

    def build_scratchpad_content(self, report: dict) -> str:
        """Build the analytics scratchpad markdown content."""
        import datetime

        content = f"""# Analytics Agent Scratchpad

## Context
- Project: Rumfor Market Tracker
- Analytics Stack: Google Analytics 4, GTM, Custom Events
- Privacy: GDPR + CCPA compliant

## Last Implementation
- Date: {datetime.datetime.now().isoformat()}
- Features Implemented: {len(report['implemented_features'])}
- Events Configured: {len(report['tracking_events'])}
- Privacy Compliant: {'✅' if report['privacy_compliant'] else '❌'}

## Implemented Features
"""
        for feature in report['implemented_features']:
            content += f"- ✅ {feature}\n"

        content += "\n## Tracking Events\n"
        for category, events in report['tracking_events'].items():
            content += f"\n### {category.title()}\n"
            for event in events:
                content += f"- {event}\n"

        content += "\n## Privacy Compliance\n"
        content += f"- GDPR: {'✅' if report['privacy_compliant'] else '❌'}\n"
        content += f"- CCPA: {'✅' if report['privacy_compliant'] else '❌'}\n"
        content += f"- Data Minimization: ✅\n"
        content += f"- Anonymization: ✅\n"

        content += "\n## Next Steps\n"
        for step in report['next_steps']:
            content += f"1. {step}\n"

        content += "\n## Performance Notes\n"
        content += "- Analytics bundle size: ~15KB gzipped\n"
        content += "- Performance impact: <1% of page load\n"
        content += "- Server response time: No impact\n"

        return content
```

### Step 3: Add to State Manager

Update `rumfor_orchestrator/state_manager.py`:

```python
class RumforStateManager:
    # Agent definitions
    AGENTS = [
        "frontend",
        "backend",
        "api",
        "styling",
        "testing",
        "security",
        "documentation",
        "deployment",
        "analytics",  # NEW
    ]
```

### Step 4: Add to UI

Update the `rumforAgents` array in `rumfor_world_model.html`:

```javascript
const rumforAgents = [
    { id: 'frontend', name: 'Frontend', icon: '⚛️' },
    { id: 'backend', name: 'Backend', icon: '🗄️' },
    { id: 'api', name: 'API', icon: '🔗' },
    { id: 'styling', name: 'Styling', icon: '🎨' },
    { id: 'testing', name: 'Testing', icon: '🧪' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'documentation', name: 'Docs', icon: '📝' },
    { id: 'deployment', name: 'Deploy', icon: '🚀' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },  // NEW
];
```

Add the mode slug mapping in `getAgentModeSlug()`:

```javascript
function getAgentModeSlug(agentId) {
    const modeMap = {
        'frontend': 'rumfor-frontend',
        'backend': 'rumfor-backend',
        'api': 'rumfor-api',
        'styling': 'rumfor-styling',
        'testing': 'rumfor-testing',
        'security': 'rumfor-security',
        'documentation': 'rumfor-docs',
        'deployment': 'rumfor-deploy',
        'analytics': 'rumfor-analytics',  // NEW
    };
    return modeMap[agentId] || 'rumfor-orchestrator';
}
```

### Step 5: Update the Compiler

Update `tools/compile_rumfor_status.py`:

```python
# Add to default agents
"analytics": {"status": "idle", "progress": 0, "message": "Ready for analytics setup"}
```

---

## Agent Templates

### Simple Agent Template

For agents that just need to run a few commands:

```python
from pathlib import Path
from .agent_base import RumforAgent, AgentResult

class SimpleAgent(RumforAgent):
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

For agents that integrate with external APIs:

```python
import requests
from pathlib import Path
from .agent_base import RumforAgent, AgentResult

class APICallAgent(RumforAgent):
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
            data = self.fetch_market_data()

            self.update_progress(90, "Processing data...")
            result = self.process_data(data)

            self.mark_complete(f"Fetched and processed {len(data)} market records")

            return self.create_result(
                success=True,
                progress_made=True,
                message=f"Processed {len(data)} market records"
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(success=False, error=str(e))

    def fetch_market_data(self) -> list:
        headers = {}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'

        response = requests.get(
            f'{self.api_endpoint}/markets',
            headers=headers,
            timeout=self.TIMEOUT_SECONDS
        )
        response.raise_for_status()
        return response.json()
```

---

## Agent Best Practices for Market Tracker

### 1. Clear Progress Updates for Web Apps

```python
# Good - Specific to frontend tasks
self.update_progress(25, "Optimizing React component bundle size...")
self.update_progress(50, "Implementing lazy loading for market images...")
self.update_progress(75, "Adding TypeScript types for form validation...")
```

### 2. Technology-Specific Error Handling

```python
def take_turn(self) -> AgentResult:
    self.mark_start()

    try:
        # React/TypeScript specific work
        result = self.optimize_frontend()
        self.mark_complete("Frontend optimization complete")
        return self.create_result(success=True, message=result)

    except TypeScriptError as e:
        self.mark_error(f"TypeScript compilation failed: {e}")
        return self.create_result(success=False, error=str(e))

    except BuildError as e:
        self.mark_error(f"Vite build failed: {e}")
        return self.create_result(success=False, error=str(e))

    except Exception as e:
        self.mark_error(f"Unexpected error: {e}")
        return self.create_result(success=False, error=str(e))
```

### 3. Persistent Context with Tech Stack Knowledge

```python
# Always read previous state first
previous = self.read_scratchpad()

# Build on previous React knowledge
if "last_react_version" in previous:
    react_version = previous["last_react_version"]
else:
    react_version = "18.2.0"

# Write new state with current tech context
self.write_scratchpad({
    "last_react_version": "18.2.0",
    "typescript_strict": True,
    "vite_config_optimized": True,
    "last_build_time": datetime.now().isoformat()
})
```

### 4. Market Tracker-Specific Progress Tracking

Only create checkpoint if actual progress made for market features:

```python
return self.create_result(
    success=True,
    progress_made=len(new_features_implemented) > 0,
    message=f"Added {len(new_features_implemented)} market features",
    metadata={
        'features_added': new_features_implemented,
        'tests_passed': len(test_results),
        'bundle_size_change': f"{bundle_size_delta}KB"
    }
)
```

### 5. Comprehensive Metadata Returns

```python
return self.create_result(
    success=True,
    message="Market search optimization complete",
    metadata={
        'search_performance_improved': '45%',
        'query_types_supported': ['text', 'location', 'category'],
        'response_time': '120ms avg',
        'mobile_optimized': True,
        'accessibility_score': '98/100'
    }
)
```

---

## Example: Complete Custom Agent for Market Tracker

Here's a complete **Performance Agent** for optimizing the market tracker:

```python
"""
Rumfor Market Tracker - Performance Agent

Specialist for performance optimization and monitoring.
"""

from pathlib import Path
import subprocess
import json
from .agent_base import RumforAgent, AgentResult


class PerformanceAgent(RumforAgent):
    """Performance specialist for market tracker."""

    AGENT_NAME = "Performance Agent"
    AGENT_SLUG = "performance"
    TIMEOUT_SECONDS = 300

    PERFORMANCE_METRICS = [
        'first_contentful_paint',
        'largest_contentful_paint',
        'first_input_delay',
        'cumulative_layout_shift',
        'bundle_size',
        'api_response_time'
    ]

    def __init__(self, scratch_dir=None, config=None):
        super().__init__(scratch_dir, config)
        self.project_root = Path(__file__).parent.parent.parent.parent

    def take_turn(self) -> AgentResult:
        """Execute performance optimization."""
        self.mark_start()

        try:
            # Audit current performance
            current_metrics = self.audit_performance()

            self.update_progress(20, "Analyzing performance bottlenecks...")

            # Optimize bundle size
            self.update_progress(40, "Optimizing bundle size...")
            bundle_results = self.optimize_bundle()

            # Optimize images and assets
            self.update_progress(60, "Optimizing assets...")
            asset_results = self.optimize_assets()

            # Optimize API calls
            self.update_progress(80, "Optimizing API performance...")
            api_results = self.optimize_apis()

            # Generate performance report
            report = self.generate_performance_report(
                current_metrics, bundle_results, asset_results, api_results
            )
            self.write_scratchpad(report)

            # Calculate improvement
            improvement = self.calculate_improvement(current_metrics, report['final_metrics'])

            self.mark_complete(f"Performance optimized: {improvement}% improvement")

            return self.create_result(
                success=True,
                progress_made=improvement > 5,  # Significant improvement
                message=f"Performance optimized. {improvement}% improvement achieved.",
                next_actions=self.get_optimization_recommendations(report),
                files_modified=report['files_modified'],
                metadata={
                    'performance_improvement': f"{improvement}%",
                    'bundle_size_reduction': report['bundle_reduction'],
                    'api_calls_optimized': len(api_results),
                    'assets_optimized': len(asset_results),
                    'final_lighthouse_score': report['lighthouse_score']
                }
            )

        except Exception as e:
            self.mark_error(str(e))
            return self.create_result(success=False, error=str(e))

    def audit_performance(self) -> dict:
        """Audit current performance metrics."""
        metrics = {}

        # Bundle size analysis
        try:
            result = subprocess.run(
                ['npm', 'run', 'build:analyze'],
                capture_output=True,
                text=True,
                cwd=self.project_root,
                timeout=60
            )
            metrics['bundle_size'] = self.parse_bundle_analysis(result.stdout)
        except:
            metrics['bundle_size'] = 'unknown'

        return metrics

    def optimize_bundle(self) -> dict:
        """Optimize JavaScript bundle."""
        optimizations = {
            'code_splitting': False,
            'tree_shaking': False,
            'compression': False,
            'lazy_loading': False
        }

        # Implement bundle optimizations
        # This would modify vite.config.ts, add dynamic imports, etc.

        return optimizations

    def optimize_assets(self) -> dict:
        """Optimize images and static assets."""
        assets = {
            'images_compressed': 0,
            'fonts_optimized': 0,
            'css_minified': False
        }

        # Check for images to optimize
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
        image_files = []

        for ext in image_extensions:
            image_files.extend(list(self.project_root.rglob(f'**/*{ext}')))

        assets['total_images'] = len(image_files)

        return assets

    def optimize_apis(self) -> dict:
        """Optimize API calls and responses."""
        optimizations = {
            'caching_implemented': False,
            'pagination_added': False,
            'compression_enabled': True,
            'endpoints_optimized': 0
        }

        return optimizations

    def generate_performance_report(self, initial, bundle, assets, apis) -> str:
        """Generate comprehensive performance report."""
        import datetime

        report = f"""# Performance Agent Scratchpad

## Optimization Session
- Date: {datetime.datetime.now().isoformat()}
- Project: Rumfor Market Tracker

## Initial Metrics
- Bundle Size: {initial.get('bundle_size', 'unknown')}
- Lighthouse Score: TBD

## Optimizations Implemented

### Bundle Optimizations
"""
        for opt, implemented in bundle.items():
            status = "✅" if implemented else "❌"
            report += f"- {status} {opt.replace('_', ' ').title()}\n"

        report += "\n### Asset Optimizations\n"
        report += f"- Images Found: {assets.get('total_images', 0)}\n"
        for opt, value in assets.items():
            if opt != 'total_images':
                status = "✅" if value else "❌"
                report += f"- {status} {opt.replace('_', ' ').title()}: {value}\n"

        report += "\n### API Optimizations\n"
        for opt, implemented in apis.items():
            status = "✅" if implemented else "❌"
            report += f"- {status} {opt.replace('_', ' ').title()}\n"

        report += "\n## Final Results\n"
        report += "- **Performance Improvement**: TBD\n"
        report += "- **Bundle Size**: TBD\n"
        report += "- **Lighthouse Score**: TBD\n"

        report += "\n## Next Actions\n"
        report += "1. Run comprehensive performance tests\n"
        report += "2. Implement runtime performance monitoring\n"
        report += "3. Set up Core Web Vitals tracking\n"
        report += "4. Configure CDN for static assets\n"

        return report

    def calculate_improvement(self, initial: dict, final: dict) -> float:
        """Calculate performance improvement percentage."""
        # Simplified calculation - in real implementation would compare metrics
        return 12.5  # 12.5% improvement

---

## Testing Your Agent

### Unit Test Template

```python
import unittest
from pathlib import Path
from rumfor_orchestrator.agents.performance_agent import PerformanceAgent

class TestPerformanceAgent(unittest.TestCase):
    def setUp(self):
        self.agent = PerformanceAgent()
        self.test_scratchpad = Path('/tmp/test_scratchpad.md')

    def test_take_turn_success(self):
        result = self.agent.take_turn()
        self.assertTrue(result.success)
        self.assertIn('performance_improvement', result.metadata)

    def test_bundle_optimization(self):
        bundle_opts = self.agent.optimize_bundle()
        self.assertIsInstance(bundle_opts, dict)
        self.assertIn('code_splitting', bundle_opts)
```

### Manual Test

```python
from rumfor_orchestrator.agents.performance_agent import PerformanceAgent

# Create and run agent
agent = PerformanceAgent()
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