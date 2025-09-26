export const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Online', label: 'Online' }
];

// Customer related constants
export const customerStatusOptions = [
  { value: 'Active', label: 'Active', color: 'success' },
  { value: 'Deactive', label: 'Inactive', color: 'error' }
];

export const customerTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

export const customerTableColumns = [
  { id: 'name', label: 'Customer Name', sortable: true, visible: true },
  { id: 'email', label: 'Email', sortable: true, visible: true },
  { id: 'phone', label: 'Phone', sortable: false, visible: true },
  { id: 'status', label: 'Status', sortable: true, visible: true },
  { id: 'balance', label: 'Balance', sortable: true, visible: true },
  { id: 'createdAt', label: 'Created Date', sortable: true, visible: false },
  { id: 'actions', label: 'Actions', sortable: false, visible: true }
];

export const statusOptions = [
  { value: 'REFUND', label: 'Refund', color: 'secondary', icon: 'ri:refund-line' },
  { value: 'SENT', label: 'Sent', color: 'info', icon: 'ri:send-plane-line' },
  { value: 'UNPAID', label: 'Unpaid', color: 'warning', icon: 'ri:time-line' },
  { value: 'PARTIALLY_PAID', label: 'Partial Paid', color: 'warning', icon: 'mdi:invoice-text-clock-outline' },
  { value: 'PARTIALLY PAID', label: 'Partial Paid', color: 'warning', icon: 'mdi:invoice-text-clock-outline' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'secondary', icon: 'ri:close-circle-line' },
  { value: 'OVERDUE', label: 'Overdue', color: 'error', icon: 'mdi:invoice-text-clock-outline' },
  { value: 'PAID', label: 'Paid', color: 'success', icon: 'mdi:invoice-text-check-outline' },
  { value: 'DRAFTED', label: 'Drafted', color: 'secondary', icon: 'mdi:invoice-text-edit-outline' },
  { value: 'Active', label: 'Active', color: 'info', icon: 'ri:check-double-line' },
]

export const paymentSummaryStatus = [
  { value: 'REFUND', label: 'Refund', color: 'secondary' },
  { value: 'SENT', label: 'Sent', color: 'info' },
  { value: 'UNPAID', label: 'Unpaid', color: 'warning' },
  { value: 'PARTIALLY_PAID', label: 'Partial Paid', color: 'warning' },
  { value: 'Cancelled', label: 'Cancelled', color: 'secondary' },
  { value: 'OVERDUE', label: 'Overdue', color: 'error' },
  { value: 'PAID', label: 'Paid', color: 'success' },
  { value: 'DRAFTED', label: 'Drafted', color: 'secondary' },
  { value: 'Success', label: 'Success', color: 'success' },
  { value: 'Failed', label: 'Failed', color: 'error' },
  { value: 'Active', label: 'Active', color: 'info' },

]

export const invoiceTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'DRAFTED', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const purchaseOrderTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'DRAFTED', label: 'Draft' },
  { value: 'CONVERTED', label: 'Converted' },
]

export const debitNoteTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'DRAFTED', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const paymentMethodIcons = [
  { value: 'Cash', label: 'mdi:cash-multiple' },
  { value: 'Cheque', label: 'mdi:checkbook' },
  { value: 'Bank', label: 'mdi:bank' },
  { value: 'Online', label: 'mdi:web' },
  { value: 'Credit Card', label: 'bi:credit-card' }
]

export const vendorBalanceTypes = [
  { value: 'Credit', label: 'Credit' },
  { value: 'Debit', label: 'Debit' }
]

export const vendorStatusOptions = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' }
]

// Product related constants
export const productTypes = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' }
]

export const discountTypes = [
  { value: '2', label: 'Percentage' },
  { value: '3', label: 'Fixed' }
]

export const productTabs = [
  { value: 'PRODUCT', label: 'Products' },
  { value: 'CATEGORY', label: 'Categories' },
  { value: 'UNIT', label: 'Units' }
]

