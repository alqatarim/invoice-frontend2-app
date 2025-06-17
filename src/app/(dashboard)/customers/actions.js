'use server'

import { fetchWithAuth } from '@/Auth/fetchWithAuth'
import {
  customerApi,
  listcustomerApi,
  deletecustomerApi,
  updatecustomerApi,
  viewcustomerApi,
  filtercustomerApi,
  activatecustomerApi,
  deactivatecustomerApi,
  customerDetailsApi,
  dropdown_api
} from '@/core/end_points/end_points'

// Get all customers (legacy FormData version - kept for backward compatibility)
export async function getCustomers(formData) {
  try {
    const payload = {}

    // Extract pagination parameters
    if (formData.has('limit')) payload.limit = formData.get('limit')
    if (formData.has('page')) payload.page = formData.get('page')
    if (formData.has('search')) payload.search = formData.get('search')
    if (formData.has('sort')) payload.sort = formData.get('sort')

    const response = await fetchWithAuth(listcustomerApi)

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to fetch customers' }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: error.message || 'Failed to fetch customers' }
  }
}

// Get all customers (new clean version without FormData)
export async function getAllCustomers() {
  try {
    const response = await fetchWithAuth(listcustomerApi)

    if (!response || response.error) {
      throw new Error(response?.error || 'Failed to fetch customers')
    }

    return response.data || []
  } catch (error) {
    console.error('Error fetching all customers:', error)
    throw new Error(error.message || 'Failed to fetch customers')
  }
}

/**
 * Get initial customer data for the list page
 */
export async function getInitialCustomerData() {
  try {
    // Get customers list
    const response = await fetchWithAuth(listcustomerApi)

    if (!response || response.error) {
      return {
        success: false,
        error: response?.error || 'Failed to fetch customers',
        data: {
          customers: [],
          pagination: { current: 1, pageSize: 10, total: 0 },
          cardCounts: {
            totalCustomers: 0,
            activeCustomers: 0,
            inactiveCustomers: 0
          }
        }
      }
    }

    // Extract customer data
    const customers = response.data || []
    const totalRecords = response.totalRecords || 0

    // Calculate card counts
    const activeCustomers = customers.filter(c => c.status === 'Active').length
    const inactiveCustomers = customers.filter(c => c.status === 'Deactive').length

    return {
      success: true,
      data: {
        customers,
        pagination: {
          current: 1,
          pageSize: 10,
          total: totalRecords
        },
        cardCounts: {
          totalCustomers: totalRecords,
          activeCustomers,
          inactiveCustomers
        }
      }
    }
  } catch (error) {
    console.error('Error fetching initial customer data:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch initial customer data',
      data: {
        customers: [],
        pagination: { current: 1, pageSize: 10, total: 0 },
        cardCounts: {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0
        }
      }
    }
  }
}

