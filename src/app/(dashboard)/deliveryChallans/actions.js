'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';
import dayjs from 'dayjs';

const ENDPOINTS = {
  DELIVERY_CHALLANS: {
    ADD: '/delivery_challans/addDeliverychallan',
    DELETE: '/delivery_challans/deleteDeliverychallan',
    LIST: '/delivery_challans/listDeliverychallans',
    VIEW: '/delivery_challans/viewDeliverychallan',
    UPDATE: '/delivery_challans/updateDeliverychallan',
    CLONE: '/delivery_challans',
    GET_NUMBER: '/delivery_challans/getDeliveryChallanNumber',
    CONVERT_TO_INVOICE: '/delivery_challans/convertToInvoice'
  },
  DROPDOWN: {
    CUSTOMER: '/drop_down/customer',
    PRODUCT: '/drop_down/product',
    TAX: '/drop_down/tax',
    BANK: '/drop_down/bank',
    SIGNATURE: '/drop_down/signature'
  }
};

/**
 * Get initial delivery challan data with default pagination.
 */
export async function getInitialDeliveryChallanData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.LIST}?skip=0&limit=10`);

    if (response.code === 200) {
      const deliveryChallans = response.data || [];
      return {
        deliveryChallans,
        pagination: {
          current: 1,
          pageSize: 10,
          total: deliveryChallans.length,
        },
        cardCounts: {
          all: deliveryChallans.length,
          active: deliveryChallans.filter(dc => !dc.isDeleted).length
        }
      };
    } else {
      console.error('Failed to fetch initial delivery challan data');
      throw new Error('Failed to fetch initial delivery challan data');
    }
  } catch (error) {
    console.error('Error in getInitialDeliveryChallanData:', error);
    throw new Error(error.message || 'Failed to fetch initial delivery challan data');
  }
}

/**
 * Get delivery challan stats for dashboard cards.
 */
export async function getDeliveryChallanStats() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.LIST + '?skip=0&limit=1000');

    if (response.code === 200) {
      const deliveryChallans = response.data || [];
      const cardCounts = {
        all: deliveryChallans.length,
        active: deliveryChallans.filter(dc => dc.status === 'ACTIVE' || !dc.isDeleted).length,
        converted: deliveryChallans.filter(dc => dc.status === 'CONVERTED').length,
        cancelled: deliveryChallans.filter(dc => dc.status === 'CANCELLED').length,
      };

      return { cardCounts };
    } else {
      console.error('Failed to fetch delivery challan stats');
      throw new Error('Failed to fetch delivery challan stats');
    }
  } catch (error) {
    console.error('Error in getDeliveryChallanStats:', error);
    throw new Error(error.message || 'Failed to fetch delivery challan stats');
  }
}

/**
 * Get filtered delivery challans with pagination.
 * Note: Backend only supports customer filter and fixed sorting by newest first.
 */
export async function getFilteredDeliveryChallans(tab, page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.DELIVERY_CHALLANS.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters - only customer filter is supported by backend
    if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
      url += `&customer=${filters.customer.map(id => encodeURIComponent(id)).join(',')}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      const deliveryChallans = response.data || [];

      return {
        deliveryChallans,
        pagination: {
          current: page,
          pageSize,
          total: deliveryChallans.length,
        },
      };
    } else {
      console.error('Failed to fetch filtered delivery challans:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered delivery challans');
    }
  } catch (error) {
    console.error('Error in getFilteredDeliveryChallans:', error);
    throw new Error(error.message || 'Failed to fetch filtered delivery challans');
  }
}

/**
 * Search customers for dropdown.
 */