export const productStatusOptions = [
  { value: true, label: 'Active', color: 'success' },
  { value: false, label: 'Inactive', color: 'error' }
]

export const ledgerModes = [
  { value: 'Credit', label: 'Credit', color: 'success' },
  { value: 'Debit', label: 'Debit', color: 'error' }
]

// // Gender options for profile forms
// export const genderOptions = [
//   { value: '', label: 'Select Gender' },
//   { value: 2, label: 'Male', icon: 'mdi:gender-male' },
//   { value: 3, label: 'Female', icon: 'mdi:gender-female' },
//   { value: 'other', label: 'Other', icon: '' }
// ]


// Gender options matching old implementation
export const genderOptions = [
  { id: 2, text: "Male" },
  { id: 3, text: "Female" },
]



// Profile tabs for the profile page
export const profileTabs = [
  { value: 'profile', label: 'Profile', icon: 'ri-user-3-line' },
  { value: 'teams', label: 'Teams', icon: 'ri-team-line' },
  { value: 'projects', label: 'Projects', icon: 'ri-computer-line' },
  { value: 'connections', label: 'Connections', icon: 'ri-link-m' }
]

// Role options with icon for user roles
export const roleOptions = [
  { value: 'Super Admin', label: 'Super Admin', icon: 'mdi:shield-user-outline' },
  { value: 'admin', label: 'Admin', icon: 'mdi:user-star-outline' },
  { value: 'manager', label: 'Manager', icon: 'mdi:user-star-outline' },
  { value: 'user', label: 'User', icon: 'mdi:user-outline' },
  { value: 'accountant', label: 'Accountant', icon: 'mdi:account-tie-outline' },
  { value: 'developer', label: 'Developer', icon: 'ri-code-s-slash-line' },
  { value: 'guest', label: 'Guest', icon: 'ri-user-2-line' }
]

// Icon mapping for personal info fields
export const profilePersonalInfoIcons = {
  'first name': 'ri-user-line',
  'last name': 'ri-user-line',
  'username': 'ri-at-line',
  'email': 'ri-mail-line',
  'phone': 'ic:round-phone-iphone',
  'role': 'ri-user-star-line',
  'status': 'pajamas:status',
  'gender': 'mdi:gender-male',
  'birth date': 'mdi:birthday-cake-outline'
}

// Icon mapping for address info fields
export const profileAddressInfoIcons = {
  'address': 'ri-map-pin-line',
  'city': 'ri-building-line',
  'state': 'ri-road-map-line',
  'country': 'ri-earth-line',
  'postal code': 'ri-mail-send-line'
}

// Settings tabs for the settings page - matching old implementation exactly
export const settingsTabs = [
  { value: 'company', label: 'Company Settings', icon: 'ri-building-line' },
  { value: 'changePassword', label: 'Change Password', icon: 'ri-shield-user-line' },
  { value: 'notification', label: 'Notifications', icon: 'ri-notification-3-line' },
  { value: 'invoiceTemplates', label: 'Invoice Templates', icon: 'ri-layout-3-line' },
  { value: 'signatureLists', label: 'List of Signature', icon: 'ri-quill-pen-line' },
  { value: 'invoice', label: 'Invoice Settings', icon: 'ri-file-text-line' },
  { value: 'payment', label: 'Payment Settings', icon: 'ri-bank-card-line' },
  { value: 'bank', label: 'Bank Settings', icon: 'ri-bank-line' },
  { value: 'tax', label: 'Tax Rates', icon: 'ri-file-text-line' },
  { value: 'email', label: 'Email Settings', icon: 'ri-mail-settings-line' },
  { value: 'preference', label: 'Preference Settings', icon: 'ri-settings-3-line' }
]

// Delivery Challan tabs for filtering
// Quotation tabs for filtering
export const quotationTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DRAFTED', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CONVERTED', label: 'Converted' },
]

