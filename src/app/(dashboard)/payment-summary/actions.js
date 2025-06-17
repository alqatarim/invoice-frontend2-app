'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'

// API Endpoints
const ENDPOINTS = {
  PAYMENT: {
    LIST: '/payment/paymentList',
    VIEW: '/payment/viewPayment',
    DELETE: '/payment/deletePayment',
    UPDATE_STATUS: '/payment/update_status'
  },
  CUSTOMER: {
    LIST: '/customers/listCustomers'
  }
}

/**
 * Get initial payment summary data with default pagination.
 * @returns {Promise<Object>} Initial payment summary data including payments and pagination
 */
export async function getInitialPaymentSummaryData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.LIST}?limit=10&skip=0`)

    if (response.code === 200) {
      return {
        payments: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        }
      }
    } else {
      console.error('Failed to fetch initial payment summary data')
      throw new Error(response.message || 'Failed to fetch initial payment summary data')
    }
  } catch (error) {
    console.error('Error in getInitialPaymentSummaryData:', error)
    throw new Error(error.message || 'Failed to fetch initial payment summary data')
  }
}

/**
 * Get filtered payment summaries with pagination and filters.
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @param {Object} filters - Filter object
 * @param {string} sortBy - Sort field
 * @param {string} sortDirection - Sort direction ('asc' or 'desc')
 * @returns {Promise<Object>} Filtered payment summary data
 */
export async function getFilteredPaymentSummaries(page = 1, pageSize = 10, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize
    const queryParams = [`limit=${pageSize}`, `skip=${skipSize}`]

    // Add customer filter if present
    if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
      queryParams.push(`customer=${filters.customer.join(',')}`)
    }

    // Add sorting if provided
    if (sortBy) {
      queryParams.push(`sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`)
    }

    const endpoint = `${ENDPOINTS.PAYMENT.LIST}?${queryParams.join('&')}`
    const response = await fetchWithAuth(endpoint)

    if (response.code === 200) {
      return {
        payments: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      }
    } else {
      console.error('Failed to fetch filtered payment summaries:', response.message)
      throw new Error(response.message || 'Failed to fetch filtered payment summaries')
    }
  } catch (error) {
    console.error('Error in getFilteredPaymentSummaries:', error)
    throw new Error(error.message || 'Failed to fetch filtered payment summaries')
  }
}

/**
 * Search customers for filter options.
 * @param {string} searchTerm - Search term for customer name/email
 * @returns {Promise<Array>} Array of customer objects
 */
export async function searchCustomers(searchTerm = '') {
  // If no search term provided, return empty array (only search when user types)
  if (!searchTerm || searchTerm.trim() === '') {
    return []
  }

  try {
    const endpoint = `${ENDPOINTS.CUSTOMER.LIST}?search_customer=${encodeURIComponent(searchTerm)}`
    const response = await fetchWithAuth(endpoint)

    if (response.code === 200) {
      return response.data || []
    } else {
      console.error('Failed to search customers:', response.message)
      throw new Error(response.message || 'Failed to search customers')
    }
  } catch (error) {
    console.error('Error in searchCustomers:', error)
    throw new Error(error.message || 'Failed to search customers')
  }
}

/**
 * Get all customers for initial filter options.
 * @returns {Promise<Array>} Array of all customer objects
 */
export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.LIST)

    if (response.code === 200) {
      return response.data || []
    } else {
      console.error('Failed to fetch customers')
      throw new Error(response.message || 'Failed to fetch customers')
    }
  } catch (error) {
    console.error('Error in getCustomers:', error)
    throw error
  }
}

/**
 * Get payment details by ID.
 * @param {string} id - Payment ID
 * @returns {Promise<Object>} Payment data
 */
export async function getPaymentById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid payment ID')
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.VIEW}/${id}`)

    if (response.code === 200) {
      return response.payment_details || response.data || response
    } else {
      console.error('Failed to fetch payment:', response.message)
      throw new Error(response.message || 'Failed to fetch payment')
    }
  } catch (error) {
    console.error('Error in getPaymentById:', error)
    throw error
  }
}

/**
 * Delete a payment.
 * @param {string} id - Payment ID
 * @returns {Promise<Object>} Success response
 */
export async function deletePayment(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid payment ID')
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.DELETE}/${id}`, {
      method: 'PATCH'
    })

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || 'Payment deleted successfully'
      }
    } else {
      console.error('Failed to delete payment:', response.message)
      throw new Error(response.message || 'Failed to delete payment')
    }
  } catch (error) {
    console.error('Error in deletePayment:', error)
    throw new Error(error.message || 'Failed to delete payment')
  }
}

/**
 * Update payment status.
 * @param {string} id - Payment ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Success response
 */
export async function updatePaymentStatus(id, status) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid payment ID')
  }

  if (!status || typeof status !== 'string') {
    throw new Error('Invalid status')
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PAYMENT.UPDATE_STATUS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    if (response.code === 200) {
      return {
        success: true,
        message: response.message || 'Payment status updated successfully'
      }
    } else {
      console.error('Failed to update payment status:', response.message)
      throw new Error(response.message || 'Failed to update payment status')
    }
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error)
    throw new Error(error.message || 'Failed to update payment status')
  }
}