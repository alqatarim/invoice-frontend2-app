/**
 * Utility functions for vendor operations
 */

/**
 * Calculate vendor balance from ledger entries
 * @param {number} initialBalance - Initial balance amount
 * @param {string} initialBalanceType - Initial balance type ('Credit' or 'Debit')
 * @param {Array} ledgerEntries - Array of ledger entries
 * @returns {Object} - { amount: number, type: string }
 */
export const calculateVendorBalance = (initialBalance = 0, initialBalanceType = 'Credit', ledgerEntries = []) => {
  let totalCredit = initialBalanceType === 'Credit' ? initialBalance : 0;
  let totalDebit = initialBalanceType === 'Debit' ? initialBalance : 0;

  // Calculate total credits and debits from ledger entries
  ledgerEntries.forEach(entry => {
    if (entry.mode === 'Credit') {
      totalCredit += parseFloat(entry.amount) || 0;
    } else if (entry.mode === 'Debit') {
      totalDebit += parseFloat(entry.amount) || 0;
    }
  });

  const netAmount = totalCredit - totalDebit;
  
  return {
    amount: Math.abs(netAmount),
    type: netAmount >= 0 ? 'Credit' : 'Debit'
  };
};

/**
 * Format vendor display name
 * @param {Object} vendor - Vendor object
 * @returns {string} - Formatted vendor name
 */
export const formatVendorName = (vendor) => {
  if (!vendor) return 'Unknown Vendor';
  return vendor.vendor_name || vendor.name || 'Unnamed Vendor';
};

/**
 * Get vendor status display
 * @param {boolean} status - Vendor status
 * @returns {Object} - { label: string, color: string }
 */
export const getVendorStatusDisplay = (status) => {
  return status ? 
    { label: 'Active', color: 'success' } : 
    { label: 'Inactive', color: 'error' };
};

/**
 * Validate vendor data
 * @param {Object} vendorData - Vendor data to validate
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export const validateVendorData = (vendorData) => {
  const errors = [];

  if (!vendorData.vendor_name || vendorData.vendor_name.trim().length < 2) {
    errors.push('Vendor name must be at least 2 characters long');
  }

  if (!vendorData.vendor_email || !isValidEmail(vendorData.vendor_email)) {
    errors.push('Please provide a valid email address');
  }

  if (!vendorData.vendor_phone || vendorData.vendor_phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 characters long');
  }

  const balance = parseFloat(vendorData.balance);
  if (balance && balance < 0) {
    errors.push('Balance cannot be negative');
  }

  if (balance && balance > 0 && !vendorData.balanceType) {
    errors.push('Balance type is required when balance is provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format vendor balance for display
 * @param {number} amount - Balance amount
 * @param {string} type - Balance type ('Credit' or 'Debit')
 * @param {string} currency - Currency symbol
 * @returns {string} - Formatted balance string
 */
export const formatVendorBalance = (amount = 0, type = 'Credit', currency = '$') => {
  const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${currency} ${formattedAmount} (${type})`;
};

/**
 * Get vendor summary statistics
 * @param {Array} vendors - Array of vendor objects
 * @returns {Object} - Summary statistics
 */
export const getVendorSummaryStats = (vendors = []) => {
  const stats = {
    total: vendors.length,
    active: 0,
    inactive: 0,
    totalCreditBalance: 0,
    totalDebitBalance: 0,
    netBalance: 0
  };

  vendors.forEach(vendor => {
    // Count active/inactive
    if (vendor.status) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // Calculate balances
    const balance = parseFloat(vendor.balance) || 0;
    if (balance > 0) {
      if (vendor.balanceType === 'Credit') {
        stats.totalCreditBalance += balance;
        stats.netBalance += balance;
      } else if (vendor.balanceType === 'Debit') {
        stats.totalDebitBalance += balance;
        stats.netBalance -= balance;
      }
    }
  });

  return stats;
};

/**
 * Search vendors by name or email
 * @param {Array} vendors - Array of vendor objects
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered vendors
 */
export const searchVendors = (vendors = [], searchTerm = '') => {
  if (!searchTerm.trim()) {
    return vendors;
  }

  const term = searchTerm.toLowerCase();
  
  return vendors.filter(vendor => {
    const name = (vendor.vendor_name || '').toLowerCase();
    const email = (vendor.vendor_email || '').toLowerCase();
    const phone = (vendor.vendor_phone || '').toLowerCase();
    
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });
};

/**
 * Sort vendors by specified field
 * @param {Array} vendors - Array of vendor objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} - Sorted vendors
 */
export const sortVendors = (vendors = [], field = 'vendor_name', direction = 'asc') => {
  return [...vendors].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Handle nested properties
    if (field.includes('.')) {
      const keys = field.split('.');
      aValue = keys.reduce((obj, key) => obj?.[key], a);
      bValue = keys.reduce((obj, key) => obj?.[key], b);
    }

    // Handle null/undefined values
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    // Convert to strings for comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'desc' ? -comparison : comparison;
    }

    // Handle numeric comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }

    // Handle date comparison
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }

    // Default comparison
    if (aValue < bValue) return direction === 'desc' ? 1 : -1;
    if (aValue > bValue) return direction === 'desc' ? -1 : 1;
    return 0;
  });
};