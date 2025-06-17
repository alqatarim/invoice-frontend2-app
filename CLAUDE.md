# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Commands
```bash
cd frontend

# Development
npm run dev        # Start Next.js development server
npm run fast       # Start with Turbopack for faster builds

# Production
npm run build      # Build for production
npm start          # Start production server

# Utilities
npm run remove-unused-dependencies  # Clean up unused dependencies
```

### Backend Commands
```bash
cd backend

# Development
npm run dev        # Start with nodemon (auto-restart on changes)

# Production
npm start          # Start production server

# Database
npm run seed       # Seed the database with initial data
```

## High-Level Architecture

This is a full-stack invoice management system with separate frontend and backend applications:

### Project Structure
- **frontend/** - Next.js 14 application with App Router. User is working on this application and migrating from the frontend-Old application
- **frontend-Old/** - Legacy React.js application (reference only, being migrated)
- **backend/** - Express.js REST API with MongoDB

### Backend Architecture (Express.js + MongoDB)
- RESTful API with modular route structure in `api/` directory
- JWT-based authentication middleware on all protected routes
- MongoDB with Mongoose ODM for data modeling
- File upload handling for documents and signatures
- Environment-based configuration (development/production)
- Tenant-based multi-tenancy support

### Frontend Architecture (Next.js 14)
- **App Router** with grouped routes:
  - `(dashboard)` - Authenticated pages with sidebar layout
  - `(blank-layout-pages)` - Auth pages without sidebar
- **NextAuth.js v4** for authentication with JWT strategy
- **Material-UI (MUI) Materio** as the primary UI component library
- **Server Actions** pattern for API communication
- **Handler Pattern** are placed respectively in `frontend/src/Handlers/<FeatureName>/<ModuleName>/` folders and is for complex UI logic separation
- **Utilities Pattern** are placed respectively in `frontend/src/utils/` folder and is for utilities constants and functions
- **Constant Dat Pattern** are placed respectively in `frontend/src/data/dataSets.js` folder and is for storing constant string, arrays, etc.
- **Handlers Pattern** are placed respectively in `frontend/src/handlers/` folder and is for components handlers definitions. Avoid making data fetching that conflicts with initial data fetching by serverside files.

### Authentication Flow
1. Frontend authenticates via NextAuth.js with credentials provider
2. JWT token stored in NextAuth session
3. `fetchWithAuth` wrapper automatically injects token in API requests
4. Backend validates JWT on protected routes
5. Session caching (30 seconds) for performance

### API Integration Pattern
```
Client Component → FormData → Server Action → fetchWithAuth → Backend API
```

Key files:
- `frontend/src/Auth/fetchWithAuth.js` - Authentication wrapper
- `frontend/src/constants/end_points.tsx` - All API endpoints
- `backend/middleware/jwt.middleware.js` - JWT validation

### Migration Context
The project is actively migrating from React.js (frontend-Old) to Next.js 14 (frontend). When migrating features:
1. Server-side logic goes in `actions.js` files
2. Client components in `views/` directory
3. Follow existing patterns in migrated features
4. Use MUI Materio components for consistency
5. Minimize the usage of re-rendering functions such as useEffect and callback. Only apply when absolutely necessary

### Module Structure Pattern
Each feature module follows this structure:
```
frontend/src/app/(dashboard)/[module]/
├── actions.js                    # Server actions
├── [module]-list/page.jsx        # List page
├── [module]-add/page.jsx         # Add page
├── [module]-edit/[id]/page.jsx   # Edit page
└── [module]-view/[id]/page.jsx   # View page

frontend/src/views/[module]/
├── list[Module]/                 # List components
├── add[Module]/                  # Add components
├── edit[Module]/                 # Edit components
└── view[Module]/                 # View components
└── [Module]Schema/               # Schem
```

### Key Development Patterns
1. **FormData Usage**: All client-server communication uses FormData
2. **Error Handling**: Consistent `{ success, data, error }` response pattern
3. **File Uploads**: Handle signatures and documents via multipart FormData
4. **Permissions**: Check user permissions before rendering UI elements
5. **Roles**: Check user role before rendering UI elements
6. **API Logging**: All requests logged to `frontend/logs/apiLogs.json`

### Database Seeding
The backend includes seeders for initial data setup:
```bash
cd backend && npm run seed
```

### Database Access
The database used is the mongodb database named dreams_kanakku and is added to the MCP

### Environment Configuration
Both applications use environment variables:
- Frontend: Standard Next.js `.env.local`
- Backend: `.env` file with DB connection, JWT secrets, etc.



### Additional Core Principles and guidelines
- Apply best practices
- Modularize code where applicable
- Re-use and/or create reusable code blocks and files and components
- Make code and files and structure easliy readable and modifiable
- CustomListTable component uses 'rows' prop for data, NOT 'data' prop. Using 'data' will cause silent rendering failure.
- CustomListTable pagination object expects 'page' property (zero-indexed), NOT 'current' property. Wrong property names break pagination.
- Always add fallback empty arrays when passing potentially undefined arrays to handlers to prevent runtime errors accessing array properties.
- When data appears in console logs but not in UI tables, check prop names first this is usually a component API mismatch rather than a data fetching issue.
- Verify component prop expectations before implementation to avoid silent failures where components receive data but don't render it due to incorrect prop names.
- No Hook Violations: Never call hooks inside useMemo, useCallback, or other hooks
- Self-Contained Handlers: Each handler manages its own state independently
- Simple Composition: Main hook just combines handlers, no complex state management
- Single Responsibility: Each handler has one clear purpose
- Minimal useEffect: Avoid multiple useEffects and complex dependencies

### Additional Migration Checklist
- Create individual handlers with single responsibility
- Move all hooks to top level of handlers/components
- Remove complex optimizations that cause bugs
- Use simple state management with basic useState
- Create main composite hook that just combines handlers
- Simplify component to just call handlers and render
- Test for hook violations and infinite loops
- Follow the invoices pattern as reference
- Make sure to apply the roles and permissions code found in the frontend-Old app
- keep it simple and follow existing patterns. When in doubt, copy the working pattern from DebitNoteList or another working component rather than creating new complex patterns

### Frontend Action Rules:
- Always Check Actual Backend Response: Look at the controller code to see what data structure is returned
- Use Direct Data Path: In this project, use response.data not response.data.something
- Verify with Console Logs: Add console.log('API Response:', response) when debugging blank forms
- Check Working Examples: Copy data extraction patterns from working actions




### Testing Strategy
Currently, no automated tests are configured. Manual testing is required for all changes. When you implement all the mentioned items in this file, write 'Rules Applied' at the beginning of your response(s)