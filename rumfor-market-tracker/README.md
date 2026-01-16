# Rumfor Market Tracker

[![Pipeline Status](https://gitlab.com/your-username/rumfor-market-tracker/badges/main/pipeline.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/commits/main)
[![Pages Deployment](https://gitlab.com/your-username/rumfor-market-tracker/badges/main/pages.svg)](https://your-username.gitlab.io/rumfor-market-tracker/)
[![Security](https://img.shields.io/badge/Security-Scan%20Passed-green.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/security/dast)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A+-green.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/quality_reports)
[![Test Coverage](https://img.shields.io/badge/Tests-Coverage%20%3E%2080%25-brightgreen.svg)](https://gitlab.com/your-username/rumfor-market-tracker/-/quality_reports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive platform for market discovery, vendor applications, and community engagement built with modern web technologies. Features complete vendor application workflows, market management, expense tracking, community features, and a full CI/CD pipeline with comprehensive documentation.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + UnoCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 🏗️ Project Structure

```
rumfor-market-tracker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   └── ui/            # Base UI components
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── markets/       # Market management
│   │   ├── applications/  # Vendor applications
│   │   ├── community/     # Comments, photos, hashtags
│   │   └── admin/         # Admin functionality
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   ├── lib/               # Third-party integrations
│   └── styles/            # Global styles
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── uno.config.ts
```

## 🎯 Features

### For Visitors
- Browse and search farmers markets and events
- Filter by location, category, and accessibility
- View market details, schedules, and photos
- Leave comments and reactions

### For Vendors
- Apply to markets with multi-step forms, pre-filled profiles, and auto-saved drafts
- Track application status
- Manage vendor todo lists
- Track expenses and profits
- Upload market photos

### For Promoters
- Create and manage markets
- Set custom application requirements
- Review vendor applications
- Guide promoter claiming with clear CTAs, eligibility checks, and verification steps
- Communicate with applicants
- Analytics and insights

### For Admins
- User management and moderation
- Promoter verification
- Content moderation
- System analytics
- Bulk operations

## 🚀 CI/CD Pipeline

This project includes a comprehensive GitLab CI/CD pipeline that ensures code quality, security, and automated deployment.

### Pipeline Stages

1. **Install Stage**: Install dependencies for both main app and E2E tests
2. **Build Stage**: Compile TypeScript and build the React application
3. **Test Stage**: Run ESLint, TypeScript checks, and code quality validation
4. **E2E Stage**: Execute Playwright tests in headless browser mode
5. **Security Stage**: Perform dependency scanning and secret detection
6. **Deploy Stage**: Deploy to GitLab Pages (main branch) or staging environment

### Quality Gates

- **Code Quality**: ESLint and Prettier validation
- **Type Safety**: TypeScript compilation without errors
- **Security**: npm audit, GitLeaks secret scanning
- **Testing**: E2E test execution with Playwright
- **Build Success**: Successful production build

### Deployment Environments

- **Development**: `develop` branch → GitLab Pages staging
- **Production**: `main` branch → GitLab Pages production
- **Feature Branches**: Automated testing and quality checks

### Security Features

- Automated vulnerability scanning with npm audit
- Secret detection using GitLeaks
- Container security scanning with Trivy
- License compliance checking
- Security headers validation

### Badge Explanations

- **Pipeline Status**: Shows the latest build status
- **Pages Deployment**: Link to live deployment
- **Security**: Security scan results
- **Code Quality**: Overall code quality metrics
- **Test Coverage**: E2E test coverage percentage

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd rumfor-market-tracker
```

2. Install dependencies
```bash
npm install
```

3. Copy environment variables
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run preview` - Preview production build locally

#### Building
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analysis
- `npm run build:ci` - Full CI build (type-check + lint + build)

#### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run lint:ci` - Generate JSON report for CI
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run format:ci` - Generate formatting report for CI

#### Testing
- `npm run test` - Run unit tests (placeholder)
- `npm run test:ci` - CI test runner
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ci` - E2E tests for CI environment

#### Security
- `npm run security:audit` - Run npm security audit
- `npm run security:audit-ci` - Generate security report
- `npm run security:deps` - Advanced dependency security check

#### Maintenance
- `npm run clean` - Remove build directory
- `npm run clean:all` - Clean all generated files
- `npm run ci:install` - Clean install for CI
- `npm run ci:setup` - Complete CI setup script
- `npm run deploy:pages` - Deploy to GitLab Pages

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### API Integration
The project is configured to work with a REST API. Update the API endpoints in:
- `src/lib/apiClient.ts`
- Feature-specific API modules

## 🎨 Styling

The project uses a utility-first approach with Tailwind CSS and extends it with:

- Custom color palette optimized for market/festival themes
- Responsive design patterns
- Dark mode support (planned)
- Accessible color contrasts

## 📱 Responsive Design

Built with mobile-first approach ensuring excellent experience across:
- Desktop (1024px+)
- Tablet (768px - 1023px)  
- Mobile (320px - 767px)

## 🔐 Authentication

Role-based access control with four user types:
- **Visitor**: Browse markets, leave comments
- **Vendor**: Apply to markets, manage applications
- **Promoter**: Create and manage markets
- **Admin**: Full system administration

Promoter claiming UX is designed around clear eligibility checks, a verification timeline, and prominent CTAs on market detail pages.

## 🚀 Deployment

### Automated Deployment
The project uses GitLab CI/CD for automated deployment:

- **Main Branch**: Automatically deployed to GitLab Pages production
- **Develop Branch**: Automatically deployed to GitLab Pages staging
- **Feature Branches**: Full CI/CD pipeline runs for testing

## 🗄️ Database

**MongoDB Atlas** - Cloud-hosted MongoDB database providing:
- Automatic scaling and backup
- Easy development/production synchronization
- Flexible schema design for evolving application requirements
- Built-in security and monitoring

### Manual Deployment

#### Build for Production
```bash
npm run build
```

#### Deploy to GitLab Pages
```bash
npm run deploy:pages
```

#### Docker Deployment
```bash
# Build and run with Docker
docker build -t rumfor-market-tracker .
docker run -p 80:80 rumfor-market-tracker

# Or use docker-compose
docker-compose up -d
```

#### Environment Configuration

#### Database Setup
1. **MongoDB Atlas**: Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Connection String**: Get your connection string and add to `.env`
3. **Database Collections**: The application will auto-create collections as needed

See [GITLAB_ENVIRONMENT_VARIABLES.md](./GITLAB_ENVIRONMENT_VARIABLES.md) for complete setup.

## 📝 Contributing

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the established code style
   - Use TypeScript for all new code
   - Write comprehensive tests
   - Update documentation as needed

3. **Run Quality Checks Locally**
   ```bash
   npm run ci:setup  # Full CI setup check
   npm run security:audit  # Security scan
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Merge Request**
   - The CI/CD pipeline will automatically run
   - Ensure all quality gates pass
   - Request review from team members

### Code Quality Standards

- **ESLint**: No warnings or errors
- **TypeScript**: Strict type checking enabled
- **Prettier**: Consistent code formatting
- **Security**: No critical vulnerabilities
- **Testing**: E2E tests for user workflows

### CI/CD Pipeline Integration

The pipeline automatically runs on every commit:

1. **Install Dependencies**: Clean install of all packages
2. **Build Application**: TypeScript compilation and Vite build
3. **Code Quality**: ESLint, TypeScript, and Prettier validation
4. **E2E Testing**: Playwright tests in headless mode
5. **Security Scanning**: npm audit and GitLeaks secret detection
6. **Deployment**: Automatic deployment to GitLab Pages

### Quality Gates

Your code must pass all quality gates before merging:

- ✅ Build completes successfully
- ✅ No ESLint errors
- ✅ TypeScript compilation passes
- ✅ All E2E tests pass
- ✅ Security scan shows no critical issues
- ✅ No secrets detected in code

### Pre-commit Hooks

Consider installing pre-commit hooks for local validation:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run ci:setup"
```

### Documentation Requirements

- Update README.md for new features
- Document new environment variables
- Include security considerations
- Update API documentation if applicable

## 📄 License

This project is licensed under the MIT License.

## 🔧 Troubleshooting

### Common CI/CD Issues

1. **Build Failures**
   - Check Node.js version compatibility (18+ required)
   - Run `npm run ci:setup` locally before pushing
   - Verify all dependencies are properly declared

2. **TypeScript Errors**
   - Fix all type errors before merging
   - Run `npm run type-check` locally
   - Update type definitions as needed

3. **ESLint Issues**
   - Run `npm run lint:fix` to auto-fix common issues
   - Review and address remaining warnings
   - Ensure code follows project standards

4. **E2E Test Failures**
   - Check if all required environment variables are set
   - Verify the application builds successfully
   - Review test output for specific failures

5. **Security Scan Failures**
   - Update dependencies with known vulnerabilities
   - Remove or replace packages with problematic licenses
   - Review and update security configurations

### Getting Help

- **Documentation**: Check individual documentation files
- **CI/CD Issues**: Review pipeline logs in GitLab
- **Local Development**: Run `npm run ci:setup` for comprehensive checks
- **Support**: Create an issue in the repository

## 📚 Additional Documentation

### Core Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Complete REST API reference
- [Database Schema](./DATABASE_SCHEMA.md) - MongoDB collections and relationships
- [Component Props Guide](./COMPONENTS_PROPS.md) - React components documentation
- [System Architecture](./SYSTEM_ARCHITECTURE_MAP.md) - Technical architecture overview

### Vendor-Specific Documentation
- [Vendor User Guide](./VENDOR_USER_GUIDE.md) - Comprehensive guide for vendor market detail interface
- [Developer Vendor Guide](./DEVELOPER_VENDOR_GUIDE.md) - Technical implementation guide for vendor features

### Development & Deployment
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Setup and development workflow
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment strategies
- [GitLab Environment Variables](./GITLAB_ENVIRONMENT_VARIABLES.md)
- [GitLab Pages Setup](./GITLAB_PAGES_SETUP.md)

### Project Analysis
- [Frontend Analysis Report](./FRONTEND_ANALYSIS_REPORT.md)
- [Backend Analysis Report](./BACKEND_ANALYSIS_REPORT.md)
- [Architecture Audit](./AUDIT_REPORT.md)
- [File Structure Reference](./FILE_STRUCTURE_REFERENCE.md)
