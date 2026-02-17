'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { processSignatureImage } from '@/utils/fileUtils';

const ENDPOINTS = {
  CUSTOMER: {
    LIST: '/customers/listCustomers',
    VIEW: '/customers/viewCustomer',
    ADD: '/customers/addCustomer',
    UPDATE: '/customers/updateCustomer',
    DELETE: '/customers/deleteCustomer',
    ACTIVATE: '/customers/activateCustomer',
    DEACTIVATE: '/customers/deactivateCustomer',
    DETAILS: '/customers/CustomerWithInvoices',
  },
  DROPDOWN: {
    CUSTOMER: '/drop_down/customer',
  }
};

const CACHE_STABLE_LIST = { next: { revalidate: 60 } };
const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

/**
 * Get customer details by ID.
 *
 * @param {string} id - Customer ID.
 * @returns {Promise<Object>} - Customer data.
 * @throws {Error} - Throws error with detailed message.
 */
export async function getCustomerById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid customer ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CUSTOMER.VIEW}/${id}`, {
      cache: 'no-store'
    });


    // Check response structure based on backend pattern
    return response.data || {};
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error; // Propagate the error to be handled by the caller
  }
}

/**
 * Get initial customer data with default pagination and sorting.
 *
 * @returns {Promise<Object>} - The initial customer data including customers, pagination, and cardCounts.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function getInitialCustomerData() {
  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.CUSTOMER.LIST}?skip=0&limit=10&sortBy=createdAt&sortDirection=desc`,
      CACHE_STABLE_LIST
    );

    if (response.code === 200) {
      // Calculate card counts from the data
      const customers = response.data || [];
      const activeCustomers = customers.filter(c => c.status === 'Active').length;
      const inactiveCustomers = customers.filter(c => c.status === 'Deactive').length;

      return {
        customers: customers,
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || customers.length,
        },
        cardCounts: {
          totalCustomers: response.totalRecords || customers.length,
          activeCustomers,
          inactiveCustomers
        }
      };
    } else {
      console.error('Failed to fetch initial customer data');
      throw new Error('Failed to fetch initial customer data');
    }
  } catch (error) {
    console.error('Error in getInitialCustomerData:', error.message);
    throw new Error(error.message || 'Failed to fetch initial customer data');
  }
}

export async function getFilteredCustomers(apiParams) {
  try {
    // Build the URL with the parameters expected by the backend
    let url = ENDPOINTS.CUSTOMER.LIST;
    const queryParams = [];

    // Add pagination parameters
    if (apiParams.skip !== undefined) {
      queryParams.push(`skip=${apiParams.skip}`);
    }
    if (apiParams.limit !== undefined) {
      queryParams.push(`limit=${apiParams.limit}`);
    }

    // Add search parameter (searches across name, phone, email)
    if (apiParams.search_customer) {
      queryParams.push(`search_customer=${encodeURIComponent(apiParams.search_customer)}`);
    }

    // Add customer filter if provided
    if (apiParams.customer) {
      queryParams.push(`customer=${encodeURIComponent(apiParams.customer)}`);
    }

    // Add sorting parameters
    if (apiParams.sortBy) {
      queryParams.push(`sortBy=${encodeURIComponent(apiParams.sortBy)}`);
    }
    
    if (apiParams.sortDirection) {
      queryParams.push(`sortDirection=${encodeURIComponent(apiParams.sortDirection)}`);
    }

    // Construct final URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        customers: response.data || [],
        total: response.totalRecords || 0,
      };
    } else {
      console.error('Failed to fetch filtered customers:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered customers');
    }
  } catch (error) {
    console.error('Error in getFilteredCustomers:', error);
    throw new Error(error.message || 'Failed to fetch filtered customers');
  }
}

