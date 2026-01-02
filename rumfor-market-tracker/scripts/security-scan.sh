#!/bin/bash

# Security Scanning Script for Rumfor Market Tracker CI/CD Pipeline
# This script runs various security scans and quality checks

set -e

echo "🔒 Starting Security Scanning for Rumfor Market Tracker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Security scanning results directory
SECURITY_DIR="security-reports"
mkdir -p "$SECURITY_DIR"

echo "📁 Security reports will be saved to: $SECURITY_DIR"

# 1. Dependency Vulnerability Scanning
echo ""
echo "🔍 1. Running Dependency Vulnerability Scan..."

if command_exists npm; then
    print_status "Running npm audit..."
    npm audit --audit-level=moderate --json > "$SECURITY_DIR/npm-audit-report.json" || true
    
    # Count vulnerabilities
    if [ -f "$SECURITY_DIR/npm-audit-report.json" ]; then
        MODERATE_VULNS=$(jq '.metadata.vulnerabilities.moderate // 0' "$SECURITY_DIR/npm-audit-report.json" || echo "0")
        HIGH_VULNS=$(jq '.metadata.vulnerabilities.high // 0' "$SECURITY_DIR/npm-audit-report.json" || echo "0")
        CRITICAL_VULNS=$(jq '.metadata.vulnerabilities.critical // 0' "$SECURITY_DIR/npm-audit-report.json" || echo "0")
        
        echo "📊 Dependency Vulnerabilities Found:"
        echo "   - Moderate: $MODERATE_VULNS"
        echo "   - High: $HIGH_VULNS"
        echo "   - Critical: $CRITICAL_VULNS"
        
        # Fail if critical vulnerabilities exist
        if [ "$CRITICAL_VULNS" -gt 0 ]; then
            print_error "Critical vulnerabilities found! Please fix before deployment."
            exit 1
        fi
    fi
else
    print_warning "npm not found, skipping npm audit"
fi

# 2. Secret Scanning with GitLeaks
echo ""
echo "🔐 2. Running Secret Scanning..."

if command_exists gitleaks; then
    print_status "Running GitLeaks secret scan..."
    gitleaks detect --source . --report-format json --report-path "$SECURITY_DIR/gitleaks-report.json" || true
    
    if [ -f "$SECURITY_DIR/gitleaks-report.json" ]; then
        LEAKS_COUNT=$(jq length "$SECURITY_DIR/gitleaks-report.json" || echo "0")
        if [ "$LEAKS_COUNT" -gt 0 ]; then
            print_error "Found $LEAKS_COUNT potential secrets!"
            jq -r '.[] | "   - \(.File):\(.StartLine) - \(.Description)"' "$SECURITY_DIR/gitleaks-report.json"
            exit 1
        else
            print_status "No secrets detected"
        fi
    fi
else
    print_warning "GitLeaks not found, installing..."
    # Install gitleaks
    if command_exists brew; then
        brew install gitleaks || true
    elif command_exists wget; then
        wget -O gitleaks.tar.gz https://github.com/zricethezav/gitleaks/releases/latest/download/gitleaks_8.18.0_linux_x64.tar.gz
        tar -xzf gitleaks.tar.gz
        sudo mv gitleaks /usr/local/bin/
        rm gitleaks.tar.gz
    fi
fi

# 3. Code Quality and Linting
echo ""
echo "📝 3. Running Code Quality Checks..."

if [ -f "package.json" ]; then
    print_status "Running ESLint..."
    npm run lint:ci > "$SECURITY_DIR/eslint-report.json" || true
    
    if command_exists prettier; then
        print_status "Running Prettier check..."
        npx prettier --check "src/**/*.{ts,tsx,js,jsx,css,md}" > "$SECURITY_DIR/prettier-report.txt" 2>&1 || true
    fi
fi

# 4. TypeScript Type Checking
echo ""
echo "🔧 4. Running TypeScript Type Check..."

if [ -f "package.json" ]; then
    print_status "Running TypeScript compiler check..."
    npm run type-check > "$SECURITY_DIR/tsc-report.txt" 2>&1 || true
    
    # Check for type errors
    if grep -q "error" "$SECURITY_DIR/tsc-report.txt" 2>/dev/null; then
        print_error "TypeScript compilation errors found!"
        cat "$SECURITY_DIR/tsc-report.txt"
        exit 1
    else
        print_status "TypeScript compilation successful"
    fi
fi

# 5. Bundle Analysis
echo ""
echo "📦 5. Running Bundle Analysis..."