// Quotation status options
export const quotationStatusOptions = [
  { value: 'ACCEPTED', label: 'Accepted', color: 'success', icon: 'ri:check-double-line' },
  { value: 'DRAFTED', label: 'Draft', color: 'secondary', icon: 'mdi:invoice-text-edit-outline' },
  { value: 'SENT', label: 'Sent', color: 'info', icon: 'ri:send-plane-line' },
  { value: 'EXPIRED', label: 'Expired', color: 'warning', icon: 'ri:time-line' },
  { value: 'REJECTED', label: 'Rejected', color: 'error', icon: 'ri:close-circle-line' },
  { value: 'CONVERTED', label: 'Converted', color: 'primary', icon: 'mdi:invoice-text-check-outline' },
]

export const deliveryChallanTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Delivery Challan status options
export const deliveryChallanStatusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'success', icon: 'ri:check-double-line' },
  { value: 'CONVERTED', label: 'Converted', color: 'info', icon: 'mdi:invoice-text-check-outline' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'error', icon: 'ri:close-circle-line' },
]

// Available icons for role selection
export const ROLE_ICONS = [
  { value: 'mdi:account-circle', label: 'Default User', category: 'General' },
  { value: 'mdi:crown', label: 'Crown (Owner/CEO)', category: 'Leadership' },
  { value: 'mdi:shield-crown', label: 'Shield Crown (Admin)', category: 'Leadership' },
  { value: 'mdi:account-tie', label: 'Manager/Executive', category: 'Management' },
  { value: 'mdi:account-supervisor', label: 'Supervisor', category: 'Management' },
  { value: 'mdi:briefcase', label: 'Business', category: 'Management' },
  { value: 'mdi:code-tags', label: 'Developer', category: 'Technical' },
  { value: 'mdi:laptop', label: 'IT/Tech', category: 'Technical' },
  { value: 'mdi:database', label: 'Database Admin', category: 'Technical' },
  { value: 'mdi:palette', label: 'Designer', category: 'Creative' },
  { value: 'mdi:brush', label: 'Artist/Creative', category: 'Creative' },
  { value: 'mdi:camera', label: 'Photographer', category: 'Creative' },
  { value: 'mdi:chart-line', label: 'Sales/Marketing', category: 'Business' },
  { value: 'mdi:calculator', label: 'Finance/Accounting', category: 'Business' },
  { value: 'mdi:chart-bar', label: 'Analytics', category: 'Business' },
  { value: 'mdi:headset', label: 'Support', category: 'Service' },
  { value: 'mdi:phone', label: 'Customer Service', category: 'Service' },
  { value: 'mdi:lifebuoy', label: 'Help Desk', category: 'Service' },
  { value: 'mdi:account-group', label: 'HR/People', category: 'HR' },
  { value: 'mdi:handshake', label: 'Relations', category: 'HR' },
  { value: 'mdi:school', label: 'Training', category: 'HR' },
  { value: 'mdi:pencil', label: 'Editor/Writer', category: 'Content' },
  { value: 'mdi:book-open', label: 'Content Manager', category: 'Content' },
  { value: 'mdi:newspaper', label: 'Publisher', category: 'Content' },
  { value: 'mdi:eye', label: 'Viewer/Guest', category: 'Access' },
  { value: 'mdi:lock', label: 'Restricted', category: 'Access' },
  { value: 'mdi:key', label: 'Key Holder', category: 'Access' }
]

