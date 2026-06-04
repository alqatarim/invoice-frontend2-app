'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
// import NavSearch from '@components/layout/shared/search'
// import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
// import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import LocationChip from '@components/layout/shared/LocationChip'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Keep commented so the top-bar star shortcuts can be restored later if needed.
// const shortcuts = [
//   {
//     url: '/index',
//     icon: 'ri-home-line',
//     title: 'Dashboard',
//     subtitle: 'Main'
//   },
//   {
//     url: '/customers',
//     icon: 'ri-users-line',
//     title: 'Customers',
//     subtitle: 'Manage Customers'
//   },
//   {
//     url: '/vendors',
//     icon: 'ri-user-line',
//     title: 'Vendors',
//     subtitle: 'Manage Vendors'
//   },
//   {
//     url: '/products/product-list',
//     icon: 'ri-package-line',
//     title: 'Product List',
//     subtitle: 'Manage Products'
//   },
//   {
//     url: '/category',
//     icon: 'ri-list-check-line',
//     title: 'Category',
//     subtitle: 'Manage Categories'
//   },
//   {
//     url: '/units',
//     icon: 'ri-ruler-line',
//     title: 'Units',
//     subtitle: 'Manage Units'
//   },
//   {
//     url: '/inventory',
//     icon: 'ri-inventory-line',
//     title: 'Inventory',
//     subtitle: 'Manage Inventory'
//   },
//   {
//     url: '/invoices/invoice-list',
//     icon: 'ri-file-list-line',
//     title: 'Invoice',
//     subtitle: 'Manage Invoices'
//   },
//   {
//     url: '/sales-return/sales-return-list',
//     icon: 'ri-refund-line',
//     title: 'Sales Return',
//     subtitle: 'Manage Sales Returns'
//   },
//   {
//     url: '/purchase-orders',
//     icon: 'ri-shopping-cart-line',
//     title: 'Purchase Orders',
//     subtitle: 'Manage Purchase Orders'
//   },
//   {
//     url: '/purchases',
//     icon: 'ri-shopping-bag-line',
//     title: 'Purchases',
//     subtitle: 'Manage Purchases'
//   },
//   {
//     url: '/debit-notes',
//     icon: 'ri-file-text-line',
//     title: 'Purchase Return',
//     subtitle: 'Manage Purchase Returns'
//   },
//   {
//     url: '/expenses',
//     icon: 'ri-file-plus-line',
//     title: 'Expenses',
//     subtitle: 'Manage Expenses'
//   },
//   {
//     url: '/payments',
//     icon: 'ri-credit-card-line',
//     title: 'Payments',
//     subtitle: 'Manage Payments'
//   },
//   {
//     url: '/quotation-list',
//     icon: 'ri-clipboard-line',
//     title: 'Quotations',
//     subtitle: 'Manage Quotations'
//   },
//   {
//     url: '/delivery-challans',
//     icon: 'ri-book-open-line',
//     title: 'Delivery Challans',
//     subtitle: 'Manage Delivery Challans'
//   },
//   {
//     url: '/payment-summary/payment-summary-list',
//     icon: 'ri-credit-card-line',
//     title: 'Payment Summary',
//     subtitle: 'View Payment Summary'
//   },
//   {
//     url: '/settings',
//     icon: 'ri-settings-line',
//     title: 'Settings',
//     subtitle: 'Manage Settings'
//   },
//   {
//     type: 'section',
//     label: 'Organization'
//   },
//   {
//     url: '/company',
//     icon: 'ri-building-line',
//     title: 'Company Profile',
//     subtitle: 'Company identity & branding'
//   },
//   {
//     url: '/stores',
//     icon: 'ri-store-2-line',
//     title: 'Stores',
//     subtitle: 'Manage store locations'
//   },
//   {
//     url: '/team',
//     icon: 'ri-team-line',
//     title: 'Team',
//     subtitle: 'Manage team members'
//   },
//   {
//     url: '/access-control',
//     icon: 'ri-shield-user-line',
//     title: 'Access Control',
//     subtitle: 'Roles & permissions'
//   }
// ]

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        {/* <NavSearch /> */}
      </div>
      <div className='flex items-center'>
        {/* <LanguageDropdown /> */}
        <LocationChip />
        <ModeDropdown />
        {/* <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <NotificationsDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
