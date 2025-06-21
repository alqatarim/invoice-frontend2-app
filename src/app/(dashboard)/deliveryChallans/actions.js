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
  },
  BANK: {
    ADD: '/bankSettings/addbankDetails'
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

    // Add items data with explicit field mapping
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, i) => {
        // Explicit field assignment for each item
        if (item.productId) formData.append(`items[${i}][productId]`, item.productId);
        if (item.name) formData.append(`items[${i}][name]`, item.name);
        if (item.quantity !== undefined) formData.append(`items[${i}][quantity]`, item.quantity);
        if (item.unit) formData.append(`items[${i}][unit]`, item.unit);
        if (item.units) formData.append(`items[${i}][units]`, item.units);
        if (item.rate !== undefined) formData.append(`items[${i}][rate]`, item.rate);
        if (item.discount !== undefined) formData.append(`items[${i}][discount]`, item.discount);
        if (item.discountType !== undefined) formData.append(`items[${i}][discountType]`, item.discountType);
        if (item.tax !== undefined) formData.append(`items[${i}][tax]`, item.tax);
        if (item.amount !== undefined) formData.append(`items[${i}][amount]`, item.amount);
        
        // Handle taxInfo as JSON string
        if (item.taxInfo) {
          const taxInfoStr = typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo);
          formData.append(`items[${i}][taxInfo]`, taxInfoStr);
        }
        
        // Additional form tracking fields
        if (item.key) formData.append(`items[${i}][key]`, item.key);
        if (item.isRateFormUpadted !== undefined) formData.append(`items[${i}][isRateFormUpadted]`, item.isRateFormUpadted);
        if (item.form_updated_rate !== undefined) formData.append(`items[${i}][form_updated_rate]`, item.form_updated_rate);
        if (item.form_updated_discount !== undefined) formData.append(`items[${i}][form_updated_discount]`, item.form_updated_discount);
        if (item.form_updated_discounttype !== undefined) formData.append(`items[${i}][form_updated_discounttype]`, item.form_updated_discounttype);
        if (item.form_updated_tax !== undefined) formData.append(`items[${i}][form_updated_tax]`, item.form_updated_tax);
      });
    }

    // Add delivery address fields explicitly
    if (data.deliveryAddress) {
      if (data.deliveryAddress.name) formData.append('deliveryAddress[name]', data.deliveryAddress.name);
      if (data.deliveryAddress.addressLine1) formData.append('deliveryAddress[addressLine1]', data.deliveryAddress.addressLine1);
      if (data.deliveryAddress.addressLine2) formData.append('deliveryAddress[addressLine2]', data.deliveryAddress.addressLine2);
      if (data.deliveryAddress.city) formData.append('deliveryAddress[city]', data.deliveryAddress.city);
      if (data.deliveryAddress.state) formData.append('deliveryAddress[state]', data.deliveryAddress.state);
      if (data.deliveryAddress.pincode) formData.append('deliveryAddress[pincode]', data.deliveryAddress.pincode);
      if (data.deliveryAddress.country) formData.append('deliveryAddress[country]', data.deliveryAddress.country);
    }

    // Add main delivery challan fields explicitly
    if (data.customerId) formData.append('customerId', data.customerId);
    if (data.deliveryChallanNumber) formData.append('deliveryChallanNumber', data.deliveryChallanNumber);
    if (data.referenceNo) formData.append('referenceNo', data.referenceNo);
    
    // Handle date fields
    if (data.deliveryChallanDate) {
      formData.append('deliveryChallanDate', new Date(data.deliveryChallanDate).toISOString());
    }
    if (data.dueDate) {
      formData.append('dueDate', new Date(data.dueDate).toISOString());
    }

    // Add address field
    if (data.address) formData.append('address', data.address);

    // Add financial fields
    if (data.taxableAmount !== undefined) formData.append('taxableAmount', Number(data.taxableAmount).toString());
    if (data.totalDiscount !== undefined) formData.append('totalDiscount', Number(data.totalDiscount).toString());
    if (data.vat !== undefined) formData.append('vat', Number(data.vat).toString());
    if (data.TotalAmount !== undefined) formData.append('TotalAmount', Number(data.TotalAmount).toString());
    
    // Add other fields
    if (data.bank) formData.append('bank', data.bank);
    if (data.notes) formData.append('notes', data.notes);
    if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
    
    // Required fields with defaults
    formData.append('roundOff', data.roundOff || false);
    formData.append('sign_type', data.sign_type || 'manualSignature');
    
    // Signature fields
    if (data.signatureName) formData.append('signatureName', data.signatureName);
    if (data.signatureId) formData.append('signatureId', data.signatureId);

    // Handle signature image for eSignature type
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

    // Add delivery challan ID for update
    formData.append('_id', id);

    // Add items data with explicit field mapping
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item, i) => {
        // Explicit field assignment for each item
        if (item.productId) formData.append(`items[${i}][productId]`, item.productId);
        if (item.name) formData.append(`items[${i}][name]`, item.name);
        if (item.quantity !== undefined) formData.append(`items[${i}][quantity]`, item.quantity);
        if (item.unit) formData.append(`items[${i}][unit]`, item.unit);
        if (item.units) formData.append(`items[${i}][units]`, item.units);
        if (item.rate !== undefined) formData.append(`items[${i}][rate]`, item.rate);
        if (item.discount !== undefined) formData.append(`items[${i}][discount]`, item.discount);
        if (item.discountType !== undefined) formData.append(`items[${i}][discountType]`, item.discountType);
        if (item.tax !== undefined) formData.append(`items[${i}][tax]`, item.tax);
        if (item.amount !== undefined) formData.append(`items[${i}][amount]`, item.amount);
        
        // Handle taxInfo as JSON string
        if (item.taxInfo) {
          const taxInfoStr = typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo);
          formData.append(`items[${i}][taxInfo]`, taxInfoStr);
        }
        
        // Additional form tracking fields
        if (item.key) formData.append(`items[${i}][key]`, item.key);
        if (item.isRateFormUpadted !== undefined) formData.append(`items[${i}][isRateFormUpadted]`, item.isRateFormUpadted);
        if (item.form_updated_rate !== undefined) formData.append(`items[${i}][form_updated_rate]`, item.form_updated_rate);
        if (item.form_updated_discount !== undefined) formData.append(`items[${i}][form_updated_discount]`, item.form_updated_discount);
        if (item.form_updated_discounttype !== undefined) formData.append(`items[${i}][form_updated_discounttype]`, item.form_updated_discounttype);
        if (item.form_updated_tax !== undefined) formData.append(`items[${i}][form_updated_tax]`, item.form_updated_tax);
      });
    }

    // Add delivery address fields explicitly
    if (data.deliveryAddress) {
      if (data.deliveryAddress.name) formData.append('deliveryAddress[name]', data.deliveryAddress.name);
      if (data.deliveryAddress.addressLine1) formData.append('deliveryAddress[addressLine1]', data.deliveryAddress.addressLine1);
      if (data.deliveryAddress.addressLine2) formData.append('deliveryAddress[addressLine2]', data.deliveryAddress.addressLine2);
      if (data.deliveryAddress.city) formData.append('deliveryAddress[city]', data.deliveryAddress.city);
      if (data.deliveryAddress.state) formData.append('deliveryAddress[state]', data.deliveryAddress.state);
      if (data.deliveryAddress.pincode) formData.append('deliveryAddress[pincode]', data.deliveryAddress.pincode);
      if (data.deliveryAddress.country) formData.append('deliveryAddress[country]', data.deliveryAddress.country);
    }

    // Add main delivery challan fields explicitly
    if (data.customerId) formData.append('customerId', data.customerId);
    if (data.deliveryChallanNumber) formData.append('deliveryChallanNumber', data.deliveryChallanNumber);
    if (data.referenceNo) formData.append('referenceNo', data.referenceNo);
    
    // Handle date fields
    if (data.deliveryChallanDate) {
      formData.append('deliveryChallanDate', new Date(data.deliveryChallanDate).toISOString());
    }
    if (data.dueDate) {
      formData.append('dueDate', new Date(data.dueDate).toISOString());
    }

    // Add address field
    if (data.address) formData.append('address', data.address);

    // Add financial fields
    if (data.taxableAmount !== undefined) formData.append('taxableAmount', Number(data.taxableAmount).toString());
    if (data.totalDiscount !== undefined) formData.append('totalDiscount', Number(data.totalDiscount).toString());
    if (data.vat !== undefined) formData.append('vat', Number(data.vat).toString());
    if (data.TotalAmount !== undefined) formData.append('TotalAmount', Number(data.TotalAmount).toString());
    
    // Add other fields
    if (data.bank) formData.append('bank', data.bank);
    if (data.notes) formData.append('notes', data.notes);
    if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
    
    // Required fields with defaults
    formData.append('roundOff', data.roundOff || false);
    formData.append('sign_type', data.sign_type || 'manualSignature');
    
    // Signature fields
    if (data.signatureName) formData.append('signatureName', data.signatureName);
    if (data.signatureId) formData.append('signatureId', data.signatureId);

    // Handle signature image for eSignature type
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

/**
 * Add a new bank.
 */
export async function addBank(bankData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.BANK.ADD, {
      method: 'POST',
      body: JSON.stringify(bankData),
    });

    if (response.code === 200) {
      return response.data || {};
    } else {
      console.error('Failed to add bank');
      throw new Error(response.message || 'Failed to add bank');
    }
  } catch (error) {
    console.error('Error in addBank:', error);
    throw error;
  }
}