# Project Conventions

## Wasp Configuration

### main.wasp Structure
```
app MyApp {
  title: "My SaaS App",
  // ... other config
}

entity User { ... }
entity Task { ... }

route RootRoute { path: "/", to: LandingPage }
route DashboardRoute { path: "/dashboard", to: DashboardPage }

page LandingPage { ... }
page DashboardPage { ... }

query getTasks { ... }
action createTask { ... }

auth { ... }
```

### Import Conventions
- Use `wasp/...` for Wasp-generated imports
- Use `@src/...` for relative imports in config

## Database Schema

### Entity Naming
- Use PascalCase for entity names
- Use camelCase for field names
- Add proper relations and constraints

### Migration Strategy
- Create migrations for schema changes
- Test migrations in development
- Document breaking changes

## Frontend Components

### UI Library
- Use shadcn/ui components for consistency
- Extend with custom variants when needed
- Follow accessibility guidelines

### State Management
- Use Wasp operations for server state
- Use React hooks for local state
- Avoid global state when possible

## API Design

### Operations
- Use descriptive names (getUserTasks, createProject)
- Return proper error types
- Implement optimistic updates

### Endpoints
- Follow RESTful conventions where applicable
- Use consistent response formats
- Document API changes