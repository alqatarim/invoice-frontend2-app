# Frontend Feature Refactoring Guide

## Purpose
This document is the source of truth for future frontend feature refactors in `frontend/`.

It captures the final structure, separation rules, and coding patterns agreed during the invoices refactor discussion. The goal is to make every feature:

- Easy to read
- Easy to update
- Easy to debug
- Easy for buyers and future developers to understand
- Low in dependency coupling
- Clear in data flow from server to client

This guide intentionally prefers directness over cleverness.

## Main Principles
- Keep feature code close to the feature.
- Keep initial data fetching on the server only.
- Keep API functions local to the route feature `actions.js`.
- Keep page-level composition in `index.jsx`.
- Keep feature-local state and handlers in one sibling `handler.js`.
- Keep the main render/UI file focused on rendering.
- Remove transitional UI modes and unused render branches when the final accepted feature only needs one path.
- Extract only truly reusable code.
- Before finishing any refactor, run a mandatory reuse audit for `src/utils` and `src/data/dataSets.jsx`.
- Before finishing any refactor, run a mandatory redundancy audit for extra wrapper layers, duplicate fetch paths, stale `useEffect` / `useMemo` / `useCallback` logic, and dead files.
- Avoid unnecessary abstraction, reshaping, normalization, and safety layers when the backend contract is already known.

## Important Final Rules
These are the final stricter rules that should now be followed going forward.

### 1. Initial data fetching is server-only
- Initial feature data must be fetched in `page.jsx`.
- Client-side initial fetches are not allowed.
- There must be no "fallback fetch" in the client if the server did not pass data.
- If the server did not provide the data, the client should render the appropriate empty, not found, or failed state.

### 2. `actions.js` must be feature-local and self-contained
- A feature route `actions.js` must not import another feature's `actions.js`.
- A feature route `actions.js` must not become a wrapper/re-export file around another `actions.js`.
- Each function inside `actions.js` must represent one backend API call only.
- `page.jsx` is responsible for orchestrating multiple independent action calls when needed.

### 3. `handler.js` is not for initial loading
- `handler.js` must not fetch initial page data.
- `handler.js` may call the local route `actions.js` only when user interaction requires a filtered/search/sort/pagination refetch.
- The handler should otherwise focus on local UI state, local derived values, and event handlers.

### 4. Pass independent raw data objects to the client
- `page.jsx` should pass separate props such as `initialInvoiceData`, `initialCompanyData`, `initialInvoiceSettings`.
- Do not merge multiple backend responses into one large client "pageData" object unless there is a very strong reason.
- This keeps updates easier when one backend response shape changes.

### 5. Unified naming for server props, paired screens, and backend fields
Consistency reduces mistakes when copying patterns between similar routes (for example add vs edit invoice).

**Server → client (`page.jsx` → `index.jsx`)**
- Use an `initial` prefix on prop names for every piece of **server-hydrated** data passed into the client entry component. That makes it obvious what came from the server on first paint versus what is created later in the client.
- Examples used together on invoice flows: `initialCustomersData`, `initialProductData`, `initialTaxRates`, `initialBanks`, `initialSignatures`, `initialBranchesData`.
- The **primary entity** for the route should follow the same idea: `initialInvoiceNumber` (add), `initialInvoiceData` (edit), or `initialEntity` for a generic resource.
- In `page.jsx`, you can name the `Promise.all` results with the same `initial*` names so the file reads one-to-one with the props passed to `index.jsx`.

**`index.jsx` → `handler.js`**
- Map `initial*` props into the handler with names that stay readable inside the hook. It is acceptable to pass `initialCustomersData` as `customersData` into the handler when the handler is clearly about "current lists used by the form," as long as the mapping happens in one place (`index.jsx`).
- For the **loaded entity snapshot**, prefer keeping the `initial` prefix in the handler when it is still the server-provided record (for example `initialInvoiceData` on edit, `initialInvoiceNumber` on add). That matches the server contract mentally: "this is what we started with."

