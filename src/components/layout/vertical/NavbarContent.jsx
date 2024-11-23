// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Vars
const shortcuts = [
  {
    url: '/index',
    icon: 'ri-home-line',
    title: 'Dashboard',
    subtitle: 'Main'
  },
  {
    url: '/customers',
    icon: 'ri-users-line',
    title: 'Customers',
    subtitle: 'Manage Customers'
  },
  {
    url: '/vendors',
    icon: 'ri-user-line',
    title: 'Vendors',
    subtitle: 'Manage Vendors'
  },
  {
    url: '/products/product-list',
    icon: 'ri-package-line',
    title: 'Product List',
    subtitle: 'Manage Products'
  },
  {
    url: '/category',
    icon: 'ri-list-check-line',
    title: 'Category',
    subtitle: 'Manage Categories'
  },
  {
    url: '/units',
    icon: 'ri-ruler-line',
    title: 'Units',
    subtitle: 'Manage Units'
  },
  {
    url: '/inventory',
    icon: 'ri-inventory-line',
    title: 'Inventory',
    subtitle: 'Manage Inventory'
  },
  {
    url: '/invoice-list',
    icon: 'ri-file-list-line',
    title: 'Invoice',
    subtitle: 'Manage Invoices'
  },
  {
    url: '/sales-return',
    icon: 'ri-refund-line',
    title: 'Sales Return',
    subtitle: 'Manage Sales Returns'
  },
  {
    url: '/purchase-orders',
    icon: 'ri-shopping-cart-line',
    title: 'Purchase Orders',
    subtitle: 'Manage Purchase Orders'
  },
  {
    url: '/purchases',
    icon: 'ri-shopping-bag-line',
    title: 'Purchases',
    subtitle: 'Manage Purchases'
  },
  {
    url: '/debit-notes',
    icon: 'ri-file-text-line',
    title: 'Purchase Return',
    subtitle: 'Manage Purchase Returns'
  },
  {
    url: '/expenses',
    icon: 'ri-file-plus-line',
    title: 'Expenses',
    subtitle: 'Manage Expenses'
  },
  {
    url: '/payments',
    icon: 'ri-credit-card-line',
    title: 'Payments',
    subtitle: 'Manage Payments'
  },
  {
    url: '/quotations',
    icon: 'ri-clipboard-line',
    title: 'Quotations',
    subtitle: 'Manage Quotations'
  },
  {
    url: '/delivery-challans',
    icon: 'ri-book-open-line',
    title: 'Delivery Challans',
    subtitle: 'Manage Delivery Challans'
  },
  {
    url: '/payment-summary',
    icon: 'ri-credit-card-line',
    title: 'Payment Summary',
    subtitle: 'View Payment Summary'
  },
  {
    url: '/settings',
    icon: 'ri-settings-line',
    title: 'Settings',
    subtitle: 'Manage Settings'
  },
  {
    url: '/manage-user',
    icon: 'ri-user-line',
    title: 'Manage Users',
    subtitle: 'User Management'
  },
  {
    url: '/roles-permission',
    icon: 'ri-clipboard-line',
    title: 'Roles & Permission',
    subtitle: 'Manage Roles & Permissions'
  }
]

const notifications = [
  {
    avatarImage: '/images/avatars/2.png',
    title: 'Congratulations Flora 🎉',
    subtitle: 'Won the monthly bestseller gold badge',
    time: '1h ago',
    read: false
  },
  {
    title: 'Cecilia Becker',
    subtitle: 'Accepted your connection',
    time: '12h ago',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Bernard Woods',
    subtitle: 'You have new message from Bernard Woods',
    time: 'May 18, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'ri-bar-chart-line',
    avatarColor: 'info',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    time: 'Apr 24, 10:30 AM',
    read: true
  },
  {
    avatarText: 'MG',
    avatarColor: 'success',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    time: 'Feb 17, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'ri-mail-line',
    avatarColor: 'error',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    time: 'Jan 6, 1:48 PM',
    read: true
  }
]

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <LanguageDropdown />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
