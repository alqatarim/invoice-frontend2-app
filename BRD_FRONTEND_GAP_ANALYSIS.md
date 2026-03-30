# BRD vs Frontend Gap Analysis

## Purpose
This document captures the earlier BRD comparison from this chat and reframes it specifically for the current `frontend` application.

It answers five questions:

1. What parts of the BRD are already represented in the current frontend?
2. What parts are only partially represented?
3. What BRD requirements are still missing from the frontend surface?
4. What capabilities the frontend already has are not central to the BRD?
5. What should be prioritized next, and in what order?

## Scope
This is a **frontend-focused** assessment.

- Primary scope: `frontend/src/app`, `frontend/src/views`, `frontend/src/components`, navigation, and visible user workflows
- Secondary context: earlier full-stack BRD comparison from this chat, where backend/database findings were also considered
- Important limitation: some BRD requirements may be impossible to complete from the frontend alone and will require backend/database support in parallel

## Source BRD
Source document reviewed earlier in this chat:

- `BRD_Al-Mohasib_Al-Shamel.extracted.txt`

Key BRD themes:

- Core accounting ERP: COA, journals, vouchers, financial statements, auditability
- Retail/store POS: fast cashier checkout, barcode and scale workflows, manager controls, promotions, refunds
- Operational modules: inventory, purchasing, reporting, restrictions by branch/warehouse
- Industry packages: restaurant, transport, manufacturing, payroll/HR, contracting, rentals, automotive

## Methodology
This document is based on:

- The earlier BRD comparison already completed in this chat
- Current frontend route and module inventory
- Visible route/action structure found under `frontend/src/app/(dashboard)`

Observed frontend modules include:

- `invoices`
- `quotations`
- `purchase-orders`
- `purchases`
- `sales-return`
- `inventory`
- `products`
- `customers`
- `vendors`
- `payments`
- `payment-summary`
- `expenses`
- `branches`
- `roles-permission`
- `settings`
- `pos`
- `chart-of-accounts`
- `journals`
- `vouchers`
- `trial-balance`
- `balance-sheet`
- `income-statement`
- `general-ledger`

No equivalent frontend modules were found for:

- payroll
- manufacturing
- restaurant
- transport
- contracts
- rentals
- automotive service

## Executive Summary
The current frontend is now **strong as a commercial ERP frontend** and now has both a **real accounting foundation** and a **fully cut-over company/store governance foundation**.

Best current description:

**Commercial ERP frontend with operational modules, foundational accounting, and first-class organization administration**

Not yet:

**A fully mature retail ERP with supermarket-grade cashier controls and deeper warehouse operations across every workflow**

### Overall Frontend Alignment
- Retail-commercial basics: `Strong`
- Full BRD alignment: `Moderate to Strong`
- Company/store governance readiness: `Strong`
- Cashier-specific supermarket readiness: `Partial`
- Accounting-core readiness: `Strong foundation`

### Recent Progress Updates
Completed on `2026-03-23`:

- Store-aware POS polish: assigned-store-only POS selection, held-sale restore validation, and checkout store enforcement are now live
- Promotions slice: active product-level promotions now auto-apply in POS/invoice row flows and persist through both invoice and POS save paths
- POS cashier hardening slice: barcode-first quick entry, quick product chips, shortcut-assisted hold/resume/checkout actions, and richer receipt details are now in place
- Weighted barcode / scale slice: product-level scale barcode configuration, prefix/PLU scan decoding, weighted POS/invoice rows, and persisted scale-scan context are now in place

Completed on `2026-03-26`:

- POS UX completion slice: customer/payment noise is reduced, tendering is stronger, keyboard/barcode behavior is deeper, and post-checkout receipt handling is cleaner
- Store-aware reporting and operations slice: dashboard, trial balance, balance sheet, income statement, general ledger, and inventory/distribution screens now carry store/branch scope more consistently
- Printing/template usability slice: invoice template catalog/default selection UX, permission-aware signature/template actions, and POS receipt-printing polish are now in place
- RBAC slice: canonical module/action naming is aligned across frontend/backend, and permission-aware menu/settings/template visibility is now more complete

### What the frontend already does well
- Sales/invoice flows
- Quotation and order-related flows
- Purchases and returns
- Product, customer, vendor, inventory, and payment screens
- Chart of Accounts, journals, vouchers, trial balance, balance sheet, income statement, and general ledger screens
- Store-aware dashboard and accounting reporting filters
- Company Profile, Stores, Team, and Access Control organization-admin flows
- Membership-aware team administration with company roles, assigned stores, and store roles
- Store creation/edit flows with default store admin bootstrap support
- Role/permission-related admin screens
- Permission-aware menu, settings, signature, and template visibility aligned with backend RBAC
- Invoice template default-selection UX and cleaner POS receipt behavior
- Modern web UX patterns, dashboarding, and route organization