**Paired add / edit (or parallel routes)**
- When two routes implement the same feature (add and edit invoice), reuse the **same** `initial*` names for shared datasets (`initialCustomersData`, `initialProductData`, etc.). Only the props that must differ should differ (`initialInvoiceNumber` vs `initialInvoiceData`).
- The main UI component (`AddInvoice.jsx` / `EditInvoice.jsx`) can keep shorter prop names (`customersData`, `productData`) when it only needs the live lists for controls—those props should still be wired from the same `initial*` sources in `index.jsx`.

**Backend field names**
- Prefer **one canonical spelling** per field across the app that matches the backend and existing screens (`TotalAmount`, `taxInfo`, `invoiceNumber`, etc.). Do not introduce alternate camel-casing or renamed keys in intermediate objects unless you are performing a deliberate API adapter at a boundary.
- Payload builders (`buildAddInvoicePayload`, `buildEditInvoicePayload`, etc.) should use the same field names the backend expects, not a parallel renamed shape.

### 6. Avoid abstraction that hides obvious data flow
- Do not create unnecessary view models when raw data is already readable enough.
- Do not create generic `safeObject`, `safeString`, `safeNumber` style layers for known backend contracts.
- Do not create utility files for feature handler logic.
- Do not create helper components inside a file when they are used only once and only simplify repeated markup very slightly.

### 7. Reuse and placement audit is mandatory
- This is not optional and must not be skipped, even for small or urgent refactors.
- Before adding any new helper function, helper constant, or hardcoded options array, first check whether the concern already exists in `src/utils` or `src/data/dataSets.jsx`.
- If the logic is reusable and feature-agnostic, reuse or move it into `src/utils`.
- If the data is static, reusable, and hardcoded, reuse or move it into `src/data/dataSets.jsx`.
- If the logic is feature-specific render shaping used only by that one screen, keep it local to the feature instead of forcing it into shared files.
- After the refactor, do a final duplicate cleanup pass so there is one canonical helper/dataset instead of parallel copies in the feature and shared folders.
- If existing imports elsewhere still depend on an older shared entry point, preserve compatibility deliberately (for example by re-exporting from the canonical file) instead of leaving duplicate implementations behind.

### 8. Redundancy audit is mandatory
- This is not optional and must not be skipped, even when the feature already "works".
- Remove wrapper files or component layers that only forward props and no longer provide real page-level composition, mutation adaptation, or reusable UI value.
- Do not keep two competing data-loading paths for the same first render (for example server hydration plus a client fallback fetch for the same initial data).
- If a route is now server-hydrated, delete the old client rescue fetch instead of leaving both paths in place.
- Replace pure derived-state `useEffect` logic with direct render derivation or `useMemo` when no side effect is actually happening.
- Remove stale `useMemo` / `useCallback` layers when they no longer protect an expensive calculation or a memoized child boundary.
- Collapse duplicate handler stacks when one local `handler.js` can clearly own the route behavior.
- Delete unused feature files, dead branches, unused imports, and placeholder wiring before considering the refactor complete.

## Canonical Folder Structure
For a feature route, the expected structure is:

```text
frontend/
  src/
    app/
      (dashboard)/
        <feature>/
          <sub-feature-route>/
            page.jsx
            actions.js

    views/
      <feature>/
        <sub-feature>/
          index.jsx
          handler.js
          <MainFeatureComponent>.jsx
          <OtherFeatureSpecificUiComponents>.jsx

    components/
      <feature>/
        <TrulyReusableFeaturePart>.jsx
      <type>/
        <CrossFeatureReusableComponent>.jsx

    utils/
      <single-purpose-utility>.js

    data/
      dataSets.jsx
```

## File Responsibilities

## `page.jsx`
`page.jsx` is the server-side entry for the route.

It should:
- Be the only place that fetches initial data for the page.
- Call the local `./actions.js` functions directly.
- Call multiple action functions independently when multiple datasets are needed.
- Run independent requests in parallel when possible.
- Run dependent requests sequentially when one request depends on the result of another.
- Pass independent raw data objects down to the client entry component.

It should not:
- Import another route's `actions.js`.
- Move initial data fetching to client code.
- Build large feature view models.
- Contain heavy client logic.
- Hide all route loading inside a single `getFeaturePageData()` action helper going forward.