export async function searchCustomers(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.DROPDOWN.CUSTOMER + `?search=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.DROPDOWN.CUSTOMER;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to search customers');
      throw new Error('Failed to search customers');
    }
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw new Error(error.message || 'Failed to search customers');
  }
}

/**
 * Get delivery challan by ID.
 */
export async function getDeliveryChallanById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid delivery challan ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.VIEW}/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    return response.data?.dc_details || {};
  } catch (error) {
    console.error('Error in getDeliveryChallanById:', error);
    throw error;
  }
}

/**
 * Get delivery challan number.
 */
export async function getDeliveryChallanNumber() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting delivery challan number:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Get customers dropdown data.
 */
export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.CUSTOMER);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * Get products dropdown data.
 */
export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.PRODUCT);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get tax rates dropdown data.
 */
export async function getTaxRates() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.TAX);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return [];
  }
}

/**
 * Get banks dropdown data.
 */
export async function getBanks() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.BANK);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
}

/**
 * Get signatures dropdown data.
 */
export async function getSignatures() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.SIGNATURE);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return [];
  }
}

/**
 * Add a new delivery challan.
 */
export async function addDeliveryChallan(data, signatureURL) {
  try {
    const formData = new FormData();

    // Add items data with proper format
    data.items.forEach((item, i) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          if (key === 'taxInfo') {
            const taxInfoStr = typeof item[key] === 'string'
              ? item[key]
              : JSON.stringify(item[key]);
            formData.append(`items[${i}][${key}]`, taxInfoStr);
          } else {
            formData.append(`items[${i}][${key}]`, item[key]);
          }
        }
      });
    });

    // Add delivery address fields
    if (data.deliveryAddress) {
      Object.keys(data.deliveryAddress).forEach(key => {
        if (data.deliveryAddress[key] !== undefined && data.deliveryAddress[key] !== null) {
          formData.append(`deliveryAddress[${key}]`, data.deliveryAddress[key]);
        }
      });
    }

    // Add all other fields with proper formatting
    Object.keys(data).forEach(key => {
      if (key !== 'items' && key !== 'deliveryAddress' && data[key] !== undefined && data[key] !== null) {
        if (key === 'dueDate' || key === 'deliveryChallanDate') {
          formData.append(key, new Date(data[key]).toISOString());
        } else if (key === 'taxableAmount' || key === 'TotalAmount' || key === 'vat' || key === 'totalDiscount') {
          formData.append(key, Number(data[key]).toString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Ensure required fields are present
    formData.append('roundOff', data.roundOff || false);
    formData.append('sign_type', data.sign_type || 'eSignature');

    // Handle signature
    if (signatureURL && data.sign_type === 'eSignature') {
      try {
        const blob = await dataURLtoBlob(signatureURL);
        formData.append('signatureImage', blob, 'signature.png');
      } catch (error) {
        console.error('Error processing signature:', error);
        throw new Error('Failed to process signature');
      }
    }

    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to add delivery challan');
    }

    return {
      success: true,
      data: response.data,
      message: 'Delivery challan created successfully'
    };
  } catch (error) {
    console.error('Error adding delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update an existing delivery challan.
 */
export async function updateDeliveryChallan(id, data, signatureURL) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid delivery challan ID');
  }

  try {
    const formData = new FormData();

    // Add items data with proper format
    data.items.forEach((item, i) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          if (key === 'taxInfo') {
            const taxInfoStr = typeof item[key] === 'string'
              ? item[key]
              : JSON.stringify(item[key]);
            formData.append(`items[${i}][${key}]`, taxInfoStr);
          } else {
            formData.append(`items[${i}][${key}]`, item[key]);
          }
        }
      });
    });

    // Add delivery address fields
    if (data.deliveryAddress) {
      Object.keys(data.deliveryAddress).forEach(key => {
        if (data.deliveryAddress[key] !== undefined && data.deliveryAddress[key] !== null) {
          formData.append(`deliveryAddress[${key}]`, data.deliveryAddress[key]);
        }
      });
    }

    // Add all other fields with proper formatting
    Object.keys(data).forEach(key => {
      if (key !== 'items' && key !== 'deliveryAddress' && data[key] !== undefined && data[key] !== null) {
        if (key === 'dueDate' || key === 'deliveryChallanDate') {
          formData.append(key, new Date(data[key]).toISOString());
        } else if (key === 'taxableAmount' || key === 'TotalAmount' || key === 'vat' || key === 'totalDiscount') {
          formData.append(key, Number(data[key]).toString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    // Ensure required fields are present
    formData.append('roundOff', data.roundOff || false);
    formData.append('sign_type', data.sign_type || 'eSignature');

    // Handle signature
    if (signatureURL && data.sign_type === 'eSignature') {
      try {
        const blob = await dataURLtoBlob(signatureURL);
        formData.append('signatureImage', blob, 'signature.png');
      } catch (error) {
        console.error('Error processing signature:', error);
        throw new Error('Failed to process signature');
      }
    }

    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update delivery challan');
    }

    return {
      success: true,
      data: response.data,
      message: 'Delivery challan updated successfully'
    };
  } catch (error) {
    console.error('Error updating delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a delivery challan.
 */
export async function deleteDeliveryChallan(id) {
  try {
    const formData = new FormData();
    formData.append('_id', id);

    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.DELETE, {
      method: 'POST',
      body: formData
    });

    if (response.code === 200) {
      return {
        success: true,
        message: 'Delivery challan deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete delivery challan');
  } catch (error) {
    console.error('Error deleting delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Clone a delivery challan.
 */
export async function cloneDeliveryChallan(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.CLONE}/${id}/clone`, {
      method: 'POST'
    });

    if (response.code === 200) {
      return {
        success: true,
        data: response.data,
        message: 'Delivery challan cloned successfully'
      };
    }

    throw new Error(response?.message || 'Failed to clone delivery challan');
  } catch (error) {
    console.error('Error cloning delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Convert delivery challan to invoice.
 */
export async function convertToInvoice(data) {
  try {
    const formData = new FormData();
    formData.append('_id', data._id);

    if (data.isRecurring !== undefined) {
      formData.append('isRecurring', data.isRecurring);
    }
    if (data.recurringCycle !== undefined) {
      formData.append('recurringCycle', data.recurringCycle);
    }

    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.CONVERT_TO_INVOICE, {
      method: 'POST',
      body: formData
    });

    if (response.code === 200) {
      return {
        success: true,
        message: 'Delivery challan converted to invoice successfully'
      };
    }

    throw new Error(response?.message || 'Failed to convert delivery challan to invoice');
  } catch (error) {
    console.error('Error converting delivery challan to invoice:', error);
    return { success: false, message: error.message };
  }
}