'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'
import { useModulePermissions, usePosAccess } from '@/Auth/usePermission'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { canAccessPos } = usePosAccess()
  const customerPermissions = useModulePermissions('customer')
  const vendorPermissions = useModulePermissions('vendor')
  const productPermissions = useModulePermissions('product')
  const categoryPermissions = useModulePermissions('category')
  const unitPermissions = useModulePermissions('unit')
  const inventoryPermissions = useModulePermissions('inventory')
  const warrantyPermissions = useModulePermissions('warranty')
  const salesReturnPermissions = useModulePermissions('creditNote')
  const purchaseOrderPermissions = useModulePermissions('purchaseOrder')
  const purchasePermissions = useModulePermissions('purchase')
  const debitNotePermissions = useModulePermissions('debitNote')
  const expensePermissions = useModulePermissions('expense')
  const paymentPermissions = useModulePermissions('payment')
  const quotationPermissions = useModulePermissions('quotation')
  const deliveryChallanPermissions = useModulePermissions('deliveryChallan')
  const chartOfAccountsPermissions = useModulePermissions('chartOfAccounts')
  const journalEntryPermissions = useModulePermissions('journalEntry')
  const voucherPermissions = useModulePermissions('voucher')
  const paymentSummaryPermissions = useModulePermissions('paymentSummaryReport')
  const trialBalancePermissions = useModulePermissions('trialBalanceReport')
  const balanceSheetPermissions = useModulePermissions('balanceSheetReport')
  const incomeStatementPermissions = useModulePermissions('incomeStatementReport')
  const generalLedgerPermissions = useModulePermissions('generalLedgerReport')
  const aiReportPermissions = useModulePermissions('aiReport')
  const companyPermissions = useModulePermissions('company')
  const branchPermissions = useModulePermissions('branch')
  const userPermissions = useModulePermissions('user')
  const rolePermissions = useModulePermissions('role')
  const canViewCompany = companyPermissions.canView
  const canViewBranches = branchPermissions.canView
  const canCreateBranches = branchPermissions.canCreate
  const canUpdateBranches = branchPermissions.canUpdate
  const canViewUsers = userPermissions.canView
  const canCreateUsers = userPermissions.canCreate
  const canUpdateUsers = userPermissions.canUpdate
  const canViewRoles = rolePermissions.canView
  const canCreateRoles = rolePermissions.canCreate
  const canUpdateRoles = rolePermissions.canUpdate
  const canViewChartOfAccounts = chartOfAccountsPermissions.canView
  const canViewJournalEntry = journalEntryPermissions.canView
  const canViewVoucher = voucherPermissions.canView
  const canViewPaymentSummary = paymentSummaryPermissions.canView
  const canViewTrialBalance = trialBalancePermissions.canView
  const canViewBalanceSheet = balanceSheetPermissions.canView
  const canViewIncomeStatement = incomeStatementPermissions.canView
  const canViewGeneralLedger = generalLedgerPermissions.canView
  const canViewAiReports = aiReportPermissions.canView
  const canViewCustomersSection = customerPermissions.hasAny || vendorPermissions.hasAny
  const canViewInventorySection =
    productPermissions.hasAny ||
    categoryPermissions.hasAny ||
    unitPermissions.hasAny ||
    inventoryPermissions.hasAny ||
    warrantyPermissions.hasAny
  const canViewSalesSection = canAccessPos || salesReturnPermissions.hasAny
  const canViewPurchasesSection =
    purchaseOrderPermissions.hasAny ||
    purchasePermissions.hasAny ||
    debitNotePermissions.hasAny
  const canViewFinanceSection =
    expensePermissions.hasAny ||
    paymentPermissions.hasAny ||
    canViewChartOfAccounts ||
    canViewJournalEntry ||
    canViewVoucher
  const canViewQuotationSection =
    quotationPermissions.hasAny ||
    deliveryChallanPermissions.hasAny
  const canViewReportsSection =
    canViewPaymentSummary ||
    canViewTrialBalance ||
    canViewBalanceSheet ||
    canViewIncomeStatement ||
    canViewGeneralLedger ||
    canViewAiReports
  const canViewStores = canViewBranches || canCreateBranches || canUpdateBranches
  const canViewTeam = canViewUsers || canCreateUsers || canUpdateUsers
  const canViewAccessControl = canViewRoles || canCreateRoles || canUpdateRoles
  // const canViewSystemSettings =
  //   canViewAccountSettings ||
  //   canViewInvoiceSettings ||
  //   canViewInvoiceTemplates ||
  //   canViewSignatures ||
  //   canViewPaymentSettings ||
  //   canViewBankSettings ||
  //   canViewTaxSettings ||
  //   canViewEmailSettings ||
  //   canViewPreferenceSettings ||
  //   canViewNotificationSettings ||
  //   canUpdatePassword

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale, id } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuSection label={'Main'}>

          <MenuItem icon={<i className='ri-home-smile-line' />} href={`/dashboard`}>Dashboard</MenuItem>

        </MenuSection>
        {canViewCustomersSection ? (
          <MenuSection label="Customers">
            {customerPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-user-3-line' />} href="/customers/customer-list">Customers</MenuItem>
            ) : null}
            {vendorPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-truck-line' />} href="/vendors/vendor-list">Vendors</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewInventorySection ? (
          <MenuSection label="Inventory">
            {productPermissions.hasAny || categoryPermissions.hasAny || unitPermissions.hasAny ? (
              <SubMenu icon={<i className='ri-apps-2-line' />} label="Product / Services">
                {productPermissions.hasAny ? (
                  <MenuItem icon={<i className='ri-box-3-line' />} href="/products/product-list">Products</MenuItem>
                ) : null}
                {categoryPermissions.hasAny ? (
                  <MenuItem icon={<i className='ri-price-tag-3-line' />} href="/categories/category-list">Categories</MenuItem>
                ) : null}
                {unitPermissions.hasAny ? (
                  <MenuItem icon={<i className='ri-ruler-line' />} href="/units/unit-list">Units</MenuItem>
                ) : null}
              </SubMenu>
            ) : null}
            {inventoryPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-archive-stack-line' />} href="/inventory">Inventory</MenuItem>
            ) : null}
            {warrantyPermissions.hasAny ? (
              <SubMenu icon={<i className='ri-shield-check-line' />} label="Warranties">
                <MenuItem icon={<i className='ri-shield-line' />} href="/warranties/warranty-list">Warranties</MenuItem>
                <MenuItem icon={<i className='ri-shield-star-line' />} href="/policies/policy-list">Policies</MenuItem>
                <MenuItem icon={<i className='ri-customer-service-2-line' />} href="/claims/claim-list">Claims</MenuItem>
              </SubMenu>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewSalesSection ? (
          <MenuSection label="Sales">
          {canAccessPos ? (
            <MenuItem icon={<i className='ri-store-2-line' />} href="/pos">POS</MenuItem>
          ) : null}
          {canAccessPos ? (
            <MenuItem icon={<i className='ri-file-list-3-line' />} href="/invoices/invoice-list">Invoices</MenuItem>
          ) : null}
          {salesReturnPermissions.hasAny ? (
            <MenuItem icon={<i className='ri-refund-2-line' />} href="/sales-return/sales-return-list">Sales Return</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewPurchasesSection ? (
          <MenuSection label="Purchases">
            {purchaseOrderPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-shopping-cart-2-line' />} href="/purchase-orders/order-list">Purchase Orders</MenuItem>
            ) : null}
            {purchasePermissions.hasAny ? (
              <MenuItem icon={<i className='ri-shopping-bag-3-line' />} href="/purchases/purchase-list">Purchases</MenuItem>
            ) : null}
            {debitNotePermissions.hasAny ? (
              <MenuItem icon={<i className='ri-arrow-go-back-line' />} href="/debitNotes/purchaseReturn-list">Purchase Return</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewFinanceSection ? (
          <MenuSection label="Finance & Accounts">
          {expensePermissions.hasAny ? (
            <MenuItem icon={<i className='ri-wallet-3-line' />} href="/expenses/expense-list">Expenses</MenuItem>
          ) : null}
          {paymentPermissions.hasAny ? (
            <MenuItem icon={<i className='ri-bank-card-line' />} href="/payments/payment-list">Payments</MenuItem>
          ) : null}
          {canViewChartOfAccounts ? (
            <MenuItem icon={<i className='ri-node-tree' />} href="/chart-of-accounts">Chart Of Accounts</MenuItem>
          ) : null}
          {canViewJournalEntry ? (
            <MenuItem icon={<i className='ri-book-open-line' />} href="/journals">Journals</MenuItem>
          ) : null}
          {canViewVoucher ? (
            <MenuItem icon={<i className='ri-coupon-3-line' />} href="/vouchers">Vouchers</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewQuotationSection ? (
          <MenuSection label="Quotations">
            {quotationPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-file-paper-2-line' />} href="/quotations/quotation-list">Quotations</MenuItem>
            ) : null}
            {deliveryChallanPermissions.hasAny ? (
              <MenuItem icon={<i className='ri-truck-line' />} href="/deliveryChallans/deliveryChallans-list">Delivery Challans</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewReportsSection ? (
          <MenuSection label="Reports">
          {canViewPaymentSummary ? (
            <MenuItem icon={<i className='ri-file-chart-line' />} href="/payment-summary/payment-summary-list">Payment Summary</MenuItem>
          ) : null}
          {canViewTrialBalance ? (
            <MenuItem icon={<i className='ri-scales-3-line' />} href="/trial-balance">Trial Balance</MenuItem>
          ) : null}
          {canViewBalanceSheet ? (
            <MenuItem icon={<i className='ri-file-list-2-line' />} href="/balance-sheet">Balance Sheet</MenuItem>
          ) : null}
          {canViewIncomeStatement ? (
            <MenuItem icon={<i className='ri-line-chart-line' />} href="/income-statement">Income Statement</MenuItem>
          ) : null}
          {canViewGeneralLedger ? (
            <MenuItem icon={<i className='ri-book-2-line' />} href="/general-ledger">General Ledger</MenuItem>
          ) : null}
          {canViewAiReports ? (
            <MenuItem icon={<i className='ri-robot-2-line' />} href="/ai-reports">AI Reports</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewCompany || canViewBranches || canViewUsers || canViewRoles ? (
          <MenuSection label="Organization">
            {canViewCompany ? (
              <MenuItem icon={<i className='ri-building-line' />} href="/company">
                Company Profile
              </MenuItem>
            ) : null}
            {canViewStores ? (
              <MenuItem icon={<i className='ri-store-2-line' />} href="/stores">
                Stores
              </MenuItem>
            ) : null}
            {canViewTeam ? (
              <MenuItem icon={<i className='ri-team-line' />} href="/team">
                Team
              </MenuItem>
            ) : null}
            {canViewAccessControl ? (
              <MenuItem icon={<i className='ri-shield-user-line' />} href="/access-control">
                Access Control
              </MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {/*
        {canViewSystemSettings ? (
          <MenuSection label="Settings">
            <MenuItem href="/settings">System Settings</MenuItem>
          </MenuSection>
        ) : null}
        */}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
