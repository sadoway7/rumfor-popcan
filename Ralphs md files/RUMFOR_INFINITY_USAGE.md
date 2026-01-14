# Rumfor Infinity Rule List - Usage Guide

How to use Rumfor Infinity Rule List day-to-day in the Rumfor Market Tracker project.

---

## The Basic Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     BASIC WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

1. OPEN UI
    └──> Open tools/rumfor_world_model.html in browser

2. SELECT TASK
    └──> Click a World Model card OR select an agent directly
    └──> Choose from market tracker features (Markets, Applications, Auth, etc.)

3. COPY PROMPT
    └──> Click agent button (⚛️ Frontend, 🗄️ Backend, etc.)
    └──> Prompt is copied to clipboard

4. PASTE IN ROO CODE
    └──> Paste the prompt
    └──> Roo Code switches to specialized agent mode (rumfor-frontend, etc.)

5. AGENT EXECUTES
    └──> Agent performs work specific to market tracker stack
    └──> Progress updates in real-time

6. REVIEW RESULTS
    └──> Check scratchpad for technical details
    └──> Check git for automatic checkpoints
    └──> Verify in browser or CI/CD pipeline
```

---

## Daily Usage in Market Tracker Development

### Morning: Start a Development Cycle

1. **Open the control panel**

```bash
open tools/rumfor_control_panel.html
```

2. **Click "Run All Agents"**

This runs the full market tracker development cycle:
- Frontend: React/TypeScript optimization
- Backend: Node.js/Express improvements
- API: Authentication and endpoints
- Styling: Tailwind/UnoCSS enhancements
- Testing: Playwright E2E coverage
- Security: Dependency and code audits
- Documentation: API and user guide updates
- Deployment: CI/CD and performance

### Feature Development Workflow

#### Scenario: Add New Market Filter

1. Navigate to "Markets" card in World Model
2. Click "⚛️ Run with Frontend Agent"
3. Agent prompt is copied: "*I want to run the Frontend Agent for Rumfor Market Tracker...*"
4. Paste into Roo Code → switches to `rumfor-frontend` mode
5. Agent implements the filter component with React hooks
6. Tests automatically update
7. Documentation refreshes

#### Scenario: Implement Vendor Onboarding

1. Select "Applications" card
2. Click "🗄️ Run with Backend Agent"
3. Agent implements Express routes and MongoDB schemas
4. API endpoints are created with proper validation
5. Authentication middleware is applied
6. Security agent scans for vulnerabilities

#### Scenario: Fix Mobile Responsiveness

1. Choose "Styling" card from World Model
2. Click "🎨 Run with Styling Agent"
3. Agent optimizes Tailwind classes and UnoCSS rules
4. Radix UI components are adjusted for mobile
5. Performance bundle analysis runs
6. Lighthouse scores improve

### Evening: Code Review and Deployment

1. **Check all agent scratchpads**

```bash
# See what was accomplished today
cat .rumfor/scratchpads/frontend_scratchpad.md
cat .rumfor/scratchpads/backend_scratchpad.md
# etc.
```

2. **Review git checkpoints**

```bash
# Show today's agent commits
git log --since="today" --oneline | grep -E "frontend|backend|api|styling"

# Show changes by agent type
git log --grep="Frontend Agent" --oneline | head -5
```

3. **Run final verification**

```bash
# Full CI pipeline check
npm run ci:setup

