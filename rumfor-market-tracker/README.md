# Rumfor Market Tracker

[![Pipeline Status](https://git.sadoway.ca/sadoway/rumfor-vpopcan/badges/main/pipeline.svg)](https://git.sadoway.ca/sadoway/rumfor-vpopcan/-/commits/main)
[![Security](https://img.shields.io/badge/Security-Scan%20Passed-green.svg)](https://git.sadoway.ca/sadoway/rumfor-vpopcan/-/security/dast)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A+-green.svg)](https://git.sadoway.ca/sadoway/rumfor-vpopcan/-/quality_reports)
[![Test Coverage](https://img.shields.io/badge/Tests-Coverage%20%3E%2080%25-brightgreen.svg)](https://git.sadoway.ca/sadoway/rumfor-vpopcan/-/quality_reports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive platform for market discovery, vendor applications, and community engagement built with modern web technologies with full GitLab CI/CD integration.

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
- Apply to markets with customizable forms
- Track application status
- Manage vendor todo lists
- Track expenses and profits
- Upload market photos

### For Promoters
- Create and manage markets
- Set custom application requirements
- Review vendor applications
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

2. Install dependencies (frontend)
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

4. Copy and configure environment variables
```bash
cp .env.example .env                    # Frontend environment
cp backend/.env.example backend/.env    # Backend environment
# Edit both .env files with your MongoDB Atlas connection
```

5. Start development servers
```bash
# Option 1: Use the automated startup script (macOS)
./start-dev-mac.command

# Option 2: Manual startup
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend (new terminal window)
npm run dev
```

**Note**: Both frontend and backend servers must be running for full functionality. The frontend runs on port 5173, backend on port 3001.

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
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK_AUTH=false

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/rumfor_market_tracker?retryWrites=true&w=majority

# Backend Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=3001
```

**Important**: Make sure both frontend and backend `.env` files are properly configured with your MongoDB Atlas connection string.

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

## 🔐 Authentication & Registration

### User Roles
Role-based access control with four user types:
- **Visitor**: Browse markets, leave comments *(not available for registration)*
- **Vendor**: Apply to markets, manage applications *(registration available)*
- **Promoter**: Create and manage markets *(registration available)*
- **Admin**: Full system administration *(created via database seeding)*

### Registration Restrictions
New user registration is limited to **Vendor** and **Promoter** roles only. Admin accounts are created automatically on server startup with predefined credentials.

### Admin Access
Default admin account is created automatically:
- **Email**: Configured in backend environment
- **Password**: Set in backend initialization
- **Login**: Available after backend server starts

### Database Integration
All user accounts and data persist in **MongoDB Atlas** cloud database.

## 🚀 Deployment

### Automated Deployment
The project uses GitLab CI/CD for automated deployment:

- **Main Branch**: Automatically deployed to production
- **Develop Branch**: Automatically deployed to staging (if configured)
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

#### Deploy to Production
```bash
npm run build
# Deploy dist/ folder to your hosting provider
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

### Authentication & Database Issues

1. **Admin Login Not Working**
   - Ensure backend server is running on port 3001
   - Check MongoDB Atlas connection in backend `.env`
   - Admin user is created automatically when backend starts

2. **Registration Fails**
   - Only "Vendor" and "Promoter" roles are allowed for registration
   - Ensure MongoDB connection is working
   - Check frontend and backend `.env` files match

3. **Mock Mode Still Active**
   - Set `VITE_USE_MOCK_AUTH=false` in frontend `.env`
   - Check that `VITE_API_BASE_URL` is properly configured
   - Restart both frontend and backend servers

4. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Ensure IP whitelist includes your IP (0.0.0.0/0 for development)
   - Check database user has read/write permissions

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

- [Environment Variables Setup](./GITLAB_ENVIRONMENT_VARIABLES.md)
- [Deployment Configuration](./GITLAB_PAGES_SETUP.md)
- [Security Configuration](./.security-scan.yml)
- [Docker Deployment](./docker-compose.yml)
- [Repository](https://git.sadoway.ca/sadoway/rumfor-vpopcan/)