### What the frontend does not yet do well enough for the BRD
- Store-aware consistency across the remaining non-dashboard / non-accounting operational and reporting screens
- Full stocktake-session depth with freeze, recount, and approval controls
- Deeper warehouse analytics and movement drilldowns beyond the first history layer
- Expiry / production / lot discipline where the business needs it
- Supermarket-grade cashier governance, manager override, and split-tender depth
- Centralized promotions administration and automation depth
- Weighted scale barcode depth across more formats and admin controls
- Template-designer level document customization
- Warehouse/governance depth in day-to-day retail operations
- Industry-specific vertical packages

## Detailed Comparison Matrix

| BRD Area | Frontend Status | Current Frontend Reality | Business Priority |
|---|---|---|---|
| Administration, security, audit | Strong | Membership-based company/store governance is now fully cut over across the stack: company signup creates the canonical owner membership, stores can create or assign a default store admin, Team supports org/store roles, branch permissions are surfaced for non-super roles, RBAC module/action naming is normalized across frontend/backend, permission-aware menu/settings/template visibility is in place, and warehouse personas have been verified end to end for owner/store-admin/store-staff flows. Remaining work is routine hardening and future-feature coverage rather than the core company/store model. | Highest |
| General Ledger / Core Accounting | Strong foundation | Dedicated frontend modules now exist for chart of accounts, journals, vouchers, trial balance, balance sheet, income statement, and general ledger drilldowns. The remaining work is deeper accounting polish, not first-class screen availability. | Keep strong |
| Sales / Invoicing / Returns | Strong | Invoices, quotations, delivery challans, sales returns, VAT/discount handling, customer flows, and document views are clearly present in the frontend. | Keep strong |
| Purchasing | Strong to Partial | Purchase invoices, purchase orders, and purchase returns are present, but supplier-settlement depth and accounting-style purchasing control are not visible at the same depth as the BRD. | Medium |
| Inventory and Warehousing | Strong foundation | Inventory, products, units, categories, branch-aware stock views, atomic transfers, lightweight cycle counting, movement history, role-aware warehouse filtering, and assigned-branch-aware inventory/distribution messaging now exist together. The remaining gap is the next layer of warehouse depth: full stocktake sessions, expiry/production tracking, and richer drilldowns/controls. | High |
| POS / Supermarket Cashier | Partial / Improving | A dedicated POS route now exists and now includes assigned-store enforcement, barcode-first quick entry, quick-add product shortcuts, lower-noise customer/payment flow, stronger tendering, deeper keyboard/barcode behavior, faster held-sale recovery, cleaner receipt handling, and a first weighted-barcode scan path. The remaining BRD gap is the deeper cashier operating model: manager overrides, restrictions, split tender, and stronger hardware-adjacent behavior. | Highest |
| Promotions / Offers | Partial | Product metadata now supports active product-level promotions that auto-apply in POS/invoice row flows and persist with saved items. The remaining gap is a fuller promotion engine: centralized definition screens, date/group assignment depth, threshold rules, free-quantity logic, and broader reporting/visibility. | High |
| Scale Barcode Integration | Partial | Product metadata now supports scale-barcode configuration, and POS/invoice quick-entry flows can decode configured prefix/PLU labels with embedded weight or price into weighted sales rows. The remaining gap is broader barcode template coverage, centralized admin settings, and richer cashier diagnostics. | High for supermarket target |
| Printing / A4 Designer | Partial / Improving | Invoice template catalog/default-selection UX, permission-aware signature/template actions, and cleaner POS receipt printing are now in place. The remaining gap is the BRD’s template-designer level of document customization, broader document coverage, and richer admin controls. | Medium |
| Reporting | Strong | Operational reporting is present, dashboard/accounting reporting now has first-class store-aware filters and drilldown continuity, and inventory/distribution scope messaging is clearer. The remaining reporting gap is broader managerial/operational filtering polish beyond these core surfaces rather than report availability itself. | High |
| Restaurants | Missing | No restaurant/tables/kitchen/order lifecycle frontend modules found. | Defer |
| Transport | Missing | No route/driver/truck/trip voucher frontend modules found. | Defer |
| Manufacturing | Missing | No BOM, production order, issue/receive workflow frontend modules found. | Defer |
| HR / Attendance / Payroll | Missing | No payroll/attendance frontend module found. | Defer |
| Contracting / Contracts | Missing | No BOQ/progress certificate/contract profitability frontend modules found. | Defer |
| Real Estate Rentals | Missing | No property/rental/installment frontend module found. | Defer |
| Automotive Service | Missing | No vehicle/service-center frontend module found. | Defer |