### Preferred `page.jsx` pattern
```jsx
import React from 'react'
import FeatureView from '@/views/feature/view'
import {
  getPrimaryEntity,
  getRelatedSettings,
  getRelatedList
} from './actions'

const FeaturePage = async ({ params }) => {
  const entity = await getPrimaryEntity(params.id)
  const relatedId = entity?.relatedId || ''

  const settings = await getRelatedSettings()
  const relatedList = relatedId ? await getRelatedList(relatedId) : null

  return (
    <FeatureView
      initialEntity={entity}
      initialSettings={settings}
      initialRelatedList={relatedList}
    />
  )
}

export default FeaturePage
```

### Why this is preferred
- The route data flow is obvious at a glance.
- Each API dependency is visible.
- It is easy to remove, add, or change a single backend call.
- It avoids hidden coupling between backend calls.

## `actions.js`
`actions.js` is the server-side API layer for that route feature.

It should:
- Start with `'use server'`.
- Be local to the route.
- Import low-level shared tools like `fetchWithAuth`.
- Define focused action functions that each call one backend endpoint.
- Return one clear piece of data per function.
- Keep the function naming close to the backend resource being fetched or mutated.

It should not:
- Import another feature route's `actions.js`.
- Aggregate multiple API calls into one page-loading function as the default pattern.
- Contain client-only logic.
- Become a dumping ground for unrelated API logic.

### Preferred `actions.js` pattern
```js
'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

const ENDPOINTS = {
  view: '/feature',
  settings: '/featureSettings/viewFeatureSettings',
  relatedList: '/feature/relatedList'
}

export async function getFeatureById(id) {
  if (!id || typeof id !== 'string') {
    return null
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.view}/${id}`, {
      method: 'GET',
      cache: 'no-store'
    })

    return response?.data || null
  } catch (error) {
    console.error('Error fetching feature by id:', error)
    return null
  }
}

export async function getFeatureSettings() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.settings, {
      method: 'GET',
      cache: 'no-store'
    })

    return response?.data || null
  } catch (error) {
    console.error('Error fetching feature settings:', error)
    return null
  }
}

export async function getFeatureRelatedList(relatedId) {
  if (!relatedId) {
    return []
  }

  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.relatedList}?relatedId=${encodeURIComponent(relatedId)}`,
      {
        method: 'GET',
        cache: 'no-store'
      }
    )

    return response?.data || []
  } catch (error) {
    console.error('Error fetching related list:', error)
    return []
  }
}
```

### One function = one API call
This is critical.

Correct:
- `getInvoiceById(id)`
- `getCompanySettings(companyId)`
- `getInvoiceSettings()`

Incorrect:
- `getInvoiceViewPageData(id)` if it internally calls multiple APIs and bundles them together for page hydration

The orchestration belongs in `page.jsx`, not in `actions.js`.

## `index.js` / `index.jsx`
This is the client entry file for the feature route.

It should:
- Receive the server-passed props from `page.jsx`.
- Call the sibling feature `handler.js`.
- Compose page-level support pieces such as:
  - Snackbar providers
  - Action bars
  - Page-level dialogs
  - Page-level empty states
  - Page-level error states
- Pass server data and handler outputs to the main feature UI component.

It should not:
- Fetch initial page data.
- Hide server data loading inside effects.
- Turn into a second full business-logic layer.

### Important role of `index.jsx`
This is where page-level support components belong.

Examples:
- `InvoiceActionBar`
- `InvoiceReceiptDialog`
- `AppSnackbar`

These should stay in `index.jsx` rather than being embedded into the main render component when they are page-level orchestration concerns.

