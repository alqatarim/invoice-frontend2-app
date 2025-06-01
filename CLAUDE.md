# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run dev        # Start Next.js development server (default)
npm run fast       # Start with Turbopack for faster builds

# Production
npm run build      # Build for production
npm start          # Start production server

# Utilities
npm run remove-unused-dependencies  # Clean up unused dependencies

# Sass compilation (if working with SCSS)
sass --watch main.scss:../css/style.css
```

## High-Level Architecture

### Project Structure
This is a **Next.js 14** invoice management application using the App Router with the following key architectural decisions:

### Routing Architecture
- **App Router** with grouped routes:
  - `(dashboard)` - Authenticated pages with sidebar layout
  - `(blank-layout-pages)` - Auth pages without sidebar
- Server-side rendering with async server components
- Each module follows a consistent pattern: list → add → edit → view pages

### Authentication System
- **NextAuth.js v4** with JWT strategy and custom credentials provider
- Server-side session management via `getServerSession` 
- Custom `fetchWithAuth` wrapper (src/Auth/fetchWithAuth.js) that:
  - Automatically injects authentication tokens
  - Logs all API requests/responses to logs/apiLogs.json
  - Handles token refresh and error scenarios
- Role-based permissions stored in session as `permissionRes` object
- Protected routes using `AuthGuard` HOC

### State Management Pattern
- **Context-based approach** without global state libraries:
  - `SettingsContext` - Theme/layout preferences (persisted to cookies)
  - `PermissionsContext` - User permissions from session
  - Navigation contexts for menu state
- Server-side data fetching with props passed to client components

### API Integration Pattern
- **Server Actions** in `actions.js` files for each module
- Consistent pattern: FormData → Server Action → fetchWithAuth → Backend
- Error handling with try-catch blocks returning `{ success, data, error }`
- Backend endpoints organized by feature (INVOICE, PAYMENT, etc.)

### Component Architecture
- **Handler Pattern** for complex UI logic:
  ```
  useInvoiceListHandlers → combines multiple specialized handlers
  ├── dataHandler.js     - Data fetching/manipulation
  ├── filterHandler.js   - Filter state management
  ├── actionsHandler.js  - UI actions (delete, convert, etc.)
  └── columnsHandler.js  - Table column definitions
  ```
- Separation of concerns: Actions (server) → Handlers (logic) → Components (UI)

### UI System
- **Material-UI (MUI)** as primary component library
- **Tailwind CSS** for utility styling
- Custom theme system with CSS variables
- Dark/light mode support
- RTL support with i18n setup

### Key Patterns to Follow
1. **Server Actions**: Always use FormData for data passing between client and server
2. **Authentication**: Use `fetchWithAuth` for all API calls requiring authentication
3. **Permissions**: Check permissions using `PermissionsContext` before rendering UI elements
4. **Data Tables**: Use `CustomListTable` component with handler pattern
5. **Forms**: Use react-hook-form with yup validation schemas
6. **File Uploads**: Handle through FormData with proper multipart encoding

### Module Structure
Each feature module (invoices, purchases, etc.) follows this structure:
```
module/
├── actions.js         # Server actions
├── ModuleList.jsx     # List page component
├── AddModule.jsx      # Add page component
├── EditModule.jsx     # Edit page component
└── handlers/          # UI logic handlers
```

### Important Files
- `src/constants/end_points.tsx` - All backend API endpoints
- `src/common/schema.js` - Validation schemas
- `src/data/navigation/` - Menu configuration
- `src/@core/theme/` - Theme configuration
- `src/utils/` - Utility functions for formatting, calculations, etc.

### Development Notes
- Most files use `.jsx` extension (limited TypeScript adoption)
- Server components are async by default
- Client components must have `"use client"` directive
- FormData is the primary method for client-server data transfer
- All API responses follow `{ success, data, error }` pattern