## What Is Clearly Implemented in the Frontend

These BRD-adjacent areas are already visible and usable at the frontend layer:

- Sales invoices
- Quotations
- Purchase orders
- Purchases
- Sales returns
- Purchase returns
- Delivery challans
- Products, categories, and units
- Inventory list and branch stock views
- Atomic stock transfer workflow
- Lightweight cycle count workflow
- Inventory movement / costing history visibility
- Customers and vendors
- Payments and payment summaries
- Expenses
- Branch management
- Chart of Accounts
- Journals
- Vouchers
- Trial balance
- Balance sheet
- Income statement
- General ledger
- Company Profile
- Stores / warehouses administration
- Team administration with company/store assignment
- Access Control organization admin flow
- Roles and permissions
- POS route and checkout UI
- Settings/admin surfaces

This means the frontend already provides a solid commercial application shell.

## Important Small-Detail Findings

### 1. The accounting foundation is now in place
The `frontend` app is no longer missing accounting-core screens. The route inventory now includes first-class finance surfaces such as:

- chart of accounts
- journals
- vouchers
- trial balance
- balance sheet
- income statement
- general ledger

This closes the original “missing accounting frontend” gap. The remaining accounting work is now about depth, controls, and tighter operational integration rather than basic screen coverage.

### 2. POS exists, but the BRD expects stronger cashier governance
The frontend now has a POS route and a stronger cashier-facing UI, which is a major step forward.

Recent progress now includes:

- assigned-store POS enforcement
- visible barcode-first quick entry
- quick-add product chips
- reduced-noise customer/payment flow
- stronger tendering UX
- faster held-sale recovery
- richer receipt details
- weighted barcode decoding into POS rows
- deeper keyboard/barcode-first interaction handling
- cleaner post-checkout receipt handling

However, the BRD expects the cashier layer to include more than “sell quickly”:

- manager override for restricted actions
- discount/addition caps by user
- hiding sensitive prices by user role
- split payments
- stricter refund/return controls
- hardware-adjacent workflows

The current frontend still does not yet present those cashier governance layers as first-class workflows.

### 3. Company governance cutover is now complete, but operational adoption still needs depth
The frontend no longer treats company/store governance as only a future gap. It now has a clearer organization admin model with first-class flows for:

- Company Profile
- Stores
- Team
- Access Control

User management now supports:

- company role selection
- assigned store(s)
- primary store selection
- store role selection

Store creation now behaves as company-owned store creation with:

- `STORE` / `WAREHOUSE` kind
- store code support
- default store admin assignment or bootstrap

The strict cutover is now complete across the verified stack paths: runtime scope is membership-driven, legacy fallback has been removed, and the backing membership/store data has been normalized into canonical records.

Operational adoption now also includes:

- store-aware dashboard filters and helper messaging
- store-aware trial balance, balance sheet, income statement, and general ledger filters/drilldowns
- assigned-branch inventory/distribution selectors and scope messaging
- stronger active-store alignment in the POS route

The remaining governance work is now:

- extend the verified store-aware model into the remaining non-core operational/reporting screens
- keep hardening audit and edge-case safety around role/store assignment changes
- keep active company/store context clearer in shared shell surfaces

The warehouse phase now delivers:

- atomic stock transfer workflow
- lightweight cycle count workflow
- clearer movement visibility
- stronger allowed-store / warehouse filtering
- safer primary-store persistence during user create/update
- branch permission surfacing for non-super warehouse roles

After that, the BRD still expects additional warehouse depth such as:

- clear warehouse restrictions by user
- full stocktake workflows
- deeper movement drilldowns
- expiry/production tracking where needed

For a store/supermarket strategy, this still matters because inventory reliability directly affects cashier speed and trust.

### 4. Promotions are now only partially transactional at the frontend
The BRD is explicit about:

- date-ranged offers
- threshold rules
- group-based offer assignment
- free quantity and promo price logic
- automatic application at POS/invoice time

The current frontend now has a first usable promotions slice: product-level active promotions embedded in product metadata can auto-apply in POS/invoice row flows and are persisted with saved POS/invoice items.

