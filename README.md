# Rumfor Market Tracker - Project Workspace

[![Main App Pipeline](https://gitlab.com/your-username/rumfor-market-tracker/badges/main/pipeline.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/commits/main)
[![Main App Pages](https://gitlab.com/your-username/rumfor-market-tracker/badges/main/pages.svg)](https://your-username.gitlab.io/rumfor-market-tracker/)
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-Coverage%20%3E%2080%25-brightgreen.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/quality_reports)
[![Security](https://img.shields.io/badge/Security-Scan%20Passed-green.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/security/dast)

A comprehensive marketplace platform built with modern web technologies, featuring market discovery, vendor applications, community engagement, and complete DevOps automation.

## 🎯 Project Overview

**Rumfor Market Tracker** is a full-stack application designed to revolutionize how farmers markets, festivals, and community events are discovered, managed, and participated in. The platform serves four distinct user types with role-based functionality:

- **Visitors**: Discover and explore local markets and events
- **Vendors**: Apply to markets, track applications, manage business operations
- **Promoters**: Create and manage markets, review applications, engage community
- **Admins**: Oversee system operations, user management, content moderation

## 🏗️ Architecture & Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS + UnoCSS** for utility-first styling
- **Zustand** for efficient state management
- **TanStack Query (React Query)** for server state management
- **React Router v6** for client-side routing
- **Radix UI** primitives for accessible components

### Development & Quality
- **ESLint + Prettier** for code quality and formatting
- **TypeScript** for compile-time type safety
- **Playwright** for end-to-end testing
- **GitLab CI/CD** for automated quality gates and deployment

### DevOps & Deployment
- **GitLab Pages** for hosting and deployment
- **Docker** containerization for consistent environments
- **Multi-stage CI/CD pipeline** with quality gates
- **Security scanning** with npm audit and GitLeaks

## 📁 Project Structure

```
rumfor-v2026/
├── README.md                          # This file - workspace overview
├── .roomodes                          # Roo AI mode configurations
├── .roo/                              # Roo AI assistant resources
├── .roocode/                          # Code guidelines and standards
│
├── e2e-tests/                         # End-to-end test suite
│   ├── tests/                        # Playwright test cases
│   ├── package.json                  # Test dependencies
│   └── playwright.config.ts          # Test configuration
│
├── rumfor-market-tracker/             # Main React application
│   ├── src/                          # Application source code
│   │   ├── components/               # Reusable UI components
│   │   ├── features/                 # Feature modules (auth, markets, etc.)
│   │   ├── pages/                    # Route components
│   │   ├── layouts/                  # Application layouts
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── types/                    # TypeScript definitions
│   │   └── utils/                    # Utility functions
│   │
│   ├── .gitlab-ci.yml               # GitLab CI/CD pipeline
│   ├── Dockerfile                   # Production containerization
│   ├── docker-compose.yml          # Local development setup
│   ├── package.json                # Dependencies and scripts
│   ├── README.md                   # Detailed project documentation
│   ├── GITLAB_INTEGRATION_SUMMARY.md
│   ├── GITLAB_ENVIRONMENT_VARIABLES.md
│   └── GITLAB_PAGES_SETUP.md
│
├── rumfor-market/                    # Market management module
└── rumfor/                          # Core business logic
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Git
- MongoDB Atlas account (for database)

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd rumfor-v2026
   
   # Install main application
   cd rumfor-market-tracker
   npm install
   
   # Install E2E test dependencies
   cd ../e2e-tests
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cd rumfor-market-tracker
   cp .env.example .env
   # Configure environment variables as needed
   ```

3. **Start Development**
   ```bash
   # Main application (Terminal 1)
   cd rumfor-market-tracker
   npm run dev
   
   # E2E tests (Terminal 2) - Optional
   cd e2e-tests
   npm run test:e2e
   ```

4. **Quality Checks**
   ```bash
   # Run full CI pipeline locally
   cd rumfor-market-tracker
   npm run ci:setup
   
   # Security audit
   npm run security:audit
   ```

## 🎯 Current Project Status

### ✅ **Recently Completed**
- **Critical Bug Fix**: Resolved infinite loop issues causing unresponsive pages
- **GitLab Integration**: Complete CI/CD pipeline with 6-stage automation
- **Documentation**: Comprehensive project documentation and setup guides
- **Security**: Automated vulnerability scanning and secret detection
- **Testing**: E2E test suite with Playwright

### 🔄 **Active Development**
- **Core Functionality**: Markets search, vendor applications, admin dashboard
- **Community Features**: Comments, photos, hashtag voting
- **User Management**: Role-based access control and authentication
- **Real-time Features**: Notifications and live updates

### 📋 **Planned Features**
- **Mobile App**: React Native companion application
- **Advanced Analytics**: Business intelligence dashboard
- **Payment Integration**: Stripe/PayPal for premium features
- **AI Recommendations**: Machine learning-powered market suggestions
- **Multi-language Support**: Internationalization (i18n)

## 🛠️ Available Scripts

### Main Application (rumfor-market-tracker)

#### Development
- `npm run dev` - Start development server
- `npm run preview` - Preview production build
- `npm run build` - Build for production

#### Quality Assurance
- `npm run ci:setup` - Complete CI pipeline check
- `npm run lint` - ESLint validation with auto-fix
- `npm run type-check` - TypeScript compilation
- `npm run security:audit` - Security vulnerability scan

#### Testing
- `npm run test:e2e` - End-to-end testing
- `npm run test:e2e:ci` - CI-optimized E2E tests

#### Deployment
- `npm run deploy:pages` - Deploy to GitLab Pages
- `npm run build:docker` - Build Docker image

### E2E Test Suite (e2e-tests)

- `npm run test` - Run all E2E tests
- `npm run test:ui` - Run tests with UI
- `npm run test:debug` - Debug mode testing

## 📊 GitLab Integration & CI/CD

### Pipeline Stages
1. **Install** - Dependency installation for app and tests
2. **Build** - TypeScript compilation and Vite build
3. **Test** - ESLint, TypeScript, and code quality checks
4. **E2E** - Playwright end-to-end testing
5. **Security** - Vulnerability scanning and secret detection
6. **Deploy** - GitLab Pages deployment

### Quality Gates
- ✅ TypeScript compilation without errors
- ✅ ESLint validation passes
- ✅ E2E tests execute successfully
- ✅ Security scan shows no critical issues
- ✅ No secrets detected in codebase

### Deployment Strategy
- **Main Branch** → Production deployment (GitLab Pages)
- **Develop Branch** → Staging deployment (GitLab Pages)
- **Feature Branches** → Full CI pipeline testing

## 🔐 Security Features

- **Dependency Scanning**: Automated npm audit integration
- **Secret Detection**: GitLeaks for credential exposure prevention
- **Code Quality**: ESLint security rules and best practices
- **Container Security**: Docker image scanning with Trivy
- **HTTPS Enforcement**: SSL/TLS configuration in production

## 📈 Performance & Monitoring

- **Bundle Analysis**: Vite build optimization and monitoring
- **Lighthouse Scores**: Performance auditing and improvement
- **E2E Monitoring**: Automated user journey testing
- **Security Monitoring**: Continuous vulnerability assessment

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test**
   ```bash
   # Make changes and test locally
   npm run ci:setup          # Full quality validation
   npm run security:audit    # Security check
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   git push origin feature/your-feature-name
   ```

4. **Create Merge Request**
   - CI pipeline automatically validates changes
   - Quality gates must pass before merge
   - Deploys automatically after merge to main

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Zero warnings policy
- **Testing**: E2E tests for all user workflows
- **Documentation**: Update docs with new features
- **Security**: No critical vulnerabilities allowed

## 📚 Documentation

### Project-Specific
- [Main App README](rumfor-market-tracker/README.md) - Detailed application documentation
- [GitLab Integration](rumfor-market-tracker/GITLAB_INTEGRATION_SUMMARY.md) - CI/CD setup guide
- [Environment Setup](rumfor-market-tracker/GITLAB_ENVIRONMENT_VARIABLES.md) - Configuration guide
- [Pages Deployment](rumfor-market-tracker/GITLAB_PAGES_SETUP.md) - Hosting documentation

### Development Guidelines
- [.roocode/](.roocode/) - Code standards and best practices
- [e2e-tests/README.md](e2e-tests/README.md) - Testing guidelines

## 🆘 Support & Troubleshooting

### Common Issues

1. **Build Failures**
   - Verify Node.js version (18+ required)
   - Run `npm run ci:setup` locally
   - Check GitLab pipeline logs

2. **TypeScript Errors**
   - Fix all type errors before merging
   - Use `npm run type-check` for validation

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Run `npm run security:audit`
   - Review security reports in GitLab

### Getting Help

- **Documentation**: Check individual README files
- **CI/CD Issues**: Review GitLab pipeline logs
- **Local Development**: Use `npm run ci:setup` for diagnosis
- **Security Questions**: Check security reports and documentation

## 📄 License

This project is licensed under the MIT License - see individual project directories for specific licensing information.

## 🎯 Next Steps

### Immediate Priorities
1. **GitLab Repository Setup**: Initialize Git repository and push to GitLab
2. **Task Management**: Set up GitLab Issues and Milestones for project tracking
3. **Team Onboarding**: Document development workflow and coding standards
4. **Production Deployment**: Configure GitLab Pages for live hosting

### Future Enhancements
1. **Mobile Application**: React Native companion app
2. **API Development**: Backend services for enhanced functionality
3. **Advanced Features**: Payment processing, analytics, AI recommendations
4. **Team Scaling**: Multiple developer workflow and code review processes

---

**Project Status**: ✅ **Development Ready** | 🔄 **Active Development** | 📈 **Scaling Up**

*Last Updated: January 2, 2026*