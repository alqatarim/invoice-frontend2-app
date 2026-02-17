'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  VENDOR: {
    LIST: '/vendor/listVendor',
    VIEW: '/vendor/viewVendor',
    ADD: '/vendor/addVendor',
    UPDATE: '/vendor/updateVendor',
  },
  LEDGER: {
    ADD: "/ledger/addData",
    LIST: "/ledger/getAllData",
    VIEW: "/ledger/getById",
    UPDATE: "/ledger",
    DELETE: "/ledger",
  },
};

const CACHE_STABLE_LIST = { next: { revalidate: 60 } };

/**
 * Get vendor details by ID.
 *
 * @param {string} id - Vendor ID.
 * @returns {Promise<Object>} - Vendor data.
 * @throws {Error} - Throws error with detailed message.
 */
export async function getVendorById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid vendor ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.VENDOR.VIEW}/${id}`, {
      cache: 'no-store'
    });

    return response.data || {};
  } catch (error) {
    console.error('Error in getVendorById:', error);
    throw error;
  }
}

/**
 * Get initial vendor data with default pagination and sorting.
 *
 * @returns {Promise<Object>} - The initial vendor data including vendors and pagination.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function getInitialVendorData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.VENDOR.LIST}?skip=0&limit=10`, CACHE_STABLE_LIST);


    if (response.code === 200) {
      const result = {
        vendors: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
      };

      return result;
    } else {
      console.error('Failed to fetch initial vendor data - Response code:', response.code);
      throw new Error('Failed to fetch initial vendor data');
    }
  } catch (error) {
    console.error('Error in getInitialVendorData:', error);
    throw new Error(error.message || 'Failed to fetch initial vendor data');
  }
}

/**
 * Get filtered vendors with pagination and sorting.
 *
 * @param {number} page - Page number.
 * @param {number} pageSize - Number of items per page.
 * @param {Object} filters - Filter options.
 * @param {string} sortBy - Sort field.
 * @param {string} sortDirection - Sort direction (asc/desc).
 * @returns {Promise<Object>} - Filtered vendor data.
 */
export async function getFilteredVendors(page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.VENDOR.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters
    if (filters.vendor && Array.isArray(filters.vendor) && filters.vendor.length > 0) {
      url += `&vendor=${filters.vendor.map(id => encodeURIComponent(id)).join(',')}`;
    }
    if (filters.search_vendor) {
      url += `&search_vendor=${encodeURIComponent(filters.search_vendor)}`;
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`;
    }
    
    // Apply sorting
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        vendors: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    } else {
      console.error('Failed to fetch filtered vendors:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered vendors');
    }
  } catch (error) {
    console.error('Error in getFilteredVendors:', error);
    throw new Error(error.message || 'Failed to fetch filtered vendors');
  }
}

/**
 * Search vendors by name.
 *
 * @param {string} searchTerm - Search term.
 * @returns {Promise<Array>} - Array of vendors.
 */
export async function searchVendors(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.VENDOR.LIST + `?search_vendor=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.VENDOR.LIST;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else if (response.message) {
      console.error('Error searching vendors:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search vendors due to an unknown error.');
      throw new Error('Failed to search vendors');
    }
  } catch (error) {
    console.error('Error in searchVendors:', error);
    throw new Error(error.message || 'Failed to search vendors');
  }
}

/**
 * Add a new vendor.
 *
 * @param {Object} vendorData - Vendor data.
 * @returns {Promise<Object>} - Response object.
 */
export async function addVendor(vendorData) {
  try {
    // Create FormData as expected by backend
    const formData = new FormData();
    formData.append('vendor_name', vendorData.vendor_name || '');
    formData.append('vendor_email', vendorData.vendor_email || '');
    formData.append('vendor_phone', vendorData.vendor_phone || '');
    
    // Only add balance fields if balance is provided and > 0
    if (vendorData.balance && parseFloat(vendorData.balance) > 0) {
      formData.append('balance', vendorData.balance.toString());
      formData.append('balanceType', vendorData.balanceType || 'Credit');
    }

    const response = await fetchWithAuth(ENDPOINTS.VENDOR.ADD, {
      method: 'POST',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to add vendor');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding vendor:', error);
    return { success: false, message: error.message || 'Failed to add vendor' };
  }
}

/**
 * Update an existing vendor.
 *
 * @param {string} id - Vendor ID.
 * @param {Object} vendorData - Updated vendor data.
 * @returns {Promise<Object>} - Response object.
 */
export async function updateVendor(id, vendorData) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid vendor ID');
  }

  try {
    // Create FormData as expected by backend
    const formData = new FormData();
    formData.append('vendor_name', vendorData.vendor_name || '');
    formData.append('vendor_email', vendorData.vendor_email || '');
    formData.append('vendor_phone', vendorData.vendor_phone || '');
    
    // Only add balance fields if balance is provided and > 0
    if (vendorData.balance && parseFloat(vendorData.balance) > 0) {
      formData.append('balance', vendorData.balance.toString());
      formData.append('balanceType', vendorData.balanceType || 'Credit');
    }

    const response = await fetchWithAuth(ENDPOINTS.VENDOR.UPDATE + `/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update vendor');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating vendor:', error);
    return { success: false, message: error.message || 'Failed to update vendor' };
  }
}

/**
 * Delete a vendor (soft delete).
 *
 * @param {string} id - Vendor ID.
 * @returns {Promise<Object>} - Response object.
 */
export async function deleteVendor(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid vendor ID');
  }

  try {
    const response = await fetchWithAuth(`/vendor/deleteVendor/${id}`, {
      method: 'PATCH',
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to delete vendor');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return { success: false, message: error.message || 'Failed to delete vendor' };
  }
}

/**
 * Get vendor ledger entries.
 *
 * @param {string} vendorId - Vendor ID.
 * @param {number} page - Page number.
 * @param {number} pageSize - Number of items per page.
 * @returns {Promise<Object>} - Ledger data.
 */
export async function getVendorLedger(vendorId, page = 1, pageSize = 10) {
  if (!vendorId || typeof vendorId !== 'string') {
    throw new Error('Invalid vendor ID');
  }

  try {
    const skip = (page - 1) * pageSize;
    const url = `${ENDPOINTS.LEDGER.LIST}?vendorId=${encodeURIComponent(vendorId)}&skip=${skip}&limit=${pageSize}`;
    
    
    const response = await fetchWithAuth(url, {
      cache: 'no-store'
    });

    if (response.code === 200) {
      return {
        success: true,
        data: {
          ledgerEntries: response.data?.ledgers || [],
          total: response.totalRecords || 0,
        },
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    } else {
      console.error('Failed to fetch vendor ledger:', response.message);
      return {
        success: false,
        error: response.message || 'Failed to fetch vendor ledger'
      };
    }
  } catch (error) {
    console.error('Error in getVendorLedger:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch vendor ledger'
    };
  }
}

/**
 * Add a ledger entry for a vendor.
 *
 * @param {Object} ledgerData - Ledger entry data.
 * @returns {Promise<Object>} - Response object.
 */
export async function addLedgerEntry(ledgerData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LEDGER.ADD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ledgerData),
    });

    if (response.code === 200) {
      return { success: true, data: response.data };
    } else {
      return { 
        success: false, 
        error: response.message || 'Failed to add ledger entry'
      };
    }
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to add ledger entry' 
    };
  }
}