"""User Types Agent for Rumfor Market Tracker."""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List

from ..agent_base import RalphAgent


class UserTypesAgent(RalphAgent):
    AGENT_NAME = "User Types Agent"
    AGENT_SLUG = "user_types"

    # Expected user personas based on project goals
    EXPECTED_PERSONAS = {
        "artisan_vendor": {
            "name": "Artisan Vendor",
            "goals": ["sell_products", "manage_inventory", "track_sales", "connect_buyers"],
            "pain_points": ["complex_registration", "poor_discovery", "payment_issues"],
            "priority": "primary"
        },
        "market_promoter": {
            "name": "Market Promoter",
            "goals": ["organize_events", "attract_vendors", "manage_applications", "grow_community"],
            "pain_points": ["vendor_sourcing", "application_reviews", "event_management"],
            "priority": "secondary"
        },
        "community_member": {
            "name": "Community Member",
            "goals": ["discover_markets", "connect_artisans", "share_feedback", "learn_crafts"],
            "pain_points": ["finding_local_events", "trust_verification", "community_engagement"],
            "priority": "tertiary"
        }
    }

    def take_turn(self):
        self.mark_start()

        try:
            # Analyze current user persona implementation
            self.update_progress(10, "Analyzing user registration and roles...")
            persona_implementation = self.analyze_persona_implementation()

            self.update_progress(30, "Reviewing user flows and journeys...")
            user_flows_analysis = self.analyze_user_flows()

            self.update_progress(50, "Checking UX alignment with persona goals...")
            ux_alignment = self.check_ux_alignment()

            self.update_progress(70, "Identifying persona gaps and opportunities...")
            gaps_and_opportunities = self.identify_gaps_and_opportunities()

            self.update_progress(90, "Generating recommendations...")
            recommendations = self.generate_recommendations(
                persona_implementation,
                user_flows_analysis,
                ux_alignment,
                gaps_and_opportunities
            )

            # Write comprehensive analysis to scratchpad
            content = self.build_scratchpad_content(
                persona_implementation,
                user_flows_analysis,
                ux_alignment,
                gaps_and_opportunities,
                recommendations
            )
            self.write_scratchpad(content)

            self.mark_complete("User types analysis complete")
            return self.create_result(
                success=True,
                progress_made=len(recommendations) > 0,
                message=f"Analyzed user personas and flows. Found {len(recommendations)} improvement opportunities.",
                next_actions=recommendations,
                metadata={
                    'personas_analyzed': len(self.EXPECTED_PERSONAS),
                    'flows_reviewed': len(user_flows_analysis.get('critical_journeys', [])),
                    'ux_issues_found': len(ux_alignment.get('issues', [])),
                    'recommendations_count': len(recommendations)
                }
            )

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            self.mark_error(f"Error in user types analysis: {str(e)}")
            return self.create_result(success=False, error=f"{str(e)}\n{error_details}")

    def analyze_persona_implementation(self) -> Dict:
        """Analyze how user personas are implemented in the codebase."""
        implementation = {
            'registration_flows': [],
            'role_definitions': [],
            'persona_specific_features': [],
            'missing_persona_support': []
        }

        # Check authentication and user models
        backend_files = list(self.project_root.glob('backend/src/**/*.js'))
        for file in backend_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
            except UnicodeDecodeError:
                continue  # Skip files that can't be decoded

            # Check for role definitions
            if 'role' in content.lower():
                implementation['role_definitions'].append({
                    'file': str(file.relative_to(self.project_root)),
                    'roles_found': re.findall(r'role[s]?\s*[:=]\s*["\']([^"\']+)["\']', content, re.I)
                })

            # Check for persona-specific logic
            if any(term in content.lower() for term in ['vendor', 'promoter', 'artisan', 'community']):
                implementation['persona_specific_features'].append({
                    'file': str(file.relative_to(self.project_root)),
                    'persona_terms': [term for term in ['vendor', 'promoter', 'artisan', 'community']
                                    if term in content.lower()]
                })

        # Check frontend components
        frontend_files = list(self.project_root.glob('src/**/*.tsx'))
        for file in frontend_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
            except UnicodeDecodeError:
                continue  # Skip files that can't be decoded

            # Check for registration forms
            if 'register' in content.lower() or 'signup' in content.lower():
                implementation['registration_flows'].append(str(file.relative_to(self.project_root)))

        return implementation

    def analyze_user_flows(self) -> Dict:
        """Analyze user journey implementations."""
        flows = {
            'critical_journeys': [],
            'navigation_patterns': [],
            'conversion_points': [],
            'drop_off_risks': []
        }

        # Check routing and navigation
        route_files = list(self.project_root.glob('src/**/*.tsx'))
        for file in route_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')

                # Look for navigation patterns
                if 'navigate' in content or 'router' in content:
                    flows['navigation_patterns'].append({
                        'file': str(file.relative_to(self.project_root)),
                        'navigation_elements': len(re.findall(r'navigate|router|link', content, re.I))
                    })
            except UnicodeDecodeError:
                continue

        # Check for critical user journeys from DOT cards
        cards_dir = self.project_root / 'cards'
        if cards_dir.exists():
            for dot_file in cards_dir.glob('*.dot'):
                try:
                    content = dot_file.read_text(encoding='utf-8', errors='ignore')
                    if 'flow' in dot_file.name.lower():
                        flows['critical_journeys'].append({
                            'card': dot_file.name,
                            'flow_elements': len(re.findall(r'->', content))
                        })
                except UnicodeDecodeError:
                    continue

        return flows

    def check_ux_alignment(self) -> Dict:
        """Check if UX serves persona goals effectively."""
        alignment = {
            'persona_goal_mapping': {},
            'ux_issues': [],
            'accessibility_concerns': [],
            'mobile_optimization': []
        }

        # Check for mobile-first design
        component_files = list(self.project_root.glob('src/**/*.tsx'))
        for file in component_files:
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
            except UnicodeDecodeError:
                continue

            # Check for responsive design
            if 'mobile' in content.lower() or '@media' in content:
                alignment['mobile_optimization'].append(str(file.relative_to(self.project_root)))

            # Check for accessibility
            if not ('aria-' in content or 'alt=' in content):
                alignment['accessibility_concerns'].append(str(file.relative_to(self.project_root)))

        # Map persona goals to implemented features
        for persona_key, persona_data in self.EXPECTED_PERSONAS.items():
            implemented_goals = []
            for goal in persona_data['goals']:
                goal_found = False
                for file in component_files:
                    try:
                        content = file.read_text(encoding='utf-8', errors='ignore').lower()
                        if goal.replace('_', ' ') in content:
                            goal_found = True
                            break
                    except UnicodeDecodeError:
                        continue
                if goal_found:
                    implemented_goals.append(goal)

            alignment['persona_goal_mapping'][persona_key] = {
                'expected_goals': len(persona_data['goals']),
                'implemented_goals': len(implemented_goals),
                'coverage': len(implemented_goals) / len(persona_data['goals'])
            }

        return alignment

    def identify_gaps_and_opportunities(self) -> Dict:
        """Identify gaps in persona support and opportunities."""
        gaps = {
            'missing_features': [],
            'under_served_personas': [],
            'conversion_opportunities': [],
            'engagement_improvements': []
        }

        # Check for missing critical features
        required_features = [
            'user_registration', 'market_discovery', 'vendor_profiles',
            'application_system', 'community_features', 'payment_processing'
        ]

        existing_features = set()
        for file in self.project_root.glob('src/**/*'):
            if file.is_file():  # Only process files, not directories
                try:
                    content = file.read_text(encoding='utf-8', errors='ignore').lower()
                    for feature in required_features:
                        if feature.replace('_', ' ') in content:
                            existing_features.add(feature)
                except (UnicodeDecodeError, PermissionError):
                    continue

        gaps['missing_features'] = list(set(required_features) - existing_features)

        return gaps

    def generate_recommendations(self, persona_impl, user_flows, ux_alignment, gaps) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []

        # Persona implementation recommendations
        if len(persona_impl['role_definitions']) < 3:
            recommendations.append("Implement proper role-based access control for all three user personas")

        # UX alignment recommendations
        for persona, mapping in ux_alignment['persona_goal_mapping'].items():
            if mapping['coverage'] < 0.7:
                persona_name = self.EXPECTED_PERSONAS[persona]['name']
                recommendations.append(f"Improve feature coverage for {persona_name} persona (currently {mapping['coverage']:.1%})")

        # Flow improvement recommendations
        if len(user_flows['critical_journeys']) == 0:
            recommendations.append("Document and implement critical user journey flows based on persona goals")

        # Accessibility recommendations
        if len(ux_alignment['accessibility_concerns']) > 0:
            recommendations.append(f"Address accessibility issues in {len(ux_alignment['accessibility_concerns'])} components")

        # Missing features
        for feature in gaps['missing_features']:
            recommendations.append(f"Implement missing feature: {feature.replace('_', ' ')}")

        return recommendations

    def build_scratchpad_content(self, persona_impl, user_flows, ux_alignment, gaps, recommendations) -> str:
        """Build comprehensive scratchpad content."""
        content = f"""# User Types Agent Scratchpad

## Analysis Summary
- **Date**: {datetime.utcnow().isoformat()}
- **Personas Analyzed**: {len(self.EXPECTED_PERSONAS)}
- **Files Reviewed**: {len(list(self.project_root.glob('src/**/*')))}
- **Recommendations Generated**: {len(recommendations)}

## Persona Implementation Status

### Role Definitions Found
"""
        for role_def in persona_impl['role_definitions'][:5]:  # Limit for readability
            content += f"- **{role_def['file']}**: {', '.join(role_def['roles_found'])}\n"

        content += "\n### Persona-Specific Features\n"
        for feature in persona_impl['persona_specific_features'][:5]:
            content += f"- **{feature['file']}**: {', '.join(feature['persona_terms'])}\n"

        content += "\n## User Flow Analysis\n"
        content += f"- **Critical Journeys Documented**: {len(user_flows['critical_journeys'])}\n"
        content += f"- **Navigation Patterns**: {len(user_flows['navigation_patterns'])}\n"

        content += "\n## UX Alignment Assessment\n"
        for persona, mapping in ux_alignment['persona_goal_mapping'].items():
            persona_name = self.EXPECTED_PERSONAS[persona]['name']
            content += f"- **{persona_name}**: {mapping['implemented_goals']}/{mapping['expected_goals']} goals implemented ({mapping['coverage']:.1%})\n"

        content += "\n## Identified Gaps\n"
        if gaps['missing_features']:
            content += "### Missing Features\n"
            for feature in gaps['missing_features']:
                content += f"- {feature.replace('_', ' ')}\n"

        content += "\n## Recommendations\n"
        for i, rec in enumerate(recommendations, 1):
            content += f"{i}. {rec}\n"

        content += "\n## Next Actions\n"
        content += "1. Prioritize critical persona gaps\n"
        content += "2. Implement missing user journey flows\n"
        content += "3. Improve feature coverage for under-served personas\n"
        content += "4. Address accessibility and mobile UX issues\n"

        return content