### Preferred `index.jsx` pattern
```jsx
'use client'

import React from 'react'
import { Paper } from '@mui/material'
import MainFeatureView from './MainFeatureView'
import { useFeatureHandler } from './handler'
import PageActionBar from '@/components/feature/PageActionBar'
import SharedDialog from '@/components/feature/SharedDialog'
import AppSnackbar from '@/components/shared/AppSnackbar'

const FeatureIndex = ({
  initialEntity = null,
  initialSettings = null
}) => {
  const handler = useFeatureHandler({
    entity: initialEntity,
    settings: initialSettings
  })

  if (!initialEntity?._id) {
    return (
      <Paper className='p-6 text-center text-error'>
        Item not found.
      </Paper>
    )
  }

  return (
    <>
      <PageActionBar
        onPrimaryAction={handler.handlePrimaryAction}
      />

      <MainFeatureView
        entity={initialEntity}
        settings={initialSettings}
        derivedState={handler.derivedState}
      />

      <SharedDialog
        open={handler.dialogOpen}
        onClose={handler.closeDialog}
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
      />
    </>
  )
}

export default FeatureIndex
```

## `handler.js`
`handler.js` is the sibling of `index.jsx`.

There should be one feature handler file per feature route.

It should:
- Hold the feature-local client state.
- Hold feature-local event handlers.
- Hold derived values that truly belong to feature behavior.
- Contain local UI orchestration logic.
- Optionally call local route `actions.js` only when user interaction requires filtered/search/sort/pagination refetch.

It should not:
- Perform initial data loading.
- Rescue missing server data with client fetches.
- Build large generic abstraction layers around known backend data.
- Move obvious render-time field access out of the UI component just to reduce lines.

### Latest strict rule for handlers
Going forward, `handler.js` should be kept especially strict:

- Initial data: server only
- Refetch after filter/search/sort/page change: allowed in handler
- User-triggered local UI state: allowed in handler
- Mutation orchestration for save/update can live in `index.jsx` if that keeps the handler narrower and clearer

### Shared handler helper policy
Most handler logic should remain in the local feature `handler.js`.

Extract a helper to `src/handlers/shared` only when all of the following are true:
- It is reused by multiple feature handlers
- It remains narrow and purpose-specific
- It supports handler behavior without hiding the main feature data flow
- It is not becoming a generic dumping ground for unrelated handler logic

Good example:
- `src/handlers/shared/notifyNotistackFormValidationErrors.js`

Bad examples:
- `invoiceFormHandlerUtils.js`
- `sharedFeatureHandler.js`
- A helper that mixes payload building, item shaping, snackbar behavior, and feature state

### Handler example for a view page
```js
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { exportElementToPdf, exportTextToPdf } from '@/utils/pdfExport'

const DEFAULT_SNACKBAR_STATE = {
  open: false,
  message: '',
  severity: 'success'
}

export function useFeatureViewHandler({
  entity = null,
  settings = null
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState(DEFAULT_SNACKBAR_STATE)

  const derivedText = useMemo(() => {
    if (!entity) return ''

    return `Entity: ${entity.name || 'N/A'}`
  }, [entity])

  const openSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar(current => ({
      ...current,
      open: false
    }))
  }, [])

  const openDialog = useCallback(() => {
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
  }, [])

  return {
    derivedText,
    dialogOpen,
    snackbar,
    openDialog,
    closeDialog,
    closeSnackbar
  }
}
```

## Main UI/UX component files
Examples:
- `ViewInvoice.jsx`
- `InvoiceList.jsx`
- `AddInvoice.jsx`
- `EditInvoice.jsx`

These files should be the main feature render files.

They should:
- Render the actual main UI.
- Receive data and callbacks as props.
- Perform only light local shaping that is directly tied to rendering.
- Keep simple display-oriented logic close to where it is displayed.

They should not:
- Fetch initial data.
- Import backend calls.
- Hide major feature state logic that belongs in the handler.
- Contain page-level dialogs/snackbar composition when those belong to `index.jsx`.
- Keep unused alternate render modes or one-use wrapper sections after the final UX has been decided.

### Remove thin wrapper layers
If a feature-local subcomponent is used only once and mostly forwards props into one render path, prefer inlining it back into the main feature screen.

Examples:
- If `AddInvoice.jsx` is the final screen, do not keep an extra `InvoiceFormEditorSection.jsx` layer unless it is genuinely reused
- If a feature no longer needs both POS and standard modes, remove the dead mode switch instead of preserving both branches

