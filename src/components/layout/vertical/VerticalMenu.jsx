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
import { usePermission } from '@/Auth/usePermission'

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
  const canViewInvoice = usePermission('invoice', 'view')
  const canCreateInvoice = usePermission('invoice', 'create')
  const canAccessPos = canViewInvoice || canCreateInvoice
  const customerPermissions = {
    canCreate: usePermission('customer', 'create'),
    canUpdate: usePermission('customer', 'update'),
    canView: usePermission('customer', 'view'),
    canDelete: usePermission('customer', 'delete')
  }
  const vendorPermissions = {
    canCreate: usePermission('vendor', 'create'),
    canUpdate: usePermission('vendor', 'update'),
    canView: usePermission('vendor', 'view'),
    canDelete: usePermission('vendor', 'delete')
  }
  const productPermissions = {
    canCreate: usePermission('product', 'create'),
    canUpdate: usePermission('product', 'update'),
    canView: usePermission('product', 'view'),
    canDelete: usePermission('product', 'delete')
  }
  const categoryPermissions = {
    canCreate: usePermission('category', 'create'),
    canUpdate: usePermission('category', 'update'),
    canView: usePermission('category', 'view'),
    canDelete: usePermission('category', 'delete')
  }
  const unitPermissions = {
    canCreate: usePermission('unit', 'create'),
    canUpdate: usePermission('unit', 'update'),
    canView: usePermission('unit', 'view'),
    canDelete: usePermission('unit', 'delete')
  }
  const inventoryPermissions = {
    canCreate: usePermission('inventory', 'create'),
    canUpdate: usePermission('inventory', 'update'),
    canView: usePermission('inventory', 'view'),
    canDelete: usePermission('inventory', 'delete')
  }
  const salesReturnPermissions = {
    canCreate: usePermission('creditNote', 'create'),
    canUpdate: usePermission('creditNote', 'update'),
    canView: usePermission('creditNote', 'view'),
    canDelete: usePermission('creditNote', 'delete')
  }
  const purchaseOrderPermissions = {
    canCreate: usePermission('purchaseOrder', 'create'),
    canUpdate: usePermission('purchaseOrder', 'update'),
    canView: usePermission('purchaseOrder', 'view'),
    canDelete: usePermission('purchaseOrder', 'delete')
  }
  const purchasePermissions = {
    canCreate: usePermission('purchase', 'create'),
    canUpdate: usePermission('purchase', 'update'),
    canView: usePermission('purchase', 'view'),
    canDelete: usePermission('purchase', 'delete')
  }
  const debitNotePermissions = {
    canCreate: usePermission('debitNote', 'create'),
    canUpdate: usePermission('debitNote', 'update'),
    canView: usePermission('debitNote', 'view'),
    canDelete: usePermission('debitNote', 'delete')
  }
  const expensePermissions = {
    canCreate: usePermission('expense', 'create'),
    canUpdate: usePermission('expense', 'update'),
    canView: usePermission('expense', 'view'),
    canDelete: usePermission('expense', 'delete')
  }
  const paymentPermissions = {
    canCreate: usePermission('payment', 'create'),
    canUpdate: usePermission('payment', 'update'),
    canView: usePermission('payment', 'view'),
    canDelete: usePermission('payment', 'delete')
  }
  const quotationPermissions = {
    canCreate: usePermission('quotation', 'create'),
    canUpdate: usePermission('quotation', 'update'),
    canView: usePermission('quotation', 'view'),
    canDelete: usePermission('quotation', 'delete')
  }
  const deliveryChallanPermissions = {
    canCreate: usePermission('deliveryChallan', 'create'),
    canUpdate: usePermission('deliveryChallan', 'update'),
    canView: usePermission('deliveryChallan', 'view'),
    canDelete: usePermission('deliveryChallan', 'delete')
  }
  const canViewChartOfAccounts = usePermission('chartOfAccounts', 'view')
  const canViewJournalEntry = usePermission('journalEntry', 'view')
  const canViewVoucher = usePermission('voucher', 'view')
  const canViewPaymentSummary = usePermission('paymentSummaryReport', 'view')
  const canViewTrialBalance = usePermission('trialBalanceReport', 'view')
  const canViewBalanceSheet = usePermission('balanceSheetReport', 'view')
  const canViewIncomeStatement = usePermission('incomeStatementReport', 'view')
  const canViewGeneralLedger = usePermission('generalLedgerReport', 'view')
  const canViewAccountSettings = usePermission('accountSettings', 'view')
  const canViewCompanySettings = usePermission('companySettings', 'view')
  const canViewInvoiceSettings = usePermission('invoiceSettings', 'view')
  const canViewInvoiceTemplates = usePermission('invoiceTemplate', 'view')
  const canViewSignatures = usePermission('signature', 'view')
  const canViewPaymentSettings = usePermission('paymentSettings', 'view')
  const canViewBankSettings = usePermission('bankSettings', 'view')
  const canViewTaxSettings = usePermission('taxSettings', 'view')
  const canViewEmailSettings = usePermission('emailSettings', 'view')
  const canViewPreferenceSettings = usePermission('preferenceSettings', 'view')
  const canViewNotificationSettings = usePermission('notificationSettings', 'view')
  const canUpdatePassword = usePermission('changePassword', 'update')
  const canViewBranches = usePermission('branch', 'view')
  const canCreateBranches = usePermission('branch', 'create')
  const canUpdateBranches = usePermission('branch', 'update')
  const canViewUsers = usePermission('user', 'view')
  const canCreateUsers = usePermission('user', 'create')
  const canUpdateUsers = usePermission('user', 'update')
  const canViewRoles = usePermission('role', 'view')
  const canCreateRoles = usePermission('role', 'create')
  const canUpdateRoles = usePermission('role', 'update')
  const canViewSystemSettings =
    canViewAccountSettings ||
    canViewCompanySettings ||
    canViewInvoiceSettings ||
    canViewInvoiceTemplates ||
    canViewSignatures ||
    canViewPaymentSettings ||
    canViewBankSettings ||
    canViewTaxSettings ||
    canViewEmailSettings ||
    canViewPreferenceSettings ||
    canViewNotificationSettings ||
    canUpdatePassword
  const canViewCustomersSection =
    Object.values(customerPermissions).some(Boolean) || Object.values(vendorPermissions).some(Boolean)
  const canViewInventorySection =
    Object.values(productPermissions).some(Boolean) ||
    Object.values(categoryPermissions).some(Boolean) ||
    Object.values(unitPermissions).some(Boolean) ||
    Object.values(inventoryPermissions).some(Boolean)
  const canViewSalesSection = canAccessPos || canViewInvoice || Object.values(salesReturnPermissions).some(Boolean)
  const canViewPurchasesSection =
    Object.values(purchaseOrderPermissions).some(Boolean) ||
    Object.values(purchasePermissions).some(Boolean) ||
    Object.values(debitNotePermissions).some(Boolean)
  const canViewFinanceSection =
    Object.values(expensePermissions).some(Boolean) ||
    Object.values(paymentPermissions).some(Boolean) ||
    canViewChartOfAccounts ||
    canViewJournalEntry ||
    canViewVoucher
  const canViewQuotationSection =
    Object.values(quotationPermissions).some(Boolean) ||
    Object.values(deliveryChallanPermissions).some(Boolean)
  const canViewReportsSection =
    canViewPaymentSummary ||
    canViewTrialBalance ||
    canViewBalanceSheet ||
    canViewIncomeStatement ||
    canViewGeneralLedger
  const canViewStores = canViewBranches || canCreateBranches || canUpdateBranches
  const canViewTeam = canViewUsers || canCreateUsers || canUpdateUsers
  const canViewAccessControl = canViewRoles || canCreateRoles || canUpdateRoles

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
            {Object.values(customerPermissions).some(Boolean) ? (
              <MenuItem icon={<i className='ri-user-3-line' />} href="/customers/customer-list">Customers</MenuItem>
            ) : null}
            {Object.values(vendorPermissions).some(Boolean) ? (
              <MenuItem icon={<i className='ri-truck-line' />} href="/vendors/vendor-list">Vendors</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewInventorySection ? (
          <MenuSection label="Inventory">
            {Object.values(productPermissions).some(Boolean) ||
            Object.values(categoryPermissions).some(Boolean) ||
            Object.values(unitPermissions).some(Boolean) ? (
              <SubMenu label="Product / Services">
                {Object.values(productPermissions).some(Boolean) ? (
                  <MenuItem href="/products/product-list">Products</MenuItem>
                ) : null}
                {Object.values(categoryPermissions).some(Boolean) ? (
                  <MenuItem href="/categories/category-list">Categories</MenuItem>
                ) : null}
                {Object.values(unitPermissions).some(Boolean) ? (
                  <MenuItem href="/units/unit-list">Units</MenuItem>
                ) : null}
              </SubMenu>
            ) : null}
            {Object.values(inventoryPermissions).some(Boolean) ? (
              <MenuItem href="/inventory">Inventory</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewSalesSection ? (
          <MenuSection label="Sales">
          {canAccessPos ? (
            <MenuItem icon={<i className='ri-store-2-line' />} href="/pos">POS</MenuItem>
          ) : null}
          {canViewInvoice || canCreateInvoice ? (
            <MenuItem href="/invoices/invoice-list">Invoices</MenuItem>
          ) : null}
          {Object.values(salesReturnPermissions).some(Boolean) ? (
            <MenuItem href="/sales-return/sales-return-list">Sales Return</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewPurchasesSection ? (
          <MenuSection label="Purchases">
            {Object.values(purchaseOrderPermissions).some(Boolean) ? (
              <MenuItem href="/purchase-orders/order-list">Purchase Orders</MenuItem>
            ) : null}
            {Object.values(purchasePermissions).some(Boolean) ? (
              <MenuItem href="/purchases/purchase-list">Purchases</MenuItem>
            ) : null}
            {Object.values(debitNotePermissions).some(Boolean) ? (
              <MenuItem href="/debitNotes/purchaseReturn-list">Purchase Return</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewFinanceSection ? (
          <MenuSection label="Finance & Accounts">
          {Object.values(expensePermissions).some(Boolean) ? (
            <MenuItem href="/expenses/expense-list">Expenses</MenuItem>
          ) : null}
          {Object.values(paymentPermissions).some(Boolean) ? (
            <MenuItem href="/payments/payment-list">Payments</MenuItem>
          ) : null}
          {canViewChartOfAccounts ? (
            <MenuItem href="/chart-of-accounts">Chart Of Accounts</MenuItem>
          ) : null}
          {canViewJournalEntry ? (
            <MenuItem href="/journals">Journals</MenuItem>
          ) : null}
          {canViewVoucher ? (
            <MenuItem href="/vouchers">Vouchers</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewQuotationSection ? (
          <MenuSection label="Quotations">
            {Object.values(quotationPermissions).some(Boolean) ? (
              <MenuItem href="/quotations/quotation-list">Quotations</MenuItem>
            ) : null}
            {Object.values(deliveryChallanPermissions).some(Boolean) ? (
              <MenuItem href="/deliveryChallans/deliveryChallans-list">Delivery Challans</MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewReportsSection ? (
          <MenuSection label="Reports">
          {canViewPaymentSummary ? (
            <MenuItem href="/payment-summary/payment-summary-list">Payment Summary</MenuItem>
          ) : null}
          {canViewTrialBalance ? (
            <MenuItem href="/trial-balance">Trial Balance</MenuItem>
          ) : null}
          {canViewBalanceSheet ? (
            <MenuItem href="/balance-sheet">Balance Sheet</MenuItem>
          ) : null}
          {canViewIncomeStatement ? (
            <MenuItem href="/income-statement">Income Statement</MenuItem>
          ) : null}
          {canViewGeneralLedger ? (
            <MenuItem href="/general-ledger">General Ledger</MenuItem>
          ) : null}
        </MenuSection>
        ) : null}
        {canViewCompanySettings || canViewStores || canViewTeam || canViewAccessControl ? (
          <MenuSection label="Organization">
            {canViewCompanySettings ? (
              <MenuItem icon={<i className='ri-building-line' />} href="/organization/company">
                Company Profile
              </MenuItem>
            ) : null}
            {canViewStores ? (
              <MenuItem icon={<i className='ri-store-2-line' />} href="/organization/stores">
                Stores
              </MenuItem>
            ) : null}
            {canViewTeam ? (
              <MenuItem icon={<i className='ri-team-line' />} href="/organization/team">
                Team
              </MenuItem>
            ) : null}
            {canViewAccessControl ? (
              <MenuItem icon={<i className='ri-shield-user-line' />} href="/organization/access-control">
                Access Control
              </MenuItem>
            ) : null}
          </MenuSection>
        ) : null}
        {canViewSystemSettings ? (
          <MenuSection label="Settings">
            <MenuItem href="/settings">System Settings</MenuItem>
          </MenuSection>
        ) : null}

      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