// Customer statistics configuration for overview cards
export const customerStatsConfig = [
  {
    key: 'totalAmount',
    title: 'Total Amount',
    subtitle: 'Total Invoiced',
    avatarIcon: 'ri:money-dollar-circle-line',
    color: 'success',
    iconSize: '30px'
  },
  {
    key: 'paidAmount',
    title: 'Paid Amount',
    subtitle: 'Total Paid',
    avatarIcon: 'ri:check-double-line',
    color: 'info',
    iconSize: '30px'
  },
  {
    key: 'outstandingAmount',
    title: 'Outstanding',
    subtitle: 'Amount Due',
    avatarIcon: 'ri:time-line',
    color: 'warning',
    iconSize: '30px'
  },
  {
    key: 'overdueAmount',
    title: 'Overdue',
    subtitle: 'Past Due',
    avatarIcon: 'ri:alarm-warning-line',
    color: 'error',
    iconSize: '30px'
  },
  {
    key: 'draftAmount',
    title: 'Draft',
    subtitle: 'Draft Invoices',
    avatarIcon: 'ri:draft-line',
    color: 'secondary',
    iconSize: '30px'
  },
  {
    key: 'cancelledAmount',
    title: 'Cancelled',
    subtitle: 'Cancelled Invoices',
    avatarIcon: 'ri:close-circle-line',
    color: 'default',
    iconSize: '30px'
  }
]

// Action buttons configuration for consistent usage across lists
export const actionButtons = [
  {
    id: 'view',
    label: 'View',
    icon: 'line-md:watch',
    color: 'primary',
    title: 'View Details'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'line-md:edit',
    color: 'primary',
    title: 'Edit Item'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'line-md:close-circle',
    color: 'error',
    title: 'Delete Item'
  },
  {
    id: 'clone',
    label: 'Clone',
    icon: 'mdi:content-duplicate',
    color: 'default',
    title: 'Clone Item'
  },
  {
    id: 'send',
    label: 'Send',
    icon: 'mdi:invoice-send-outline',
    color: 'default',
    title: 'Send Item'
  },
  {
    id: 'print',
    label: 'Print & Download',
    icon: 'mdi:printer-outline',
    color: 'default',
    title: 'Print & Download'
  },
  {
    id: 'activate',
    label: 'Activate',
    icon: 'mdi:account-check-outline',
    color: 'success',
    title: 'Activate Item'
  },
  {
    id: 'deactivate',
    label: 'Deactivate',
    icon: 'mdi:account-off-outline',
    color: 'warning',
    title: 'Deactivate Item'
  }
];





export const taxTypes = [
  { value: '1', label: 'Percentage', icon: 'lucide:percent' },
  { value: '2', label: 'Fixed', icon: 'lucide:saudi-riyal' }
]


export const formIcons = [
  { value: 'category', label: 'category', icon: 'mdi:category-outline' },
  { value: 'unit', label: 'Unit', icon: 'uil:ruler' },
  { value: 'service', label: 'service', icon: 'mdi:room-service-outline' },
  { value: 'product', label: 'product', icon: 'mdi:shopping-outline' },
  { value: 'barcode', label: 'barcode', icon: 'mdi:barcode-scan' },
  { value: 'currency', label: 'currency', icon: 'lucide:saudi-riyal' },
  { value: 'alertQuantity', label: 'alertQuantity', icon: 'mdi:gauge-low' },
  { value: '3', label: 'fixedDiscount', icon: 'lucide:saudi-riyal' },
  { value: '2', label: 'percentageDiscount', icon: 'lucide:percent' },
  { value: 'vat', label: 'vat', icon: 'heroicons-outline:receipt-tax' },
  // Additional icons for expenses and payments
  { value: 'id', label: 'id', icon: 'mdi:identifier' },
  { value: 'reference', label: 'reference', icon: 'mdi:text-box-outline' },
  { value: 'payment', label: 'payment', icon: 'mdi:credit-card-outline' },
  { value: 'date', label: 'date', icon: 'mdi:calendar-outline' },
  { value: 'status', label: 'status', icon: 'mdi:check-circle-outline' },
  { value: 'customer', label: 'customer', icon: 'mdi:account-outline' },
  { value: 'invoice', label: 'invoice', icon: 'mdi:file-document-outline' },
]