## UI component data rules

### Keep simple data access local
Because the backend code is available in this project, the frontend should rely on the known backend contract.

That means:
- Use direct optional chaining where appropriate.
- Use direct field access where the data shape is known.
- Use minimal fallback values.
- Do not add defensive abstraction layers as if the backend were unknown.

Preferred:
```jsx
{invoiceData?.customerId?.name || 'N/A'}
```

Avoid:
```js
const customer = safeObject(invoiceData.customerId)
const customerName = safeString(customer.name)
```

### Only create local constants when they truly help
Local constants in UI files are appropriate when:
- They perform calculations
- They combine multiple values in a meaningful derived result
- They prevent repeating a complex expression many times

Local constants are usually not needed when:
- They only rename a simple field
- They only unwrap one property once
- They only do trivial coercion that is used once

Preferred:
```jsx
{formatCurrencyAmount(currencyData || '$', Number(invoiceData?.TotalAmount || 0))}
```

Only extract when there is actual derived behavior:
```js
const balanceAmount = Math.max(
  Number(invoiceData?.TotalAmount || 0) - Number(invoiceData?.paidAmount || 0),
  0
)
```

### Do not create one-off file-local helper components without need
If a small render block is used only once in the same file, repeating the JSX is acceptable.

Do not extract helper components like:
- `InfoRow`
- `PartyCard`
- `SummaryRow`

unless they clearly improve maintainability and are genuinely reused.

## Shared components policy
Only extract truly reusable parts into `src/components`.

### Allowed shared component types
- Reusable action bars
- Reusable dialogs
- Reusable editor headers
- Reusable badges
- Reusable form sections used by more than one feature screen
- Reusable table-related subcomponents

### Not allowed as shared components by default
- Whole feature screens
- Whole add/edit/view pages
- Whole feature renderers just because two files use them

### Correct separation
Correct:
- `src/components/invoices/InvoiceActionBar.jsx`
- `src/components/invoices/InvoiceReceiptDialog.jsx`
- `src/components/invoices/InvoiceEditorHeader.jsx`

Incorrect:
- Moving all of `InvoiceEditor.jsx` into shared components as one large global screen component
- Moving all of `InvoiceStandardView.jsx` into shared components as a global screen component

The rule is:
- Share the parts
- Keep the actual screen local to the feature folder

## `utils` policy
`src/utils` is only for truly reusable utility code.

### What belongs in `utils`
- Shared formatting helpers
- Shared PDF export logic
- Shared numeric formatting
- Shared date formatting
- Shared product barcode helpers
- Shared totals calculators
- Shared reusable domain helpers that are feature-agnostic

### What does not belong in `utils`
- Feature view models
- Feature handlers
- Feature-specific render shaping that is only used in one screen
- Simple one-line UI-specific concatenations likely to change soon
- Generic "safety wrapper" functions for known backend contracts

### Important rule about new utility files
Do not create one monolithic feature utility file such as:
- `invoiceViewUtils.js`

Instead:
- First check whether an existing utility file already fits.
- If not, create a focused new utility file for that one reusable concern.

Good examples:
- `pdfExport.js`
- `zatca.js`
- `numberUtils.js`

Bad examples:
- A large utility file mixing receipt building, invoice view shaping, data unwrapping, UI-only field mapping, and feature logic together

### Mandatory `utils` audit before closing any refactor
- Search `src/utils` first before creating any new helper.
- Reuse an existing utility when it already solves the same concern, even if the current feature has a local copy.
- If a new helper is truly reusable, move it into the most appropriate focused utility file instead of leaving it inside the feature.
- If two similar helpers exist after the refactor, consolidate them into one canonical helper before considering the refactor complete.
- Do not close the task with duplicated reusable helpers still split across the feature and `src/utils`.

## `dataSets.jsx` policy
`src/data/dataSets.jsx` should hold static, reusable hardcoded datasets.

Examples:
- Payment method options
- Static tabs
- Static status options
- Static dropdown choices
- Reused label/value arrays

It should not hold:
- Backend-derived runtime data
- Feature handler logic
- Complex utility logic
- Computed data that is not static

