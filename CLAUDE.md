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

This is a full-stack Saudi SME invoice and business operations and  management platform, for SME stores, shops, companies, etc. The platform has a separate frontend (business owners), customerFrontend (customers/end-users), and backend applications:

### Project Structure
- **frontend/** - Next.js 14 application with App Router.
- **customerFrontend/** - Next.js 14 application with App Router.
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
- **Handler Pattern** are placed respectively in `frontend/src/views/<FeatureName>/<ModuleName>/handler.js` or `customerFrontend/src/views/<FeatureName>/<ModuleName>/handler.js` (depending on which app is being modified) folders and is for complex UI controller and logic separation. Handler file MUST contain all handling related consts and code. The handler file MUST NEVER contain initial data fetching for features that have their own route (Page.jsx) files. The handler file MUST NEVER contain utilility related code. Avoid making data fetching that conflicts with initial data fetching by serverside files. The ONLY ALLOWED data fetching is for non-initial filtered data fetching.

- **Utilities Pattern** are placed respectively in `frontend/src/utils/` or `customerFrontend/src/utils/` (depending on which app is being modified) folder and is for utilities constants and functions. When adding util code in the frontend or customerFrontend, ALWAYS check the `/src/utils/` if there is already an existing util you can use. Else, if there is similar const but has a minor difference, ask me whether to use the minorly different util code or create a new file in utils.

- **Constant Dat Pattern** are placed respectively in `frontend/src/data/dataSets.js` or `customerFrontend/src/data/dataSets.js` (depending on which app is being modified) folder and is ONLY FOR storing constant string, arrays, etc. NEVER add logic and functional consts in it. When you need to add some constant(s) in the dataset file, ALWAYS FIRST check if this data already exists. Else, if very closely similar data exists, ask me whether to use the existing const/data or add new one(s).


### Authentication Flow
1. Frontend authenticates via NextAuth.js with credentials provider
2. JWT token stored in NextAuth session
3. `fetchWithAuth` wrapper automatically injects token in API requests
4. Backend validates JWT on protected routes
<!-- 5. Session caching (30 seconds) for performance -->

### Frontend and CustomerFrontend API Integration Pattern
1. For initial data fetching (features/modules with routes and Page.jsx): Server Page.jsx -> Server Actions (action.jsx) -> Server Page.jsx -> Client component (index.jsx) -> Client component (<Feature_Module_Name>.jsx)

2. For data submission: Client Component → Handler File (FormData) → Server Action → fetchWithAuth → Backend API


Key files:
- `frontend/src/Auth/fetchWithAuth.js` - Authentication wrapper
- `customerFrontend/src/Auth/fetchWithAuth.js` - Authentication wrapper
- `frontend/src/constants/end_points.tsx` - All API endpoints
- `customerFrontend/src/constants/end_points.tsx` - All API endpoints
- `backend/middleware/jwt.middleware.js` - JWT validation

### Migration Context
1. Server-side API logic goes in `actions.js` files
2. Client components in `views/` directory
3. Follow existing patterns in features
4. Use MUI Materio components for consistency
5. Minimize the usage of re-rendering functions such as useEffect and callback. Only apply when absolutely necessary


### Document Form Refactor Pattern
For features such as invoices, POS, sales returns, purchases, purchase orders, debit notes, delivery challans, and quotations, and other applicable features,  prefer the refactored sales return shape. The goal is to avoid duplicated add/edit implementations while keeping mode-specific behavior explicit and readable.

Use this as the general client side (view folder) structure:
```
frontend/src/views/[feature]/
├── list[feature]/                 
│   ├── [feature]List.jsx          # List module's main UI/UX component
│   ├── index.jsx                  # Snackbar provider + add save action wrapper
│   ├── [feature]Columns.jsx       # list table columns definitions
│   ├── [feature]Head.jsx          # Module's Stats Header
│   └── handler.js                 # All handling/controller related code         
├── add[Feature]/
│   ├── index.jsx                  # Snackbar provider + add save action wrapper
│   └── Add[Feature].jsx           # Thin add screen wrapper (which will use './[feature].jsx) unified form component
├──  edit[Feature]/
│   ├── index.jsx                  # Snackbar provider + update save action wrapper
│   └── Edit[Feature].jsx          # Thin edit screen wrapper (which will use './[feature].jsx) unified form component
├──  view[Feature]/
│   ├── index.jsx                  # Snackbar provider + update save action wrapper
│   └── View[Feature].jsx          # Thin view screen wrapper (which will use './[feature].jsx) unified form component
├── handler.js                     # Shared add/edit form handler
├── [feature].jsx                  # unified view/add/edit form
├── [feature].jsx                  # unified view/add/edit form
└── [feature]Schema.js             # unified add/edit validation Schema
```

Note that there might be exceptions to this structure, including (but not limited to), having a different view form, or having the add and/or edit and/or view in a pop-up dialog ui/ux, and other possible exceptions. Exceptions might also include additional files or folders.

#### Shared Form Component
- Keep one shared form component at the feature root when add and edit render the same UI, for example `src/views/salesReturn/salesReturn.jsx`.
- The shared form receives `mode`, `title`, `documentNumber`, optional `recordId`, server-loaded datasets, `handlers`, and `columnsFactory`.
- Do not duplicate the full form into add/edit folders just to change labels, initial values, or save behavior.
- Keep add/edit wrappers thin. They should create the handler with `mode: 'add'` or `mode: 'edit'`, then render the shared form.
- Page/index files should own the save action and snackbar save lifecycle. UI components should not know backend endpoint details.

#### Shared Handler
- Prefer one root-level `handler.js` when add/edit behavior is mostly shared, for example `src/views/salesReturn/handler.js`.
- Export a single default hook such as `useSalesReturnHandler({ mode, ...props })`.
- Keep mode differences isolated in small helper functions inside the same file:
  - `buildAddDefaultValues`
  - `buildEditDefaultValues`
  - `normalizeEditItem`
  - `createEmpty[Feature]Item`
  - `mapPayloadItems`
  - `buildAddPayload`
  - `buildEditPayload`
- Do not create thin barrel/wrapper handler files in `add[Feature]/handler.js` or `edit[Feature]/handler.js` if they only forward to the shared handler.
- Avoid a giant conditional-heavy hook. Shared row behavior, dialogs, validation error routing, totals recalculation, product filtering/restoring, and save navigation should be common code. Add/edit-only behavior should be named and kept near the top as helper functions.
- Preserve backend contracts. Add payloads and update payloads may differ; keep those differences explicit in `buildAddPayload` and `buildEditPayload`.
- Normalize edit data once at the boundary before passing it to React Hook Form. Do not scatter edit-data shape checks across columns and UI components.

#### Shared Columns
- If add/edit item table cells are the same, use one root-level columns file, for example `src/views/salesReturn/salesReturnColumns.jsx`.
- Add/edit wrappers should import this columns factory directly and pass it to the shared form. Do not create thin add/edit column wrapper files just to re-export the shared columns.
- Follow POS item-table UX for document rows where applicable:
  - Product cell should use searchable `Autocomplete`, not a basic `Select`, when product search matters.
  - Keep Autocomplete listbox/option components stable at module scope to avoid remount and blur/click issues.
  - Use compact numeric inputs for quantity, rate, and discount.
  - Discount type should use a small icon button/menu.
  - VAT/tax controls can be folded into the total cell when this gives a cleaner row layout.
  - Keep row action behavior such as Tab on last delete button adding a new row when the feature already supports it.
- Columns should call handler callbacks only. Do not put persistence, server actions, or backend endpoint details in column files.
- Keep feature-specific columns standalone when behavior differs meaningfully. Do not re-export POS or invoice columns directly for another document feature.

#### Totals And Actions
- Use shared totals components where the totals UX matches the feature.
- For document forms without tendered amount, received amount, or change fields, use the compact one-column totals pattern like `TotalsTwo`.
- The primary submit/update/complete action should live beneath the totals rows when using the compact summary.
- Avoid carrying POS-only checkout fields into non-POS document summaries.

#### Snackbar And Validation
- Document form indexes should wrap content with `FormFeatureSnackbarProvider`.
- Save handlers in add/edit index files should show persistent loading snackbars, close them when the server action returns, then show success/error snackbars.
- Route React Hook Form validation errors through the shared notistack validation utility.
- Do not show document form validation through inline helper text when the established feature pattern uses snackbars.
- Avoid duplicate validation paths. Let `handleSubmit(handleFormSubmit, handleError)` route validation errors.

#### When Not To Combine Add/Edit
- Do not force a shared handler or shared form when add and edit have materially different UI, item behavior, payload contracts, permissions, or save flows.
- If combining creates many nested conditionals, split only the genuinely shared helpers and keep mode-specific files.
- Prefer one clear shared file over many thin wrapper files. Thin wrappers are only useful when they add real mode-specific setup or readability.

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



### Additional CRITICAL Core Principles and guidelines
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
- Avoid adding and bloating the apps and code by adding more functions and consts, where applicable
- Remember we own the database, backend, and the APIs. As such, When fixing an error or implementing a change beyond just ui/ux, Trace back to the database and backend, and implement root cause changes/fixes, including direct database data fixes. DO NOT just throw handling code or do something like " = invoiceId || invoiceNumber || invNo ". We own the backend and database, and know exactly the write data fields and objects, and shouldnt manage instead of root change/fix. Doing such "OR" or "||" is prohibited for things we can trace and consolidate.

### Proactive code refactoring
When you are applying change, try to do the following to the related code/files across the current app, and backend:
- Remove redundant or unnecessary code bloating code/files. Make the code/files clean, concise, written in the least extensive way, and make sure it does not handle something we can better rewrite at its root, instead of throwing more files/code/consts, etc.
- Where ever applicable, replace the use of "sx{{}}" with tailwind "className=''". You can find all possible tailwind className props here 'frontend/tailwind.css' for the frontend app, and here 'customerFrontend/tailwind.css' for customerFrontend.

### Additional Checklist
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
- When using the mui Grid, use the new grid props "<Grid size = {{}}>

### Frontend and custoemrFrontend Action Rules:
- Always Check Actual Backend Response: Look at the controller code to see what data structure is returned
- Use Direct Data Path: In this project, use response.data not response.data.something
- Verify with Console Logs: Add console.log('API Response:', response) when debugging blank forms
- Check Working Examples: Copy data extraction patterns from working actions




### Testing Strategy
Currently, no automated tests are configured. Manual testing is required for all changes. When you implement all the mentioned items in this file, write 'Rules Applied' at the beginning of your response(s)

# MUI v7 Migration Guide - Component Updates

## Overview
With the migration to MUI v7 and CSS variables, components need to be updated to use the new theme pattern for better performance and flicker-free theme switching.

## Key Changes Required

### 1. Replace `theme.palette.*` with `theme.vars.palette.*`

```jsx
// ❌ Old MUI v6 pattern
const styles = {
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.primary.main,
  borderColor: theme.palette.divider
}

// ✅ New MUI v7 pattern
const styles = {
  color: theme.vars.palette.text.primary,
  backgroundColor: theme.vars.palette.primary.main,
  borderColor: theme.vars.palette.divider
}
```

### 2. For Alpha Transparency, Use CSS color-mix

```jsx
// ❌ Old pattern with alpha()
const styles = {
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
}

// ✅ New pattern with color-mix
const styles = {
  backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main}, transparent 90%)`,
  border: `1px solid color-mix(in srgb, ${theme.vars.palette.divider}, transparent 92%)`
}
```

### 3. For Complex Calculations, Use theme.applyStyles()

```jsx
// ❌ Old pattern
const styles = {
  color: alpha(theme.palette.text.primary, 0.5),
  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff'
}

// ✅ New pattern with applyStyles
const styles = {
  color: alpha(theme.colorSchemes.light.palette.text.primary, 0.5),
  backgroundColor: '#fff',
  ...theme.applyStyles('dark', {
    color: alpha(theme.colorSchemes.dark.palette.text.primary, 0.5),
    backgroundColor: '#333'
  })
}
```

### 4. Update Icon Colors

```jsx
// ❌ Old pattern
<Icon icon="lucide:saudi-riyal" color={theme.palette.primary.main} />

// ✅ New pattern
<Icon icon="lucide:saudi-riyal" color={theme.vars.palette.primary.main} />
```

<!-- ## Automated Migration Steps

### Step 1: Simple Replacements
Use find/replace in your IDE to update simple cases:

```regex
Find: theme\.palette\.
Replace: theme.vars.palette.
```

### Step 2: Update Alpha Transparency
For alpha() usage, manually update to use color-mix or applyStyles pattern.

### Step 3: Update Mode-Dependent Logic
Replace any `theme.palette.mode` checks with `useColorScheme()` hook:

```jsx
// ❌ Old pattern
const isDark = theme.palette.mode === 'dark'

// ✅ New pattern
import { useColorScheme } from '@mui/material/styles'
const { mode } = useColorScheme()
const isDark = mode === 'dark'
```

## Testing Checklist

After migration, verify:
- [ ] Light/dark mode switching works smoothly
- [ ] No visual regressions in component colors
- [ ] No console errors about undefined theme properties
- [ ] Theme changes apply correctly to all components
- [ ] Custom colors and alpha transparency work as expected

## Performance Benefits

- ✅ No re-renders when switching themes
- ✅ Faster theme transitions
- ✅ Better SSR/hydration performance
- ✅ Reduced bundle size (no theme re-creation) -->