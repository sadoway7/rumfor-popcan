#!/usr/bin/env python3
"""
Simple Ralph Deployment Check
Run locally to analyze your GitLab + Unraid deployment setup
"""

import os
from pathlib import Path

def check_deployment():
    """Simple deployment analysis for GitLab + Unraid"""

    project_root = Path(__file__).parent / 'rumfor-market-tracker'

    print("Ralph Deployment Check - GitLab + Unraid")
    print("=" * 50)

    issues = []
    suggestions = []

    # Check GitLab CI
    gitlab_ci = Path('.gitlab-ci.yml')
    if gitlab_ci.exists():
        print("Found .gitlab-ci.yml")
        content = gitlab_ci.read_text()

        # Check for basic optimizations
        if 'cache:' not in content:
            issues.append("No caching in GitLab CI - builds will be slower")
            suggestions.append("Add cache: { key: ..., paths: [node_modules/] }")

        if 'artifacts:' not in content:
            issues.append("No artifacts - deployment may be slower")
            suggestions.append("Add artifacts with your build outputs")

    else:
        issues.append("No .gitlab-ci.yml found")
        suggestions.append("Create .gitlab-ci.yml for automated deployment")

    # Check Docker setup
    docker_compose = project_root / 'docker-compose.prod.yml'
    if docker_compose.exists():
        print("Found docker-compose.prod.yml")
        content = docker_compose.read_text()

        if 'healthcheck:' not in content:
            suggestions.append("Add health checks to containers for better reliability")

        if 'restart:' not in content:
            suggestions.append("Add restart policies for container resilience")

    else:
        issues.append("No docker-compose.prod.yml found")

    # Check Unraid deployment
    nginx_conf = project_root / 'nginx.conf'
    if nginx_conf.exists():
        print("Found nginx.conf")
    else:
        suggestions.append("Consider adding nginx.conf for production deployment")

    # Summary
    print(f"\nFound {len(issues)} issues, {len(suggestions)} suggestions")

    if issues:
        print("\nIssues to fix:")
        for issue in issues:
            print(f"  • {issue}")

    if suggestions:
        print("\nSuggestions for improvement:")
        for suggestion in suggestions:
            print(f"  • {suggestion}")

    print("\nKeep your deployment simple and reliable!")

if __name__ == "__main__":
    check_deployment()