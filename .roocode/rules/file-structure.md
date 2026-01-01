# File Structure and Organization Rules

## Wasp Project Structure

```
app/
├── main.wasp                 # Main Wasp configuration
├── src/
│   ├── client/               # Frontend React components
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── hooks/           # Custom React hooks
│   ├── server/               # Backend server code
│   │   ├── operations.ts    # Wasp operations
│   │   └── utils.ts         # Server utilities
│   ├── shared/               # Shared code
│   ├── auth/                 # Authentication pages/components
│   ├── admin/                # Admin dashboard
│   ├── payment/              # Payment integration
│   └── user/                 # User management
├── schema.prisma            # Database schema
└── public/                  # Static assets
```

## Naming Conventions

### Files
- Use PascalCase for React components (e.g., `UserProfile.tsx`)
- Use camelCase for utilities and hooks (e.g., `useAuth.ts`)
- Use kebab-case for page files if needed

### Directories
- Group related features in directories
- Use plural names for collections (e.g., `components/`, `pages/`)

### Wasp Entities
- Use singular names for entities (e.g., `entity User { ... }`)
- Follow Prisma naming conventions

## Import Organization
- Group imports: React, third-party libraries, local imports
- Use absolute imports from `src/` when possible
- Follow Wasp import conventions: `import { ... } from 'wasp/...'` for operations

## Component Structure
- Keep components focused on single responsibility
- Use index files for clean imports
- Separate business logic from presentation