# Deploy to staging
npm run deploy:pages
```

---

## Using the Rumfor World Model UI

### Market Tracker Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     RUMFOR MARKET TRACKER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │   SIDEBAR   │  │           CENTER (GRAPH)               │   │
│  │             │  │                                         │   │
│  │ ROOT        │  │         ┌─────────────┐                 │   │
│  │ ├─Frontend  │  │         │  Frontend   │                 │   │
│  │ │ ├─Markets │  │         └─────┬───────┘                 │   │
│  │ │ ├─Auth    │  │               │                         │   │
│  │ │ └─...     │  │         ┌─────▼───────┐                 │   │
│  │ │           │  │         │   Markets   │                 │   │
│  │ ├─Backend   │  │         └─────┬───────┘                 │   │
│  │ │ ├─Users   │  │               │                         │   │
│  │ │ └─...     │  │         ┌─────▼───────┐                 │   │
│  │ └─Testing   │  │         │  Filtering │                 │   │
│  │             │  │         └─────────────┘                 │   │
│  └─────────────┘  └─────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Left Sidebar (Application Navigation)

- **ROOT**: Rumfor Market Tracker (top level)
- **Frontend**: React/TypeScript components and pages
- **Backend**: Node.js/Express API and database
- **Authentication**: User management and security
- **Markets**: Market discovery and management
- **Applications**: Vendor application system
- **Community**: Comments, photos, hashtags
- **Admin**: Admin dashboard and moderation
- **Testing**: E2E tests and quality assurance
- **Deployment**: CI/CD and production

Icons indicate component type:
- 📁 Root/Top-level features
- 📂 Sub-components and modules
- 📄 Specific implementation tasks

### Center (Graph Visualization)

Shows the application architecture as an interactive graph:
- Click nodes to explore features
- Hover for implementation details
- Zoom and pan for navigation

### Right Sidebar (Rumfor Panel)

Toggle with the 🤖 button to see real-time agent status:

```
┌─────────────────────────────────────┐
│  🤖 Rumfor Orchestrator              │
├─────────────────────────────────────┤
│  Status: IDLE                        │
│  Cycle: 5                            │
│  Current: -                          │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐     │
│  │ ⚛️ Frontend               │     │
│  │ Optimizing components...   │     │
│  └─────────────────────────────┘     │
│  ┌─────────────────────────────┐     │
│  │ 🗄️ Backend                │     │
│  │ Ready                     │     │
│  └─────────────────────────────┘     │
│  ... more agents ...                │
├─────────────────────────────────────┤
│  [Run All Agents]                    │
│  [Refresh Status]                    │
└─────────────────────────────────────┘
```

---

## Market Tracker Prompt Templates

### Frontend Agent Prompt

```
I want to run the Frontend Agent for Rumfor Market Tracker.

Context from World Model card "Markets.Filtering":
Add geo-based market filtering with map integration and location services.

React/TypeScript Stack Details:
- React 18 with functional components and hooks
- TypeScript strict mode with proper interfaces
- Vite 4 for build optimization
- Zustand for state management
- TanStack Query for data fetching
- Radix UI for accessible components
- UnoCSS + Tailwind for styling

Please use this context while working as the Frontend Agent.

Switch to the rumfor-frontend mode and complete the Frontend Agent's responsibilities.
```

### Backend Agent Prompt

```
I want to run the Backend Agent for Rumfor Market Tracker.

Context from World Model card "Applications.Submission":
Implement vendor application submission with file uploads and validation.

Node.js/Express/MongoDB Stack Details:
- Express.js with middleware architecture
- MongoDB with Mongoose ODM
- JWT authentication with role-based access
- File upload handling with validation
- Input sanitization and security
- RESTful API design patterns

Please use this context while working as the Backend Agent.

Switch to the rumfor-backend mode and complete the Backend Agent's responsibilities.
```

### Full Orchestrator Prompt

```
I want to run the Rumfor Orchestrator for Rumfor Market Tracker.

Please run a complete development cycle with all 8 specialist agents:
1. Frontend Agent (rumfor-frontend) - React/TypeScript/Vite components and optimization
2. Backend Agent (rumfor-backend) - Node.js/Express API and MongoDB integration
3. API Agent (rumfor-api) - REST endpoints, authentication, and data modeling
4. Styling Agent (rumfor-styling) - Tailwind CSS, UnoCSS, and responsive design
5. Testing Agent (rumfor-testing) - E2E tests, code quality, and Playwright
6. Security Agent (rumfor-security) - Dependency audits and code scanning
7. Documentation Agent (rumfor-docs) - API docs and technical documentation
8. Deployment Agent (rumfor-deploy) - CI/CD, GitLab Pages, and performance

Switch to the rumfor-orchestrator mode and run a full cycle with all agents.
```

---

## Working with Market Tracker Scratchpads

### Reading an Agent's Memory

```bash
# See Frontend Agent's recent work
cat .rumfor/scratchpads/frontend_scratchpad.md
```

Output includes:
```markdown
# Frontend Agent Scratchpad

## Context
- Project: Rumfor Market Tracker
- Tech Stack: React 18 + TypeScript + Vite 4
- State: Zustand + TanStack Query
- Styling: UnoCSS + Tailwind + Radix UI