// Get customer by ID
export async function getCustomerById(formData) {
  try {
    const id = formData.get('id')

    if (!id) {
      return { success: false, error: 'Customer ID is required' }
    }

    const response = await fetchWithAuth(viewcustomerApi, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to fetch customer' }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { success: false, error: error.message || 'Failed to fetch customer' }
  }
}

// Get customer with invoices
export async function getCustomerWithInvoices(formData) {
  try {
    const id = formData.get('id')

    if (!id) {
      return { success: false, error: 'Customer ID is required' }
    }

    const response = await fetchWithAuth(customerDetailsApi, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to fetch customer details' }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customer details:', error)
    return { success: false, error: error.message || 'Failed to fetch customer details' }
  }
}

// Add new customer
export async function addCustomer(formData) {
  try {
    // The formData already contains all fields from the form
    const response = await fetchWithAuth(customerApi, {
      method: 'POST',
      body: formData
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to add customer' }
    }

    return { success: true, data: response.data, message: 'Customer added successfully' }
  } catch (error) {
    console.error('Error adding customer:', error)
    return { success: false, error: error.message || 'Failed to add customer' }
  }
}

// Update customer
export async function updateCustomer(formData) {
  try {
    const response = await fetchWithAuth(updatecustomerApi, {
      method: 'PUT',
      body: formData
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to update customer' }
    }

    return { success: true, data: response.data, message: 'Customer updated successfully' }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { success: false, error: error.message || 'Failed to update customer' }
  }
}

// Delete customer
export async function deleteCustomer(formData) {
  try {
    const id = formData.get('id')

    if (!id) {
      return { success: false, error: 'Customer ID is required' }
    }

    const response = await fetchWithAuth(deletecustomerApi, {
      method: 'DELETE',
      body: JSON.stringify({ _id: id })
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to delete customer' }
    }

    return { success: true, message: 'Customer deleted successfully' }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { success: false, error: error.message || 'Failed to delete customer' }
  }
}

// Filter customers
export async function filterCustomers(formData) {
  try {
    const payload = {}

    // Extract filter parameters
    if (formData.has('customerId')) {
      const customerIds = formData.getAll('customerId')
      payload.customerId = customerIds.length > 0 ? customerIds : []
    }
    if (formData.has('search')) payload.search = formData.get('search')

    const response = await fetchWithAuth(filtercustomerApi, {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to filter customers' }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error filtering customers:', error)
    return { success: false, error: error.message || 'Failed to filter customers' }
  }
}

// Activate customer
export async function activateCustomer(formData) {
  try {
    const id = formData.get('id')

    if (!id) {
      return { success: false, error: 'Customer ID is required' }
    }

    const response = await fetchWithAuth(activatecustomerApi, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to activate customer' }
    }

    return { success: true, message: 'Customer activated successfully' }
  } catch (error) {
    console.error('Error activating customer:', error)
    return { success: false, error: error.message || 'Failed to activate customer' }
  }
}

// Deactivate customer
export async function deactivateCustomer(formData) {
  try {
    const id = formData.get('id')

    if (!id) {
      return { success: false, error: 'Customer ID is required' }
    }

    const response = await fetchWithAuth(deactivatecustomerApi, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to deactivate customer' }
    }

    return { success: true, message: 'Customer deactivated successfully' }
  } catch (error) {
    console.error('Error deactivating customer:', error)
    return { success: false, error: error.message || 'Failed to deactivate customer' }
  }
}

// Get customer dropdown data
export async function getCustomerDropdown() {
  try {
    const response = await fetchWithAuth(dropdown_api.customer_api, {
      method: 'GET'
    })

    if (!response || response.error) {
      return { success: false, error: response?.error || 'Failed to fetch customer dropdown' }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error fetching customer dropdown:', error)
    return { success: false, error: error.message || 'Failed to fetch customer dropdown' }
  }
}

/**
 * Get filtered customers with pagination and sorting.
 *
 * @param {number} page - Page number
 * @param {number} pageSize - Number of items per page
 * @param {Object} filters - Filter object
 * @param {string} sortBy - Sort field
 * @param {string} sortDirection - Sort direction (asc/desc)
 * @returns {Promise<Object>} - The filtered customer data
 */
export async function getFilteredCustomers(page = 1, pageSize = 10, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize
    let url = `${listcustomerApi}?skip=${skip}&limit=${pageSize}`

    // Apply filters
    if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
      url += `&customer=${filters.customer.map(id => encodeURIComponent(id)).join(',')}`
    }
    if (filters.search_customer) {
      url += `&search_customer=${encodeURIComponent(filters.search_customer)}`
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`
    }

    // Apply sorting
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`
    }

    const response = await fetchWithAuth(url)

    if (response && !response.error) {
      return {
        customers: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      }
    } else {
      console.error('Failed to fetch filtered customers:', response?.message)
      throw new Error(response?.message || 'Failed to fetch filtered customers')
    }
  } catch (error) {
    console.error('Error in getFilteredCustomers:', error)
    throw new Error(error.message || 'Failed to fetch filtered customers')
  }
}

/**
 * Search customers for autocomplete/dropdown functionality
 *
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} - Array of customer options
 */
export async function searchCustomers(searchTerm = '') {
  try {
    let url = `${listcustomerApi}?limit=100`
    
    if (searchTerm) {
      url += `&search_customer=${encodeURIComponent(searchTerm)}`
    }

    const response = await fetchWithAuth(url)

    if (response && !response.error) {
      return response.data || []
    } else {
      console.error('Failed to search customers:', response?.message)
      return []
    }
  } catch (error) {
    console.error('Error in searchCustomers:', error)
    return []
  }
}