However, it still does not yet present a production-grade promotions workflow that cashiers and invoice users can rely on across the full BRD scope.

### 5. Weighted barcode / scale is now partially implemented
The BRD expects supermarket-oriented barcode behavior that can decode values embedded by a weighing scale.

The current frontend now supports a first usable scale slice:

- product-level scale barcode configuration stored with product metadata
- prefix + PLU barcode decoding for embedded weight or label-price values
- weighted quantity handling in POS and invoice rows
- persisted scale scan context on saved POS/invoice items

The remaining gap is broader template coverage, central admin configuration, and richer cashier troubleshooting/preview controls.

### 6. RBAC and print/template usability are materially better than the earlier gap snapshot
The frontend no longer treats permissions and document-template administration as mostly future work. It now has:

- canonical module/action alignment across the roles-permission UI, permission hooks, menu/settings visibility, and backend route guards
- permission-aware settings, signature, template, and shell surfaces
- catalog-driven invoice template selection with clearer default-template UX
- cleaner POS receipt-printing behavior

The remaining gap is broader designer-level document customization and routine permission hardening as new modules continue to ship.

### 7. The frontend does not currently reflect the BRD’s vertical package ambition
The BRD is not only about shops and supermarkets. It also describes:

- restaurant operations
- transport
- manufacturing
- payroll
- contracting
- rentals
- automotive service

Those are not “small missing tabs.” They are separate product families. Their absence is expected unless the platform strategy is intentionally expanding into a multi-vertical ERP suite.

## Features the Frontend Has That the BRD Does Not Emphasize

These are valuable platform strengths that should be preserved even if they are not central to the BRD:

- Modern web UX and dashboard-first navigation
- Canonical RBAC-driven menu/settings/template visibility and user-context-aware UI
- Google OAuth / modern auth-related frontend behavior already added in this chat
- Delivery challan workflows
- Payment summary views
- Template-catalog and receipt-usability improvements
- AI/dashboard-oriented modern web app patterns
- Cleaner operational admin surfaces than many traditional ERP frontends

These are differentiators, not distractions.

## Strategic Reading

The right conclusion is **not** “implement the entire BRD.”

The right conclusion is:

- keep the frontend strong where it already wins
- stabilize and extend the new accounting foundation rather than treating accounting as missing
- capitalize on the completed company/store governance cutover by extending the same scope model into the remaining screens beyond the now-updated inventory, POS, and reporting surfaces
- close the retail-core cashier gaps if the store/supermarket path is the target
- do not prioritize unrelated industry packs unless the business wants a multi-vertical suite

## Priority Framework

## Priority 1: Remaining Warehouse Control And Cashier Governance
These are now the most important next gaps because the tenancy cutover, first warehouse slice, and current reporting/POS scope polish are in place.

### 1. Warehouse control depth
- Expand lightweight cycle count into fuller stocktake sessions with freeze, recount, and approval states
- Add deeper movement drilldowns, variance investigation, and warehouse analytics
- Add expiry / production / lot handling where operationally required

### 2. Remaining scope consistency
- Extend the now-shipped store-aware model beyond dashboard/accounting/inventory/POS into the remaining operational and reporting screens
- Make store-aware filters and managerial visibility more consistent across modules
- Keep shell context clear for users who move across multiple locations

### 3. Cashier governance and promotion depth
- Add manager overrides, discount/refund restrictions, and stronger cashier permission UX
- Add promotions workflow depth and weighted-barcode behavior for supermarket-grade retail
- Keep warehouse/store restrictions aligned with cashier operational rules

## Priority 2: Must-Have for Store / Supermarket Frontend
These remain important after the company governance layer is correct.

### 1. POS cashier hardening
- Build on the completed low-noise, keyboard-friendly, barcode-first POS slice
- Add split-tender and stronger completion-flow depth
- Keep the current receipt/payment UX polish stable under repeated rapid entry
- Ensure cashier interactions are resilient under repeated rapid entry

### 2. Cashier permissions and restrictions
- Surface per-user limits for discounts/additions
- Add manager override UX for restricted actions
- Hide restricted price data from cashier users
- Make refund/return restrictions explicit in the UI

### 3. Promotions engine UX
- Promotion definition screens
- Offer assignment by item/group/date
- Auto-application visibility in POS and invoice flows
- Clear cashier messaging when an offer is applied

### 4. Weighted barcode / scale UX
- Centralized barcode configuration defaults
- Broader scan parsing and preview coverage
- Richer weighted-item diagnostics and troubleshooting UX