## Completed
- [2026-01-15 09:32] Implemented market filter component with geolocation
- [2026-01-15 09:35] Added TypeScript interfaces for filter state
- [2026-01-15 09:37] Optimized query performance with React.memo

## In Progress
- Adding map integration for visual filtering

## Blocked On
- Waiting for Backend Agent to implement geolocation API

## Next Actions
1. Integrate with Google Maps API
2. Add filter persistence to URL
3. Implement filter presets for common searches

## Notes
- Zustand store updated to handle filter state
- TanStack Query caching improved performance by 40%
- Bundle size increased by 15KB for map components
```

### Editing Scratchpads for Context

Add specific requirements:

```bash
echo "## Special Requirements
- Must support GPS location detection
- Filter radius: 5-50 miles
- Show results on map with markers
- Maintain accessibility standards" >> .rumfor/scratchpads/frontend_scratchpad.md
```

---

## Git Checkpoints in Market Tracker

### Agent-Specific Commits

```
frontend-2024-01-15-cycle12-implement-market-filters
backend-2024-01-15-cycle12-add-geolocation-api
api-2024-01-15-cycle12-update-auth-middleware
styling-2024-01-15-cycle12-responsive-market-cards
testing-2024-01-15-cycle12-filter-e2e-tests
```

### Finding Checkpoints

```bash
# Show all checkpoints for a feature
git tag | grep "market.*filter"

# Show changes in specific checkpoint
git show frontend-2024-01-15-cycle12-implement-market-filters

# See agent activity timeline
git log --grep="Agent" --oneline --since="1 week ago"
```

### Rolling Back Agent Work

```bash
# Reset to before an agent's changes
git reset --hard HEAD~1

# Or reset to specific checkpoint
git checkout frontend-2024-01-15-cycle12-implement-market-filters
```

---

## Monitoring Market Tracker Progress

### Via the UI

1. Open `tools/rumfor_world_model.html`
2. Click 🤖 to toggle agent status panel
3. Watch real-time progress bars
4. See which agent is currently active

### Via Command Line

```bash
# Compile and show system status
python tools/compile_rumfor_status.py

# Watch status changes
watch -n 5 'python tools/compile_rumfor_status.py | grep -A 10 "Agents:"'
```

### Via Status JSON

```bash
# Check specific agent status
python -c "import json; s=json.load(open('.rumfor/status.json')); print(s['agents']['frontend'])"
```

---

## Market Tracker-Specific Workflows

### Feature Implementation: Complete User Journey

```
1. Frontend Agent: "Create vendor application form component"
2. Backend Agent: "Implement application submission API"
3. API Agent: "Add authentication and validation middleware"
4. Styling Agent: "Design responsive form styling"
5. Testing Agent: "Add E2E test for application submission"
6. Security Agent: "Audit form for XSS and injection vulnerabilities"
7. Documentation Agent: "Update API docs for application endpoints"
8. Deployment Agent: "Optimize bundle and deploy to staging"
```

### Bug Fix: Performance Issue

```
1. Testing Agent: "Profile application performance and identify bottlenecks"
2. Frontend Agent: "Optimize React components and reduce re-renders"
3. Backend Agent: "Add database indexes and query optimization"
4. Deployment Agent: "Implement caching and CDN setup"
5. Testing Agent: "Verify performance improvements with benchmarks"
```

### Security Enhancement: Authentication

```
1. API Agent: "Review and strengthen JWT token handling"
2. Security Agent: "Implement rate limiting and brute force protection"
3. Backend Agent: "Add secure password reset flow"
4. Testing Agent: "Add security-focused E2E tests"
5. Documentation Agent: "Document authentication security measures"
```

### UI/UX Improvement: Mobile Experience

```
1. Styling Agent: "Audit mobile responsiveness and fix issues"
2. Frontend Agent: "Implement touch gestures and mobile optimizations"
3. Testing Agent: "Add mobile device testing and visual regression"
4. Deployment Agent: "Optimize mobile bundle size and loading"
```

---

## Tips and Best Practices for Market Tracker

### Writing Good Card Prompts

**Good (Specific and Contextual):**
```
Implement advanced market search with filters:

- Location-based search (GPS or manual entry)
- Category filtering (Farmers, Artisans, Food Trucks)
- Price range and accessibility options
- Real-time results with pagination
- Save favorite searches for users
- Integration with Google Maps for visual results

