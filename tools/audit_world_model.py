#!/usr/bin/env python3
"""
Rumfor Infinity - World Model Auditor

Analyzes the codebase and compares it against the world model to identify:
- Missing components, APIs, database models
- Outdated world model entries
- New features not yet tracked

Usage:
python tools/audit_world_model.py [--update] [--generate-html]
"""

import os
import json
import re
import glob
from pathlib import Path
from typing import Dict, List, Set, Tuple
import ast
import subprocess


class WorldModelAuditor:
    """Audits the world model against the actual codebase."""

    def __init__(self, project_root: Path):
        self.project_root = project_root.resolve()
        # Check if we're running from tools/ subdirectory
        if self.project_root.name == "tools":
            self.project_root = self.project_root.parent
        self.frontend_src = self.project_root / "rumfor-market-tracker" / "src"
        self.backend_src = self.project_root / "rumfor-market-tracker" / "backend"

    def analyze_codebase(self) -> Dict:
        """Analyze the actual codebase to extract components, APIs, etc."""
        print("🔍 Analyzing codebase...")

        analysis = {
            "components": self._analyze_components(),
            "apis": self._analyze_apis(),
            "pages": self._analyze_pages(),
            "features": self._infer_features(),
            "database": self._analyze_database_models(),
        }

        return analysis

    def _analyze_components(self) -> List[Dict]:
        """Extract React components from the codebase."""
        components = []

        # Find all .tsx/.ts files in components directory
        components_dir = self.frontend_src / "components"
        if components_dir.exists():
            tsx_files = glob.glob(str(components_dir / "**" / "*.tsx"), recursive=True) + glob.glob(str(components_dir / "**" / "*.ts"), recursive=True)
            for file_path_str in tsx_files:
                file_path = Path(file_path_str)
                if file_path.is_file():
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()

                        # Extract component name from export
                        component_name = self._extract_component_name(content)
                        if component_name:
                            # Determine category based on file location and content
                            category = self._categorize_component(file_path, content)

                            components.append({
                                "name": component_name,
                                "file": str(file_path.relative_to(self.frontend_src)),
                                "category": category,
                                "description": self._generate_component_description(component_name, category),
                                "pages": self._find_component_usage(component_name)
                            })
                    except Exception as e:
                        print(f"Error analyzing {file_path_str}: {e}")

        return components

    def _extract_component_name(self, content: str) -> str:
        """Extract component name from TypeScript/React code."""
        # Look for export default statements
        export_match = re.search(r'export default (\w+)', content)
        if export_match:
            return export_match.group(1)

        # Look for function/class declarations
        func_match = re.search(r'(?:export )?(?:function|const|class) (\w+)', content)
        if func_match:
            return func_match.group(1)

        return None

    def _categorize_component(self, file_path: Path, content: str) -> str:
        """Categorize component based on file path and content."""
        path_str = str(file_path)

        if 'form' in path_str.lower() or 'Form' in file_path.name:
            return 'form'
        elif 'ui' in path_str.lower() or 'UI' in path_str:
            return 'ui'
        elif 'dashboard' in path_str.lower() or 'Dashboard' in file_path.name:
            return 'dashboard'
        elif 'photo' in path_str.lower() or 'media' in path_str.lower():
            return 'media'
        elif 'comment' in path_str.lower() or 'social' in path_str.lower():
            return 'social'
        elif 'chart' in path_str.lower() or 'analytics' in path_str.lower():
            return 'analytics'
        elif 'nav' in path_str.lower() or 'navigation' in path_str.lower():
            return 'navigation'
        else:
            return 'ui'  # default

    def _generate_component_description(self, name: str, category: str) -> str:
        """Generate description based on component name and category."""
        descriptions = {
            'ui': f"Reusable UI component for {name.lower().replace('component', '').strip()}",
            'form': f"Form component for {name.lower().replace('form', '').replace('component', '').strip()}",
            'dashboard': f"Dashboard component displaying {name.lower().replace('dashboard', '').replace('component', '').strip()}",
            'media': f"Media component for {name.lower().replace('component', '').strip()}",
            'social': f"Social interaction component for {name.lower().replace('component', '').strip()}",
            'analytics': f"Analytics component showing {name.lower().replace('component', '').strip()}",
            'navigation': f"Navigation component for {name.lower().replace('component', '').strip()}"
        }
        return descriptions.get(category, f"React component: {name}")

    def _find_component_usage(self, component_name: str) -> List[str]:
        """Find where component is used in pages."""
        usage = []
        pages_dir = self.frontend_src / "pages"

        if pages_dir.exists():
            for page_file in pages_dir.rglob("*.tsx"):
                try:
                    with open(page_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if component_name in content:
                        usage.append(page_file.name.replace('.tsx', ''))
                except:
                    pass

        return usage

    def _analyze_apis(self) -> List[Dict]:
        """Extract API endpoints from backend code."""
        apis = []

        # Look for route definitions
        routes_dir = self.backend_src / "src" / "routes"
        if routes_dir.exists():
            for route_file in routes_dir.glob("*.js"):
                try:
                    with open(route_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Extract routes using regex
                    route_pattern = r'(?:router|app)\.(get|post|put|patch|delete)\([\'"]([^\'"]+)[\'"]'
                    matches = re.findall(route_pattern, content, re.IGNORECASE)

                    for method, path in matches:
                        apis.append({
                            "endpoint": f"{method.upper()} {path}",
                            "method": method.upper(),
                            "path": path,
                            "category": self._categorize_api(path),
                            "description": f"{method.upper()} endpoint for {path.split('/')[-1] or 'api'}"
                        })

                except Exception as e:
                    print(f"Error analyzing API routes in {route_file}: {e}")

        return apis

    def _categorize_api(self, path: str) -> str:
        """Categorize API endpoint."""
        if '/markets' in path:
            return 'markets'
        elif '/applications' in path:
            return 'applications'
        elif '/auth' in path:
            return 'auth'
        elif '/admin' in path:
            return 'admin'
        elif '/upload' in path:
            return 'media'
        else:
            return 'misc'

    def _analyze_pages(self) -> List[Dict]:
        """Extract page components and routes."""
        pages = []

        pages_dir = self.frontend_src / "pages"
        if pages_dir.exists():
            for page_file in pages_dir.rglob("*.tsx"):
                try:
                    with open(page_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    page_name = page_file.name.replace('.tsx', '')
                    route = self._infer_route_from_page(page_name, content)

                    pages.append({
                        "name": page_name,
                        "file": str(page_file.relative_to(self.frontend_src)),
                        "route": route,
                        "persona": self._infer_persona_from_page(page_name),
                        "description": self._generate_page_description(page_name)
                    })

                except Exception as e:
                    print(f"Error analyzing page {page_file}: {e}")

        return pages

    def _infer_route_from_page(self, page_name: str, content: str = "") -> str:
        """Infer route from page name."""
        route_map = {
            'HomePage': '/',
            'LoginPage': '/login',
            'RegisterPage': '/register',
            'ProfilePage': '/profile',
            'AdminDashboardPage': '/admin/dashboard',
            'AdminUsersPage': '/admin/users',
            'MarketDetailPage': '/market/:id',
            'MarketSearchPage': '/search',
            'ApplicationFormPage': '/apply/:marketId',
            'MyApplicationsPage': '/my-applications',
            'MyMarketsPage': '/my-markets',
            'PromoterDashboardPage': '/promoter/dashboard',
            'PromoterCreateMarketPage': '/promoter/market/create',
            'PromoterApplicationsPage': '/promoter/applications'
        }
        return route_map.get(page_name, f'/{page_name.lower().replace("page", "")}')

    def _infer_persona_from_page(self, page_name: str) -> str:
        """Infer target persona from page name."""
        if page_name.startswith('Admin'):
            return 'admin'
        elif page_name.startswith('Promoter'):
            return 'promoter'
        elif page_name in ['LoginPage', 'RegisterPage', 'ProfilePage', 'SettingsPage']:
            return 'all'
        else:
            return 'vendor'  # default

    def _generate_page_description(self, page_name: str) -> str:
        """Generate page description."""
        descriptions = {
            'HomePage': 'Main landing page with featured markets and hero content',
            'MarketDetailPage': 'Detailed market information with photos and application options',
            'MarketSearchPage': 'Advanced search and filtering for markets',
            'ApplicationFormPage': 'Multi-step form for vendor market applications',
            'MyApplicationsPage': 'Dashboard showing vendor application status',
            'AdminDashboardPage': 'Administrative overview and system metrics',
            'AdminUsersPage': 'User management and administration tools'
        }
        return descriptions.get(page_name, f'Page component: {page_name}')

    def _analyze_database_models(self) -> List[Dict]:
        """Extract database models from Mongoose schemas."""
        models = []

        models_dir = self.backend_src / "src" / "models"
        if models_dir.exists():
            for model_file in models_dir.glob("*.js"):
                try:
                    with open(model_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    model_name = model_file.stem
                    fields = self._extract_model_fields(content)

                    models.append({
                        "model": model_name,
                        "file": str(model_file.relative_to(self.backend_src)),
                        "fields": fields,
                        "category": self._categorize_model(model_name),
                        "description": f"MongoDB model for {model_name.lower()}"
                    })

                except Exception as e:
                    print(f"Error analyzing model {model_file}: {e}")

        return models

    def _extract_model_fields(self, content: str) -> List[str]:
        """Extract field names from Mongoose schema."""
        fields = []
        # Simple regex to find field definitions
        field_pattern = r'(\w+):\s*\{'
        matches = re.findall(field_pattern, content)
        return [m for m in matches if not m.startswith('_') and m not in ['timestamps', 'toJSON', 'toObject']]

    def _categorize_model(self, model_name: str) -> str:
        """Categorize database model."""
        if model_name in ['User']:
            return 'core'
        elif model_name in ['Market']:
            return 'markets'
        elif 'Application' in model_name:
            return 'applications'
        elif 'Photo' in model_name or 'Comment' in model_name:
            return 'media' if 'Photo' in model_name else 'social'
        else:
            return 'core'

    def _infer_features(self) -> List[Dict]:
        """Infer features from components and pages."""
        features = []

        # Analyze components to infer features
        for component in self._analyze_components():
            feature = {
                "name": f"{component['name']} Feature",
                "icon": "🧩",
                "description": component['description'],
                "category": f"component-{component['category']}",
                "persona": "developers",
                "components": [component['name']],
                "workflow": "ui-development"
            }
            features.append(feature)

        return features

    def compare_with_world_model(self, codebase_analysis: Dict) -> Dict:
        """Compare codebase analysis with current world model."""
        print("🔄 Comparing with current world model...")

        # This would compare with the hardcoded arrays in the HTML
        # For now, we'll just return the analysis
        return {
            "codebase": codebase_analysis,
            "recommendations": [
                "Update HTML world model arrays with current codebase analysis",
                "Add missing components discovered in scan",
                "Add missing API endpoints found in backend",
                "Add missing database models from MongoDB schemas",
                "Ensure all React pages are documented in world model"
            ]
        }

    def generate_world_model_update(self, analysis: Dict) -> Dict:
        """Generate JavaScript code to update the world model."""
        print("📝 Generating world model update...")

        # Generate JavaScript arrays for the HTML
        js_code = {
            "components_array": self._generate_js_array(analysis["components"], "component"),
            "apis_array": self._generate_js_array(analysis["apis"], "api"),
            "pages_array": self._generate_js_array(analysis["pages"], "page"),
            "database_array": self._generate_js_array(analysis["database"], "model")
        }

        return js_code

    def _generate_js_array(self, items: List[Dict], item_type: str) -> str:
        """Generate JavaScript array code."""
        if item_type == "component":
            return self._generate_components_js(items)
        elif item_type == "api":
            return self._generate_apis_js(items)
        elif item_type == "page":
            return self._generate_pages_js(items)
        elif item_type == "model":
            return self._generate_database_js(items)
        return "[]"

    def _generate_components_js(self, components: List[Dict]) -> str:
        """Generate JavaScript for components array."""
        lines = ["["]
        for comp in components:
            lines.append("    {")
            lines.append(f"        name: '{comp['name']}.tsx',")
            lines.append(f"        icon: '{self._get_category_icon(comp['category'])}',")
            lines.append(f"        description: '{comp['description']}',")
            lines.append(f"        pages: {comp['pages']},")
            lines.append(f"        features: ['{comp['name']} Feature'],")
            lines.append(f"        category: '{comp['category']}'")
            lines.append("    },")
        lines.append("]")
        return "\n".join(lines)

    def _generate_apis_js(self, apis: List[Dict]) -> str:
        """Generate JavaScript for APIs array."""
        lines = ["["]
        for api in apis:
            lines.append("    {")
            lines.append(f"        endpoint: '{api['endpoint']}',")
            lines.append(f"        icon: '{self._get_api_icon(api['method'])}',")
            lines.append(f"        description: '{api['description']}',")
            lines.append(f"        features: ['{api['method']} {api['path']} API'],")
            lines.append(f"        category: '{api['category']}'")
            lines.append("    },")
        lines.append("]")
        return "\n".join(lines)

    def _generate_pages_js(self, pages: List[Dict]) -> str:
        """Generate JavaScript for pages array."""
        lines = ["["]
        for page in pages:
            lines.append("    {")
            lines.append(f"        name: '{page['name']}',")
            lines.append(f"        icon: '{self._get_page_icon(page['persona'])}',")
            lines.append(f"        description: '{page['description']}',")
            lines.append(f"        features: ['{page['name']} Page'],")
            lines.append(f"        persona: '{page['persona']}',")
            lines.append(f"        route: '{page['route']}'")
            lines.append("    },")
        lines.append("]")
        return "\n".join(lines)

    def _generate_database_js(self, models: List[Dict]) -> str:
        """Generate JavaScript for database array."""
        lines = ["["]
        for model in models:
            lines.append("    {")
            lines.append(f"        model: '{model['model']}',")
            lines.append(f"        icon: '{self._get_model_icon(model['category'])}',")
            lines.append(f"        description: '{model['description']}',")
            lines.append(f"        fields: {model['fields']},")
            lines.append(f"        features: ['{model['model']} Model'],")
            lines.append(f"        category: '{model['category']}'")
            lines.append("    },")
        lines.append("]")
        return "\n".join(lines)

    def _get_category_icon(self, category: str) -> str:
        """Get icon for component category."""
        icons = {
            'ui': '🖼️', 'form': '📝', 'dashboard': '📊',
            'media': '🖼️', 'social': '💬', 'analytics': '📈', 'navigation': '🧭'
        }
        return icons.get(category, '🧩')

    def _get_api_icon(self, method: str) -> str:
        """Get icon for API method."""
        icons = {'GET': '📖', 'POST': '📝', 'PUT': '📝', 'DELETE': '🗑️'}
        return icons.get(method, '🔗')

    def _get_page_icon(self, persona: str) -> str:
        """Get icon for page persona."""
        icons = {'all': '👥', 'vendor': '🛒', 'promoter': '🏪', 'admin': '👑'}
        return icons.get(persona, '📄')

    def _get_model_icon(self, category: str) -> str:
        """Get icon for model category."""
        icons = {'core': '🎯', 'markets': '🏪', 'applications': '📝',
                'media': '🖼️', 'social': '💬', 'communication': '🔔'}
        return icons.get(category, '🗄️')

    def update_html_world_model(self, analysis: Dict) -> bool:
        """Update the HTML file with current world model data."""
        html_file = self.project_root / "tools" / "rumfor_world_model.html"

        if not html_file.exists():
            print(f"❌ HTML file not found: {html_file}")
            return False

        print(f"🔄 Updating HTML file: {html_file}")

        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Generate updated arrays
            components_js = self._generate_components_js(analysis['components'])
            apis_js = self._generate_apis_js(analysis['apis'])
            pages_js = self._generate_pages_js(analysis['pages'])
            database_js = self._generate_database_js(analysis['database'])

            # Replace the arrays in the HTML
            # Find the buildComponentsArray function
            content = self._replace_js_function(content, 'buildComponentsArray', components_js)
            content = self._replace_js_function(content, 'buildApisArray', apis_js)
            content = self._replace_js_function(content, 'buildPagesArray', pages_js)
            content = self._replace_js_function(content, 'buildDatabaseArray', database_js)

            # Write back
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"✅ Updated HTML file with {len(analysis['components'])} components, {len(analysis['apis'])} APIs, {len(analysis['pages'])} pages, {len(analysis['database'])} models")
            return True

        except Exception as e:
            print(f"❌ Error updating HTML file: {e}")
            return False

    def _replace_js_function(self, content: str, function_name: str, new_array: str) -> str:
        """Replace a JavaScript function's array assignment in the HTML content."""
        import re

        # Pattern to find the function and its array assignment (components = [content];)
        pattern = rf'function {function_name}\(\) \{{\s*(\w+)\s*=\s*\[([^\]]*)\];'

        # Replace the entire array with new content
        replacement = f'function {function_name}() {{\n    \\1 = {new_array};'

        result = re.sub(pattern, replacement, content, flags=re.DOTALL)

        if result == content:
            print(f"⚠️ Could not find {function_name} function to replace")

        return result


def main():
        import argparse

        parser = argparse.ArgumentParser(description='Audit Rumfor Market Tracker World Model')
        parser.add_argument('--update', action='store_true', help='Update HTML with new world model data')
        parser.add_argument('--generate-html', action='store_true', help='Generate updated HTML file')

        args = parser.parse_args()

        auditor = WorldModelAuditor(Path('.'))

        print("🌍 Rumfor Infinity World Model Auditor")
        print("=" * 50)

        # Analyze codebase
        analysis = auditor.analyze_codebase()

        print(f"📊 Found {len(analysis['components'])} components")
        print(f"🔗 Found {len(analysis['apis'])} API endpoints")
        print(f"📄 Found {len(analysis['pages'])} pages")
        print(f"🗄️ Found {len(analysis['database'])} database models")

        # Compare with current world model
        comparison = auditor.compare_with_world_model(analysis)

        print("\n📋 Recommendations:")
        for rec in comparison['recommendations']:
            print(f"  • {rec}")

        # Update HTML if requested
        if args.update or args.generate_html:
            success = auditor.update_html_world_model(analysis)
            if success:
                print("\n✅ World model updated in HTML file!")
                print("🔄 Refresh the world model interface to see changes")
            else:
                print("\n❌ Failed to update HTML file")


if __name__ == '__main__':
    main()