Also:
- Clean overlaps and duplicates when refactoring
- Prefer one canonical dataset over multiple similar copies

### Mandatory `dataSets.jsx` audit before closing any refactor
- Search `src/data/dataSets.jsx` before introducing new static label/value arrays, tabs, statuses, filters, or other hardcoded reusable option lists.
- Reuse an existing canonical dataset when it already matches the need.
- If the new hardcoded data is static and reusable across screens, add it to `src/data/dataSets.jsx` instead of leaving it buried in one feature file.
- If duplicate static datasets exist after the refactor, consolidate them into one canonical dataset before considering the refactor complete.
- Do not leave reusable static feature options duplicated between a feature file and `src/data/dataSets.jsx`.

## Backend contract and data handling policy
This project has a backend codebase available.

That means:
- The backend should be checked when data structure is unclear.
- The frontend should not behave as if the backend is an unknown third-party system.
- Minimal safety checks are good.
- Over-defensive generic wrappers are not good.

### Required behavior
- Check backend controllers and response shape when needed.
- Use the actual returned data path.
- Prefer direct `response.data` usage when that is what the backend returns.
- Keep unwrapping minimal and local to the feature component when the logic is display-specific.

### Avoid
- `safeObject`
- `safeString`
- `safeNumber`
- `normalizeCompanyData`
- Over-normalizing data in utility files for simple display usage

### Reason
These patterns hide the real backend contract and make the code harder to follow for future developers.

## Styling rules
- Replace MUI `sx` with Tailwind `className` when practical.
- Keep `sx` only when there is no clean class-based equivalent.
- Prefer readable class composition over scattered inline styling.
- Keep styling direct and obvious.

The refactor goal is not just visual parity. It is also readability and maintainability.

## Hook and handler rules
These rules remain important across future feature refactors:

- No hook violations
- Never call hooks inside `useMemo`, `useCallback`, or nested functions
- Keep hooks at top level
- Prefer simple state
- Prefer minimal `useEffect`
- Prefer initializing stable defaults in `useForm` or `useState` instead of mount-only effects when the value is already known
- Use `useMemo` for expensive derived values or memoized child inputs, not for cheap JSX fragments
- Use `useCallback` only when stable function identity materially helps a memoized child or dependency management
- Remove stale callback and effect layers left behind by earlier feature modes
- Prefer self-contained handlers
- Keep single responsibility in each logical block

## Page composition rules
Page-level support pieces belong in `index.jsx`.

Examples:
- snackbars
- dialogs
- action bars
- provider wrappers
- page-level empty/error states

The main feature render component should focus on the actual content of the screen.

## Pagination contract
Pagination must stay consistent from backend -> `actions.js` -> `page.jsx` -> `index.jsx` -> main UI component -> table component.

This is not just a UI detail. It is a data contract.

### Required end-to-end shape
When the backend returns total count data (for example `totalRecords`), convert it once in route-local `actions.js` into a frontend pagination object such as:

```js
pagination: {
  current: 1,
  pageSize: 10,
  total: response.totalRecords || 0
}
```

Then keep that same object flowing through the route using stable naming:
- `page.jsx` -> `initialPagination`
- `index.jsx` -> `initialPagination`
- main UI component -> `initialPagination`
- handler -> `initialPagination`

Do not rename the prop to `pagination` in one file and `initialPagination` in another unless that rename is deliberate and exact. If the prop name does not match, the UI may render rows from `initialInvoices` while the table footer falls back to `total: 0`.

### `CustomListTable` pagination mapping
`CustomListTable` expects:
- `pagination.page` -> zero-indexed
- `pagination.pageSize`
- `pagination.total`

If your route state uses one-indexed paging, convert it only at the table boundary:

```jsx
pagination={{
  page: handler.pagination.current - 1,
  pageSize: handler.pagination.pageSize,
  total: handler.pagination.total
}}
```

### Initial-load rule
On first render, if the server already provided a paginated dataset:
- the rows should come from `initialInvoices` (or equivalent)
- the footer total should come from `initialPagination.total`
- the current page should come from `initialPagination.current`