### 5. Warehouse-aware retail UX
- Extend warehouse-restricted selectors beyond the screens already updated
- Better stock visibility by allowed branch/warehouse in remaining modules
- Transfer and stock adjustment UX if these workflows expand further

## Priority 3: Should-Have for Commercial Depth
These improve credibility and completeness for a serious retail-business frontend.

### 1. Inventory operations depth
- Stocktake workflow
- Better movement drilldowns
- Expiry/batch visibility
- Stronger branch/warehouse operational reporting views beyond the newly scoped inventory core

### 2. Reporting depth
- Better management filters beyond the current dashboard/accounting scope
- Role-aware reporting navigation
- More explicit profitability and operational drilldowns

### 3. Product master completeness
- Ensure frontend concepts like multi-unit and advanced prices are fully supported end to end
- Avoid exposing frontend-only concepts that are not truly persisted/usable

### 4. Printing/template usability
- Build on the current document/receipt configuration UX
- Add broader document coverage and more flexible print-template choices

## Priority 4: Should-Have Only If ERP Positioning Is Real
These are about deepening the accounting and management layer that is already present.

### 1. Accounting depth and controls
- Stronger workflows around journal review and approval
- Better cross-links between operational transactions and ledger activity
- More accounting guardrails and governance cues

### 2. Financial reporting UX depth
- Better filter and export behavior
- More managerial drilldowns
- Branch and cost-center-aware financial analysis

### 3. Cost center and branch profitability UX
- Cost center assignment surfaces
- Profitability dashboards and filtered analysis

## Priority 5: Not Needed for Current Strategy
Unless product strategy changes, these should be explicitly deferred.

- Restaurant module
- Transport/logistics module
- Manufacturing module
- Payroll/attendance module
- Contracting module
- Real-estate rentals module
- Automotive service module

## Recommended Frontend Plan

## Phase 0: Lock the Product Decision
Before more development, decide which of these is the target identity:

1. `Retail-first commerce platform with strong POS`
2. `ERP-lite with retail support`
3. `Full ERP suite with vertical packages`

Recommended choice based on current frontend strengths:

`ERP-lite with retail support`

## Phase 1: Tenancy Cutover And First Warehouse Slice
Status: completed.

Primary result: the company-owned model is now cut over through organization admin, shell context, user/store assignment, atomic transfer, lightweight cycle count, movement visibility, role-aware warehouse scope, and strict membership-based runtime/data scoping.

### Workstream A: Persona verification and company/store context
Suggested frontend areas:

- `frontend/src/Auth/*`
- `frontend/src/components/layout/*`
- `frontend/src/app/(dashboard)/organization/*`
- related handlers and actions

Deliverables:

- verified owner/admin/store-admin/store-staff journeys
- visible active company / accessible store context
- legacy fallback removed from the verified warehouse/user-assignment paths and canonical membership/store data cleaned

### Workstream B: Store-aware operational adoption
Status: substantially completed for the current slice.

Suggested frontend areas:

- `frontend/src/views/inventory/*`
- `frontend/src/views/pos/*`
- reporting views
- relevant actions and handlers

Deliverables:

- consistent store-aware lists and selectors
- dashboard/accounting surfaces with explicit store-aware filters and helper messaging
- operational screens that respect assigned store scope
- safer cross-module company/store visibility
- atomic transfer flow
- lightweight cycle count flow
- better movement, batch, and last-count visibility
- branch-aware permissions for non-super warehouse roles

Remaining to close the broader BRD gap:

- extend the same pattern into the remaining non-core operational/reporting screens
- keep active company/store context clearer in shared shell/navigation surfaces

### Workstream C: RBAC normalization and permission surfacing
Status: completed for the current slice.

Suggested frontend areas:

- `frontend/src/Auth/*`
- `frontend/src/views/roles-permission/*`
- menu/settings/template/signature surfaces

Deliverables:

- canonical module/action alignment across frontend/backend permission usage
- updated permissions matrix coverage for POS, reporting, templates/settings, and store-scoped operational modules
- permission-aware menu/settings/template/signature visibility

## Phase 2: Retail-Core Frontend Completion
Primary goal: make the frontend genuinely supermarket-ready after the company scope is correct.

### Workstream A: POS UX completion
Status: completed for the current UX slice.

Suggested frontend areas:

- `frontend/src/views/pos/*`
- `frontend/src/app/(dashboard)/pos/*`
- navigation/menu surfaces

Completed so far:

