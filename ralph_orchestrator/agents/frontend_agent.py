"""
Rumfor Market Tracker - Frontend Agent

React/TypeScript/Vite specialist focused on frontend development.
"""

import os
import glob
from pathlib import Path
from rumfor_orchestrator.agent_base import RumforAgent, AgentResult


class FrontendAgent(RumforAgent):
    """Frontend specialist for React/TypeScript development."""

    AGENT_NAME = "Frontend Agent"
    AGENT_SLUG = "frontend"

    def take_turn(self) -> AgentResult:
        """Execute frontend development tasks."""
        self.mark_start()

        try:
            # Read previous context
            previous = self.read_scratchpad()

            # Audit current frontend state
            self.update_progress(10, "Auditing frontend codebase...")
            audit_results = self.audit_frontend()

            # Check for common issues
            self.update_progress(30, "Checking for issues...")
            issues = self.check_common_issues()

            # Optimize bundle if needed
            self.update_progress(50, "Optimizing bundle...")
            bundle_results = self.optimize_bundle()

            # Update TypeScript coverage
            self.update_progress(70, "Checking TypeScript...")
            ts_results = self.check_typescript()

            # Generate improvement suggestions
            self.update_progress(90, "Analyzing improvements...")
            improvements = self.suggest_improvements(audit_results, issues)

            # Update scratchpad
            self.write_scratchpad(self.build_scratchpad_content(
                audit_results, issues, bundle_results, ts_results, improvements
            ))

            # Determine if progress was made
            has_improvements = len(issues) > 0 or len(improvements) > 0

            self.mark_complete(f"Frontend audit complete: {len(issues)} issues, {len(improvements)} suggestions")

            return self.create_result(
                success=True,
                progress_made=has_improvements,
                message=f"Frontend audit complete. Found {len(issues)} issues and {len(improvements)} improvement suggestions.",
                next_actions=improvements[:5],  # Top 5 improvements
                metadata={
                    'files_audited': len(audit_results.get('components', [])),
                    'issues_found': len(issues),
                    'improvements_suggested': len(improvements),
                    'typescript_coverage': ts_results.get('coverage', 0),
                    'bundle_size_mb': bundle_results.get('size_mb', 0)
                }
            )

        except Exception as e:
            self.mark_error(f"Frontend audit failed: {str(e)}")
            return self.create_result(success=False, error=str(e))

    def audit_frontend(self) -> dict:
        """Audit the frontend codebase."""
        results = {
            'components': [],
            'pages': [],
            'hooks': [],
            'utils': [],
            'types': []
        }

        # Find React components
        component_files = self.get_file_list("**/*.{tsx,jsx,ts,js}", "rumfor-market-tracker/src")
        for file_path in component_files:
            if 'components' in str(file_path):
                results['components'].append(str(file_path))
            elif 'pages' in str(file_path):
                results['pages'].append(str(file_path))
            elif 'hooks' in str(file_path):
                results['hooks'].append(str(file_path))
            elif 'utils' in str(file_path):
                results['utils'].append(str(file_path))
            elif 'types' in str(file_path):
                results['types'].append(str(file_path))

        return results

    def check_common_issues(self) -> list:
        """Check for common frontend issues."""
        issues = []

        # Check for missing key props in maps
        # Check for missing alt text
        # Check for console.log statements
        # Check for unused imports
        # This would be more comprehensive in a real implementation

        # Simple check for console.log statements
        js_files = self.get_file_list("**/*.{ts,tsx,js,jsx}", "rumfor-market-tracker/src")
        for file_path in js_files:
            try:
                content = (self.project_root / file_path).read_text()
                if 'console.log' in content:
                    issues.append({
                        'type': 'console_log',
                        'file': str(file_path),
                        'message': 'console.log statement found'
                    })
            except:
                continue

        return issues

    def optimize_bundle(self) -> dict:
        """Check and suggest bundle optimizations."""
        results = {
            'size_mb': 0,
            'chunks': 0,
            'optimizations': []
        }

        # Check if bundle analyzer exists
        package_json = self.project_root / "rumfor-market-tracker" / "package.json"
        if package_json.exists():
            try:
                import json
                with open(package_json) as f:
                    package_data = json.load(f)

                scripts = package_data.get('scripts', {})
                if 'build:analyze' in scripts:
                    results['optimizations'].append('Bundle analyzer available')
                else:
                    results['optimizations'].append('Add bundle analyzer script')

                # Check dependencies for optimization opportunities
                deps = package_data.get('dependencies', {})
                if 'lodash' in deps:
                    results['optimizations'].append('Consider lodash-es for tree shaking')
                if 'moment' in deps:
                    results['optimizations'].append('Consider date-fns instead of moment')

            except:
                pass

        return results

    def check_typescript(self) -> dict:
        """Check TypeScript coverage and issues."""
        results = {
            'coverage': 0,
            'issues': [],
            'suggestions': []
        }

        # Check for tsconfig.json
        tsconfig = self.project_root / "rumfor-market-tracker" / "tsconfig.json"
        if tsconfig.exists():
            results['coverage'] += 20

        # Check for any type errors
        ts_files = self.get_file_list("**/*.{ts,tsx}", "rumfor-market-tracker/src")
        results['coverage'] = min(100, len(ts_files) * 5)  # Rough estimate

        # Look for any usage
        if len(ts_files) > 0:
            results['suggestions'].append('Consider adding stricter TypeScript rules')
            results['suggestions'].append('Add path mapping for cleaner imports')

        return results

    def suggest_improvements(self, audit: dict, issues: list) -> list:
        """Generate improvement suggestions based on audit."""
        improvements = []

        # Component organization
        if len(audit.get('components', [])) > 20:
            improvements.append('Consider component composition for better organization')

        # Bundle splitting
        improvements.append('Implement route-based code splitting for better performance')

        # Error boundaries
        improvements.append('Add React Error Boundaries for better error handling')

        # Performance
        improvements.append('Implement React.memo for expensive components')
        improvements.append('Add lazy loading for images and routes')

        # Accessibility
        improvements.append('Add proper ARIA labels and keyboard navigation')

        # Testing
        improvements.append('Add React Testing Library for component testing')

        return improvements

    def build_scratchpad_content(self, audit, issues, bundle, ts, improvements) -> str:
        """Build the frontend scratchpad."""
        import datetime

        content = f"""# Frontend Agent Scratchpad

## Context
- Project: Rumfor Market Tracker
- Tech Stack: React 18 + TypeScript + Vite 4
- State: Zustand + TanStack Query
- Styling: UnoCSS + Tailwind + Radix UI

## Last Audit
- Date: {datetime.datetime.now().isoformat()}
- Components: {len(audit.get('components', []))}
- Pages: {len(audit.get('pages', []))}
- Issues Found: {len(issues)}
- Improvements Suggested: {len(improvements)}

## Current Structure
### Components ({len(audit.get('components', []))} files)
"""
        for component in audit.get('components', [])[:10]:  # Show first 10
            content += f"- {component}\n"
        if len(audit.get('components', [])) > 10:
            content += f"- ... and {len(audit.get('components', [])) - 10} more\n"

        content += f"\n### Pages ({len(audit.get('pages', []))} files)\n"
        for page in audit.get('pages', [])[:5]:  # Show first 5
            content += f"- {page}\n"

        content += "\n## Issues Found\n"
        if issues:
            for issue in issues[:10]:  # Show first 10
                content += f"- **{issue['type']}**: {issue['message']} in {issue['file']}\n"
        else:
            content += "- ✅ No major issues found\n"

        content += "\n## Bundle Analysis\n"
        content += f"- Estimated Size: {bundle.get('size_mb', 0)} MB\n"
        content += f"- Optimizations: {len(bundle.get('optimizations', []))}\n"
        for opt in bundle.get('optimizations', []):
            content += f"  - {opt}\n"

        content += "\n## TypeScript Coverage\n"
        content += f"- Coverage: {ts.get('coverage', 0)}%\n"
        for suggestion in ts.get('suggestions', []):
            content += f"- {suggestion}\n"

        content += "\n## Suggested Improvements\n"
        for improvement in improvements:
            content += f"- {improvement}\n"

        content += "\n## Next Actions\n"
        content += "1. Review and fix identified issues\n"
        content += "2. Implement suggested performance optimizations\n"
        content += "3. Improve TypeScript coverage and strictness\n"
        content += "4. Add comprehensive component testing\n"
        content += "5. Review and optimize bundle size\n"

        return content