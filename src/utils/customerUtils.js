/**
 * Customer utility functions
 */

/**
 * Format customer status for display
 * @param {string} status - The customer status
 * @returns {string} - Formatted status
 */
export const formatCustomerStatus = (status) => {
  switch (status) {
    case 'Active':
      return 'Active'
    case 'Deactive':
      return 'Inactive'
    default:
      return status || 'Unknown'
  }
}

/**
 * Get customer status color
 * @param {string} status - The customer status
 * @returns {string} - Color for the status
 */
export const getCustomerStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Deactive':
      return 'error'
    default:
      return 'default'
  }
}

/**
 * Format customer address for display
 * @param {Object} address - The address object
 * @returns {string} - Formatted address string
 */
export const formatCustomerAddress = (address) => {
  if (!address) return ''
  
  const parts = []
  if (address.addressLine1) parts.push(address.addressLine1)
  if (address.addressLine2) parts.push(address.addressLine2)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.country) parts.push(address.country)
  if (address.pincode) parts.push(address.pincode)
  
  return parts.join(', ')
}

/**
 * Get customer initials for avatar
 * @param {string} name - The customer name
 * @returns {string} - Customer initials
 */
export const getCustomerInitials = (name) => {
  if (!name) return '??'
  
  const nameParts = name.trim().split(' ')
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase()
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Format phone number for display
 * @param {string} phone - The phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4')
  }
  
  return phone
}

/**
 * Calculate customer age based on creation date
 * @param {string} createdAt - The creation date
 * @returns {string} - Human readable age
 */
export const getCustomerAge = (createdAt) => {
  if (!createdAt) return ''
  
  const created = new Date(createdAt)
  const now = new Date()
  const diffInMs = now - created
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 1) return 'Today'
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  
  return `${Math.floor(diffInDays / 365)} years ago`
}

/**
 * Get customer display name with fallback
 * @param {Object} customer - The customer object
 * @returns {string} - Display name
 */
export const getCustomerDisplayName = (customer) => {
  if (!customer) return 'Unknown Customer'
  return customer.name || customer.email || 'Unnamed Customer'
}

/**
 * Check if customer has complete address
 * @param {Object} address - The address object
 * @returns {boolean} - Whether the address is complete
 */
export const hasCompleteAddress = (address) => {
  if (!address) return false
  
  return !!(
    address.addressLine1 &&
    address.city &&
    address.state &&
    address.country &&
    address.pincode
  )
}

/**
 * Get customer balance color based on amount
 * @param {number} balance - The balance amount
 * @returns {string} - Color for the balance
 */
export const getBalanceColor = (balance) => {
  if (balance > 0) return 'success'
  if (balance < 0) return 'error'
  return 'default'
}

/**
 * Customer status options for dropdowns
 */
export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Deactive', label: 'Inactive' }
]

/**
 * Default customer form data
 */
export const DEFAULT_CUSTOMER_FORM = {
  name: '',
  email: '',
  phone: '',
  website: '',
  notes: '',
  status: 'Active',
  image: null,
  billingAddress: {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  },
  shippingAddress: {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  },
  bankDetails: {
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    IFSC: ''
  }
}