export async function searchCustomers(searchTerm = '') {
  // If no search term provided, return all customers
  const url = searchTerm
    ? ENDPOINTS.CUSTOMER.LIST + `?search_customer=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.CUSTOMER.LIST;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else if (response.message) {
      console.error('Error searching customers:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search customers due to an unknown error.');
      throw new Error('Failed to search customers');
    }
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw new Error(error.message || 'Failed in search Customers');
  }
}

export async function activateCustomer(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid customer ID for activation:', id);
    throw new Error('Invalid customer ID');
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.ACTIVATE, {
      method: 'POST',
      body: JSON.stringify({ _id: id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error activating customer:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to activate customer due to an unknown error.');
      throw new Error('Failed to activate customer');
    }
  } catch (error) {
    console.error('Error in activateCustomer:', error);
    throw new Error(error.message || 'Failed to activate customer');
  }
}

export async function deactivateCustomer(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid customer ID for deactivation:', id);
    throw new Error('Invalid customer ID');
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.DEACTIVATE, {
      method: 'POST',
      body: JSON.stringify({ _id: id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error deactivating customer:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to deactivate customer due to an unknown error.');
      throw new Error('Failed to deactivate customer');
    }
  } catch (error) {
    console.error('Error in deactivateCustomer:', error);
    throw new Error(error.message || 'Failed to deactivate customer');
  }
}

export async function deleteCustomer(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid customer ID for deletion:', id);
    throw new Error('Invalid customer ID');
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.DELETE, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    });
    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error deleting customer:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to delete customer due to an unknown error.');
      throw new Error('Failed to delete customer');
    }
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw new Error(error.message || 'Failed to delete customer');
  }
}

export async function updateCustomer(id, updatedFormData) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid customer ID');
  }

  const formData = new FormData();
  
  // Add basic customer information
  formData.append("name", updatedFormData.name);
  formData.append("email", updatedFormData.email);
  formData.append("phone", updatedFormData.phone);
  formData.append("website", updatedFormData.website || "");
  formData.append("notes", updatedFormData.notes || "");
  
  // Add billing address
  if (updatedFormData.billingAddress) {
    formData.append("billingAddress[name]", updatedFormData.billingAddress.name || "");
    formData.append("billingAddress[addressLine1]", updatedFormData.billingAddress.addressLine1 || "");
    formData.append("billingAddress[addressLine2]", updatedFormData.billingAddress.addressLine2 || "");
    formData.append("billingAddress[city]", updatedFormData.billingAddress.city || "");
    formData.append("billingAddress[state]", updatedFormData.billingAddress.state || "");
    formData.append("billingAddress[pincode]", updatedFormData.billingAddress.pincode || "");
    formData.append("billingAddress[country]", updatedFormData.billingAddress.country || "");
  }
  
  // Add shipping address
  if (updatedFormData.shippingAddress) {
    formData.append("shippingAddress[name]", updatedFormData.shippingAddress.name || "");
    formData.append("shippingAddress[addressLine1]", updatedFormData.shippingAddress.addressLine1 || "");
    formData.append("shippingAddress[addressLine2]", updatedFormData.shippingAddress.addressLine2 || "");
    formData.append("shippingAddress[city]", updatedFormData.shippingAddress.city || "");
    formData.append("shippingAddress[state]", updatedFormData.shippingAddress.state || "");
    formData.append("shippingAddress[pincode]", updatedFormData.shippingAddress.pincode || "");
    formData.append("shippingAddress[country]", updatedFormData.shippingAddress.country || "");
  }
  
  // Add bank details
  if (updatedFormData.bankDetails) {
    formData.append("bankDetails[bankName]", updatedFormData.bankDetails.bankName || "");
    formData.append("bankDetails[branch]", updatedFormData.bankDetails.branch || "");
    formData.append("bankDetails[accountHolderName]", updatedFormData.bankDetails.accountHolderName || "");
    formData.append("bankDetails[accountNumber]", updatedFormData.bankDetails.accountNumber || "");
    formData.append("bankDetails[IFSC]", updatedFormData.bankDetails.IFSC || "");
  }

  // Handle image upload if present
  if (updatedFormData.image && updatedFormData.image instanceof File) {
    formData.append("image", updatedFormData.image);
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.UPDATE + `/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update customer');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, message: error.message || 'Failed to update customer' };
  }
}

export async function addCustomer(formData) {
  try {
    // FormData is already properly formatted from the frontend
    // Just pass it directly to the API
    const response = await fetchWithAuth(ENDPOINTS.CUSTOMER.ADD, {
      method: 'POST',
      body: formData,
    });

    // Return the response directly to match old app's format
    // The frontend expects response.code === 200 for success
    return response;
  } catch (error) {
    console.error('Error adding customer:', error);
    // Return error in the expected format
    return {
      code: 400,
      message: error.message || 'Failed to add customer',
      data: { message: error.message || 'Failed to add customer' }
    };
  }
}

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.CUSTOMER, CACHE_STABLE_DROPDOWN);
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to fetch customers');
      throw new Error(response.message || 'Failed to fetch customers');
    }
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

/**
 * Get customer with their invoices details.
 *
 * @param {string} id - Customer ID.
 * @returns {Promise<Object>} - Customer data with invoices.
 * @throws {Error} - Throws error with detailed message.
 */
export async function getCustomerWithInvoices(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid customer ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CUSTOMER.DETAILS}?_id=${id}`, {
      cache: 'no-store'
    });


    // Check response structure based on backend pattern
    return response.data || {};
  } catch (error) {
    console.error('Error in getCustomerWithInvoices:', error);
    throw error;
  }
}