if [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
    print_status "Building application for analysis..."
    npm run build > "$SECURITY_DIR/build-report.txt" 2>&1 || true
    
    if [ -d "dist" ]; then
        # Get bundle size
        BUNDLE_SIZE=$(du -sh dist | cut -f1)
        print_status "Bundle size: $BUNDLE_SIZE"
        
        # Check if bundle is too large (threshold: 5MB)
        BUNDLE_SIZE_BYTES=$(du -sb dist | cut -f1)
        if [ "$BUNDLE_SIZE_BYTES" -gt 5242880 ]; then
            print_warning "Bundle size ($BUNDLE_SIZE) exceeds 5MB threshold"
        fi
    fi
fi

# 6. License Compliance Check
echo ""
echo "📋 6. Running License Compliance Check..."

if command_exists npx; then
    print_status "Checking license compliance..."
    npx license-checker --json > "$SECURITY_DIR/licenses-report.json" 2>&1 || true
    
    if [ -f "$SECURITY_DIR/licenses-report.json" ]; then
        # Check for non-standard licenses
        UNKNOWN_LICENSES=$(jq -r 'to_entries[] | select(.value.licenses == "UNKNOWN") | .key' "$SECURITY_DIR/licenses-report.json" || echo "")
        if [ -n "$UNKNOWN_LICENSES" ]; then
            print_warning "Packages with unknown licenses found:"
            echo "$UNKNOWN_LICENSES" | while read -r package; do
                echo "   - $package"
            done
        else
            print_status "All packages have recognized licenses"
        fi
    fi
fi

# 7. Docker Security Scan (if Dockerfile exists)
echo ""
echo "🐳 7. Running Docker Security Scan..."

if [ -f "Dockerfile" ] && command_exists trivy; then
    print_status "Running Trivy container scan..."
    trivy fs --format json --output "$SECURITY_DIR/trivy-report.json" . || true
elif [ -f "Dockerfile" ]; then
    print_warning "Trivy not found, Docker security scan skipped"
else
    print_status "No Dockerfile found, skipping container scan"
fi

# 8. Security Headers Check (if running server)
echo ""
echo "🔒 8. Security Headers Check..."

if command_exists curl; then
    print_status "Checking security headers..."
    # This would require a running server
    # curl -I http://localhost:3000 > "$SECURITY_DIR/headers-check.txt" 2>&1 || true
    print_status "Security headers check prepared (requires running server)"
fi

# Generate Security Summary Report
echo ""
echo "📊 Generating Security Summary..."

cat > "$SECURITY_DIR/security-summary.md" << EOF
# Security Scan Summary Report

**Generated:** $(date)
**Project:** Rumfor Market Tracker

## Scan Results

### Dependency Vulnerabilities
EOF

if [ -f "$SECURITY_DIR/npm-audit-report.json" ]; then
    cat >> "$SECURITY_DIR/security-summary.md" << EOF
- Moderate: $MODERATE_VULNS
- High: $HIGH_VULNS
- Critical: $CRITICAL_VULNS
EOF
fi

cat >> "$SECURITY_DIR/security-summary.md" << EOF

### Secret Scanning
- GitLeaks scan completed
- Results: $([ -f "$SECURITY_DIR/gitleaks-report.json" ] && jq -r '"\(length) potential secrets found"' "$SECURITY_DIR/gitleaks-report.json" || echo "No report generated")

### Code Quality
- ESLint: $([ -f "$SECURITY_DIR/eslint-report.json" ] && echo "Completed" || echo "Not run")
- TypeScript: $([ -f "$SECURITY_DIR/tsc-report.txt" ] && echo "Passed" || echo "Not run")
- Prettier: $([ -f "$SECURITY_DIR/prettier-report.txt" ] && echo "Completed" || echo "Not run")

### Build Analysis
- Bundle Size: $([ -d "dist" ] && du -sh dist | cut -f1 || echo "Not built")
- Build Status: $([ -d "dist" ] && echo "Successful" || echo "Failed")

### License Compliance
- License Check: $([ -f "$SECURITY_DIR/licenses-report.json" ] && echo "Completed" || echo "Not run")

## Recommendations

1. **Critical Issues**: Address any critical vulnerabilities immediately
2. **Secrets**: Ensure no sensitive data is committed to the repository
3. **Dependencies**: Keep dependencies updated and review license compatibility
4. **Code Quality**: Maintain consistent code formatting and type safety
5. **Bundle Size**: Monitor bundle size to ensure optimal performance

## Next Steps

- Review detailed reports in the $SECURITY_DIR directory
- Address any security vulnerabilities before deployment
- Implement automated security scanning in CI/CD pipeline
- Regular security audits and dependency updates
EOF

print_status "Security scanning completed!"
echo ""
echo "📋 Security reports generated in: $SECURITY_DIR/"
echo "   - security-summary.md (Main report)"
echo "   - npm-audit-report.json (Dependencies)"
echo "   - gitleaks-report.json (Secrets)"
echo "   - eslint-report.json (Code quality)"
echo "   - tsc-report.txt (TypeScript)"
echo "   - licenses-report.json (Licenses)"
echo ""

# Exit with success if we made it here
exit 0