Technical requirements:
- Use TanStack Query for caching
- Implement debounced search input
- Add loading states and error handling
- Ensure mobile-first responsive design
```

### Agent Sequencing

Run agents in logical dependency order:

1. **Backend/API** first - Core functionality
2. **Frontend** second - UI implementation
3. **Styling** third - Polish and responsive design
4. **Testing** fourth - Quality assurance
5. **Security** concurrent - Ongoing vulnerability checks
6. **Documentation** concurrent - Keep docs updated
7. **Deployment** last - Optimize and release

### Handling Agent Conflicts

When agents modify the same files:

1. Check git status for conflicts
2. Review agent scratchpads for overlapping work
3. Manually merge changes if needed
4. Run testing agent to verify integration
5. Create manual commit documenting the merge

### Performance Monitoring

After each cycle, check:

```bash
# Run performance audit
npm run build:analyze

# Check Lighthouse scores
# (Manual browser check for Core Web Vitals)

# Monitor bundle size
ls -lh dist/assets/*.js
```

---

## Keyboard Shortcuts (UI)

| Key | Action |
|-----|--------|
| `Ctrl+Shift+R` | Refresh status |
| `Ctrl+K` | Focus search (for cards) |
| `Escape` | Close details panel |
| `Arrow Keys` | Navigate card tree |
| `Enter` | Open selected card |
| `Space` | Toggle Rumfor panel |

---

## Troubleshooting Common Issues

### Agent Mode Not Switching

If Roo Code doesn't switch modes:

1. Check `.rumfor.roomodes` syntax is valid
2. Verify mode slug matches exactly (e.g., `rumfor-frontend`)
3. Restart Roo Code
4. Check Roo Code agent mode settings

### Status Not Updating

```bash
# Regenerate status files
python tools/compile_rumfor_status.py

# Check directory permissions
ls -la .rumfor/

# Verify agent is calling status methods
grep "mark_complete\|mark_start" .rumfor/scratchpads/*/scratchpad.md | tail -5
```

### Bundle Size Growing

After frontend agent runs bundle analysis:

```bash
# Check what's taking up space
npm run build:analyze

# Common fixes:
# - Lazy load heavy components
# - Remove unused dependencies
# - Optimize images in applications
```

### E2E Tests Failing After Changes

```bash
# Check if selectors changed
grep "data-testid\|aria-label" src/components/ | head -10

# Update test utilities
cat ../e2e-tests/tests/utils.ts

# Run tests locally first
npm run test:e2e
```

---

## Advanced Usage

### Custom Development Cycles

Create focus cycles for specific features:

```bash
# Authentication-focused cycle
echo "API Agent: Strengthen authentication" > cycle_auth.txt
echo "Security Agent: Audit auth security" >> cycle_auth.txt
echo "Testing Agent: Test auth flows" >> cycle_auth.txt
```

### Integration with GitLab CI/CD

The system works seamlessly with your existing pipeline:

- Agents run during development
- CI validates agent changes
- Deployment agent optimizes for production
- Security agent contributes to audit reports

### Collaborative Development

Multiple developers can use the system:

- Each runs agents independently
- Git merges agent changes automatically
- Status files show who's working on what
- Scratchpads maintain team knowledge

---

## Next Steps

- [Custom Agents Guide](CUSTOM_AGENTS.md) - Create your own specialist agents
- [Architecture](ARCHITECTURE.md) - Deep dive into system internals
- [Setup](SETUP.md) - Installation and configuration

---

## Quick Reference

| Task | How |
|------|-----|
| Run single agent | Click agent card → Paste in Roo Code |
| Run full cycle | Click "Run All" → Paste in Roo Code |
| Check progress | Open UI, look at Rumfor panel |
| View agent memory | `cat .rumfor/scratchpads/{agent}_scratchpad.md` |
| See what changed | `git log --grep="Agent"` |
| Reset stuck agent | Edit `.rumfor/status.json`, set status to "idle" |
| Create checkpoint | `git tag manual-$(date +%Y-%m-%d)-name` |
| Fix agent conflicts | `git status` then `git add .` for manual merge |
| Profile performance | `npm run build:analyze` after frontend agent |

The Rumfor system enhances your existing development workflow by providing specialized AI assistance for each aspect of your market tracker application, from React components to MongoDB optimization to CI/CD deployment.