These values must all come from the same initial server response. Do not let rows come from one prop while pagination falls back to a default `{ total: 0 }`.

### Common failure mode
If the table shows real rows on first load but the footer says `0-0 of 0`, check this first:
- the backend probably returned the count correctly
- `actions.js` probably mapped it correctly
- the main UI component likely destructured the wrong prop name and fell back to its default pagination object

This exact class of bug happens when `index.jsx` passes `initialPagination` but the main component reads `pagination`, or when `initialCardCounts` / `initialFilters` / similar props are renamed inconsistently across layers.

### Pagination checklist
- Backend response count confirmed (`totalRecords`, `total`, etc.)
- Route `actions.js` maps backend count into one canonical pagination object
- `page.jsx` passes `initialPagination`
- `index.jsx` forwards `initialPagination` without dropping or renaming it incorrectly
- Main UI component receives `initialPagination`
- Handler initializes from `initialPagination`
- `CustomListTable` receives zero-indexed `page` and the same `total`
- First render shows correct rows and correct footer count before any user interaction

## Current invoices example as canonical reference
**View invoice** — full read-only flow:

- `src/app/(dashboard)/invoices/invoice-view/[id]/page.jsx`
- `src/app/(dashboard)/invoices/invoice-view/[id]/actions.js`
- `src/views/invoices/viewInvoice/index.jsx`
- `src/views/invoices/viewInvoice/handler.js`
- `src/views/invoices/viewInvoice/ViewInvoice.jsx`

**Add / edit invoice** — paired write flows (use together for naming and structure):

- `src/app/(dashboard)/invoices/add/page.jsx` and `src/app/(dashboard)/invoices/edit/[id]/page.jsx`
- Matching route-local `actions.js` files (self-contained, one function per API call)
- `src/views/invoices/addInvoice/index.jsx` and `src/views/invoices/editInvoice/index.jsx` (page-level providers, dialogs, mutation adapter)
- `src/views/invoices/addInvoice/handler.js` and `src/views/invoices/editInvoice/handler.js`
- `src/views/invoices/addInvoice/AddInvoice.jsx` and `src/views/invoices/editInvoice/EditInvoice.jsx`