- barcode-first quick entry
- quick-add product shortcuts
- shortcut-assisted hold/resume/checkout flow
- stronger receipt detail flow
- reduced-noise customer/payment flow
- stronger tendering UX
- deeper keyboard/barcode behavior
- cleaner post-checkout receipt handling

Remaining to close the broader BRD gap:

- manager override / approval flow
- split tender and richer cashier restrictions
- stronger hardware-adjacent behavior

### Workstream B: POS governance UI
Suggested frontend areas:

- POS views
- permissions UI
- settings/admin screens

Deliverables:

- manager override interaction
- discount and refund restriction messaging
- hidden price modes by role
- visible cashier permissions behavior

### Workstream C: Promotions frontend
Status: partially completed.

Suggested frontend areas:

- products
- settings/admin
- POS/invoice surfaces

Completed so far:

- active product-level promotion auto-application in POS/invoice rows
- applied-offer display in sales/POS rows
- persisted promotion context on saved POS/invoice items

Remaining to close the workstream:

- offer creation screens
- offer assignment UI
- threshold/group/date promotion depth
- free-quantity and promo-price logic

### Workstream D: Weighted barcode / scale configuration
Status: partially completed.

Suggested frontend areas:

- POS
- product/admin/settings screens

Completed so far:

- product-level scale barcode configuration in product forms
- configured prefix/PLU scan decoding for embedded weight or price
- weighted item handling in POS and invoice rows
- persisted scale scan context on saved POS/invoice items

Remaining to close the workstream:

- broader barcode template and supermarket-label coverage
- centralized settings/admin defaults for barcode formats
- richer cashier scan diagnostics and troubleshooting feedback

### Workstream E: Printing/template usability
Status: partially completed.

Suggested frontend areas:

- `frontend/src/views/settings/*`
- `frontend/src/views/invoices/*`
- `frontend/src/views/pos/*`

Completed so far:

- catalog-driven invoice template selection
- clearer default-template UX in settings
- permission-aware signature/template actions
- cleaner POS receipt-printing behavior

Remaining to close the workstream:

- broader document template coverage
- designer-level template customization
- richer admin configuration and preview controls

## Phase 3: Operational Depth
Primary goal: move from simple commercial UI into strong retail operations UI.

Suggested areas:

- `frontend/src/views/inventory/*`
- reporting views
- product and settings screens

Deliverables:

- stocktake UX
- warehouse transfer UX
- expiry/batch visibility
- better movement drilldowns

## Phase 4: ERP Credibility Layer
Only pursue this if the product strategy explicitly requires deeper ERP seriousness beyond the accounting foundation already shipped.

Suggested areas:

- existing finance views and routes
- admin/reporting surfaces

Deliverables:

- accounting workflow controls
- tighter financial reporting UX
- cost-center filtering and analysis

## Phase 5: Vertical Expansion
Only pursue if product strategy changes significantly.

Potential future tracks:

- restaurant
- transport
- manufacturing
- payroll
- contracting
- rentals
- automotive

This should be treated as a separate product roadmap, not as the default continuation of the current frontend.

## Recommended Final Position

If the objective is to align the current platform with the BRD **without overbuilding**, the correct frontend strategy is:

1. Treat persona verification and legacy cutover for the new company/store governance model as complete
2. Continue the remaining cashier-governance, warehouse-depth, and template-designer gaps next
3. Deepen the already-built accounting layer only where ERP credibility needs more control or analysis
4. Defer all unrelated industry packages

## Bottom Line

The current `frontend` is now a strong business application with a real accounting foundation, materially better RBAC/template usability, and a real company/store governance foundation, but it is **not yet the frontend of a fully cut-over supermarket/shop POS + cashier + ERP suite** as described in the BRD.

It is closest to:

**commercial ERP frontend with stronger POS, foundational accounting, and first-class organization administration**

To become:

**store/supermarket cashier frontend with ERP credibility**

the next work should focus on:

- extending store-aware consistency into the remaining operational/reporting shells beyond the now-updated dashboard/accounting/inventory/POS surfaces
- active company/store context clarity across the shell
- cashier restrictions, overrides, and split-tender depth
- promotion engine depth beyond the current product-level auto-apply slice
- weighted barcode support beyond the current first scale-label slice
- warehouse-aware retail workflows and stocktake depth
- template-designer depth beyond the current template-catalog and receipt-usability slice

and only after that:

- deeper accounting governance and analysis UX

Everything else in the BRD should be treated as optional vertical expansion, not default scope.
