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
  { value: 'REFUND', label: 'Refund', color: 'secondary' },
  { value: 'SENT', label: 'Sent', color: 'info' },
  { value: 'UNPAID', label: 'Unpaid', color: 'warning' },
  { value: 'PARTIALLY_PAID', label: 'Partial Paid', color: 'warning' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'secondary' },
  { value: 'OVERDUE', label: 'Overdue', color: 'error' },
  { value: 'PAID', label: 'Paid', color: 'success' },
  { value: 'DRAFTED', label: 'Drafted', color: 'secondary' },
    { value: 'Active', label: 'Active', color: 'info' },
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

export const ledgerModes = [
  { value: 'Credit', label: 'Credit' },
  { value: 'Debit', label: 'Debit' }
]

// Gender options for profile forms
export const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: '2', label: 'Male', icon: 'mdi:gender-male' },
  { value: '1', label: 'Female', icon: 'mdi:gender-female' },
  { value: 'other', label: 'Other', icon: '' }
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
export const deliveryChallanTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Delivery Challan status options
export const deliveryChallanStatusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'success' },
  { value: 'CONVERTED', label: 'Converted', color: 'info' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'error' },
]