Why these routes are canonical references:
- Initial data is loaded on the server only
- The route `actions.js` is self-contained (no importing another route's `actions.js`)
- `page.jsx` orchestrates multiple action calls directly (`Promise.all` where independent)
- `index.jsx` does page-level composition (snackbars, dialogs) and maps `initial*` props into the handler
- `handler.js` holds local UI logic and form behavior only (no initial page fetch)
- Main `*.jsx` screens focus on rendering; add/edit share the same dropdown and column patterns with unified `initial*` naming for shared datasets

## Important note about earlier transitional patterns
Some earlier invoice refactor steps used transitional patterns such as:
- `getFeaturePageData()` aggregation helpers inside `actions.js`
- Local route `actions.js` files that re-exported or wrapped shared `actions.js` files

These patterns helped intermediate migration steps, but they are not the preferred final standard anymore.

Going forward:
- Do not repeat those transitional patterns in new feature refactors.
- Use the stricter final rules in this guide.

## Anti-patterns to avoid
- Client-side initial fetch in `index.jsx`, `handler.js`, or main UI files
- A feature `actions.js` importing another route's `actions.js`
- One action function calling multiple backend APIs just to hydrate a page
- A giant `pageData` object that bundles unrelated server responses
- Keeping thin wrapper files that only pass props and no longer add meaningful page-level composition
- Leaving both server-provided initial data and a duplicate client fallback fetch for the same first render
- Leaving stale `useEffect`, `useMemo`, or `useCallback` layers after simplifying the feature
- Moving full page screens into shared components
- Creating "clean-looking" abstraction layers that make data flow harder to understand
- Creating feature utility files for handler logic
- Creating generic safety wrappers for known backend structures
- Extracting helper components used once in the same file without real need
- Creating trivial local constants only to rename direct field access

## Refactor Checklist For Future Features

### Step 1. Understand the backend
- Identify the exact backend endpoints involved
- Check the actual backend response shapes
- Confirm which datasets are truly initial page data
- Confirm which datasets are only needed after user interaction

### Step 2. Create route-local `actions.js`
- Add `'use server'`
- Use `fetchWithAuth`
- Write one function per API call
- Keep each function focused and independently usable
- Do not import another route's `actions.js`

### Step 3. Build `page.jsx`
- Fetch all initial data on the server
- Use direct calls to the local `actions.js`
- Run independent requests in parallel where appropriate
- Run dependent requests sequentially where needed
- Pass independent raw objects to the client entry using consistent `initial*` prop names (see **Unified naming** in Important Final Rules)

### Step 4. Create `index.jsx`
- Receive server props (`initial*` naming for server-hydrated data)
- Map props into the handler in one place (explicit mapping is fine: e.g. `customersData: initialCustomersData`)
- Compose page-level support UI
- Create mutation adapters here if that keeps the handler narrower
- Call the feature handler
- Render not-found/empty/error states based only on server-provided data

### Step 5. Create `handler.js`
- Keep one handler file per feature route
- Manage feature-local client state
- Add local derived values and event handlers
- Only perform client-side refetch calls when user interaction requires it
- Never do initial page fetch here

### Step 6. Build the main UI component(s)
- Keep the main screen local to the feature folder
- Keep rendering direct
- Keep data shaping local and light
- Extract only genuinely reusable parts
- Inline shallow one-use wrapper sections back into the main screen when reuse disappears
- Remove extra component layering that only forwards props without adding real composition value
- Remove stale branches, placeholder handlers, dead fallback fetches, and obsolete effect/memo layers while the feature is open

### Step 7. Move reusable code correctly
- Static shared lists -> `src/data/dataSets.jsx`
- Shared domain utilities -> `src/utils`
- Shared handler-level helpers used by multiple feature handlers and still kept narrow -> `src/handlers/shared`
- Shared reusable subcomponents -> `src/components/<feature>` or `src/components/<type>`
- Feature-only logic -> keep inside the feature files
- Search `src/utils` and `src/data/dataSets.jsx` before adding new helpers or static datasets
- Consolidate duplicates into one canonical shared location before finishing the refactor
- If shared imports elsewhere would break, keep compatibility with a deliberate re-export instead of duplicate implementations

### Step 8. Clean styling
- Replace `sx` with `className` where possible
- Keep the final code visually readable

### Step 9. Verify project-specific component APIs
- Confirm exact prop names expected by shared components
- Example: `CustomListTable` expects `rows`, not `data`
- Example: pagination may expect `page` zero-indexed instead of `current`
- Also verify feature-local prop names between `page.jsx`, `index.jsx`, the main UI component, and the handler. A mismatch like `initialPagination` vs `pagination` can silently break first-load totals while still showing rows.

### Step 10. Keep the final code buyer-friendly
- Prefer clear code over abstract code
- Prefer obvious data flow over indirection
- Prefer local readability over artificial DRY

## Final mindset
When refactoring future features, ask:

- Is the initial data fetched only on the server?
- Does each action function map to one backend API call?
- Is the route `actions.js` fully self-contained?
- Is the page orchestrating the data instead of hiding it?
- Is the handler limited and readable?
- Are the main UI components focused on rendering?
- Did I extract only truly reusable code?
- Did I explicitly audit `src/utils` and `src/data/dataSets.jsx` before adding new helpers or static arrays?
- Did I remove duplicate reusable helpers and duplicate reusable datasets before closing the refactor?
- Did I remove redundant wrapper files, duplicate fetch paths, stale effect/memo/callback layers, and dead feature files before closing the refactor?
- Did I avoid abstraction that makes the feature harder to understand?

If the answer to those is yes, the refactor is likely aligned with the intended standard.

- **Also ask:** Are server-passed props and paired routes (add/edit) using the same `initial*` names for shared datasets, and the same backend field names in payloads and forms where the API is shared?
- **Also ask:** Does pagination keep the same count object and prop naming from backend response to table footer, including correct one-indexed -> zero-indexed conversion only at the table boundary?
