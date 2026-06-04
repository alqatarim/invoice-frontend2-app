'use server';

import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
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

const FETCH_NO_CACHE = { cache: 'no-store' };

const DELIVERY_CHALLAN_PATHS = {
  list: '/deliveryChallans/deliveryChallans-list',
  add: '/deliveryChallans/deliveryChallans-add',
  edit: (id) => `/deliveryChallans/deliveryChallans-edit/${id}`,
  view: (id) => `/deliveryChallans/deliveryChallans-view/${id}`,
};

function revalidateDeliveryChallanRoutes(id) {
  revalidatePath(DELIVERY_CHALLAN_PATHS.list);
  revalidatePath(DELIVERY_CHALLAN_PATHS.add);
  if (id) {
    revalidatePath(DELIVERY_CHALLAN_PATHS.edit(id));
    revalidatePath(DELIVERY_CHALLAN_PATHS.view(id));
  }
}

/**
 * Get delivery challans with pagination.
 * Note: Backend only supports customer filter and fixed sorting by newest first.
 */
export async function getFilteredDeliveryChallans(page, pageSize, filters = {}) {
  noStore();
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.DELIVERY_CHALLANS.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters - only customer filter is supported by backend
    if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
      url += `&customer=${filters.customer.map(id => encodeURIComponent(id)).join(',')}`;
    }
    if (filters.search) {
      url += `&search=${encodeURIComponent(filters.search)}`;
    }

    const response = await fetchWithAuth(url, FETCH_NO_CACHE);

    if (response.code === 200) {
      const deliveryChallans = response.data || [];
      const total = response.totalRecords || deliveryChallans.length;

      return {
        deliveryChallans,
        summary: response.summary || {},
        pagination: {
          current: page,
          pageSize,
          total,
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
  noStore();
  const url = searchTerm
    ? ENDPOINTS.DROPDOWN.CUSTOMER + `?search=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.DROPDOWN.CUSTOMER;

  try {
    const response = await fetchWithAuth(url, FETCH_NO_CACHE);
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
  noStore();
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid delivery challan ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.VIEW}/${id}`, FETCH_NO_CACHE);

    if (response.code !== 200) {
      throw new Error(response.data?.message || response.message || 'Failed to fetch delivery challan');
    }

    const details = response.data?.dc_details;
    if (!details || (Array.isArray(details) && details.length === 0)) {
      return null;
    }

    return details;
  } catch (error) {
    console.error('Error in getDeliveryChallanById:', error);
    throw error;
  }
}

/**
 * Get delivery challan number.
 */
export async function getDeliveryChallanNumber() {
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.GET_NUMBER, FETCH_NO_CACHE);
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
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.CUSTOMER, FETCH_NO_CACHE);
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
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.PRODUCT, FETCH_NO_CACHE);
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
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.TAX, FETCH_NO_CACHE);
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
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.BANK, FETCH_NO_CACHE);
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
  noStore();
  try {
    const response = await fetchWithAuth('/pos/bootstrap', FETCH_NO_CACHE);
    const employees = response?.data?.cashiers || [];
    return employees.map(employee => ({
      ...employee,
      _id: employee._id || employee.value || employee.id,
      employeeName: employee.label || employee.fullName || employee.email || 'Employee',
      signatureName: employee.label || employee.fullName || employee.email || 'Employee',
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

/**
 * Add a new delivery challan.
 */
export async function addDeliveryChallan(data) {
  noStore();
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
    if (data.employee) formData.append('employee', data.employee);
    if (data.notes) formData.append('notes', data.notes);
    if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
    
    // Required fields with defaults
    formData.append('roundOff', data.roundOff || false);
    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.ADD, {
      method: 'POST',
      body: formData,
      ...FETCH_NO_CACHE,
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.data?.message || response?.message || 'Failed to add delivery challan');
    }

    revalidateDeliveryChallanRoutes();

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Delivery challan created successfully'
    };
  } catch (error) {
    console.error('Error adding delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update an existing delivery challan.
 */
export async function updateDeliveryChallan(id, data) {
  noStore();
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
    if (data.employee) formData.append('employee', data.employee);
    if (data.notes) formData.append('notes', data.notes);
    if (data.termsAndCondition) formData.append('termsAndCondition', data.termsAndCondition);
    
    // Required fields with defaults
    formData.append('roundOff', data.roundOff || false);
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData,
      ...FETCH_NO_CACHE,
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.data?.message || response?.message || 'Failed to update delivery challan');
    }

    revalidateDeliveryChallanRoutes(id);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Delivery challan updated successfully'
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
  noStore();
  try {
    const formData = new FormData();
    formData.append('_id', id);

    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.DELETE, {
      method: 'POST',
      body: formData,
      ...FETCH_NO_CACHE,
    });

    if (response.code === 200) {
      revalidateDeliveryChallanRoutes(id);

      return {
        success: true,
        message: response.data?.message || 'Delivery challan deleted successfully'
      };
    }

    throw new Error(response.data?.message || response?.message || 'Failed to delete delivery challan');
  } catch (error) {
    console.error('Error deleting delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Clone a delivery challan.
 */
export async function cloneDeliveryChallan(id) {
  noStore();
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DELIVERY_CHALLANS.CLONE}/${id}/clone`, {
      method: 'POST',
      ...FETCH_NO_CACHE,
    });

    if (response.code === 200) {
      revalidateDeliveryChallanRoutes(id);

      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Delivery challan cloned successfully'
      };
    }

    throw new Error(response.data?.message || response?.message || 'Failed to clone delivery challan');
  } catch (error) {
    console.error('Error cloning delivery challan:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Convert delivery challan to invoice.
 */
export async function convertToInvoice(data) {
  noStore();
  try {
    const deliveryChallanId = typeof data === 'string' ? data : data?._id;

    if (!deliveryChallanId) {
      throw new Error('Delivery challan id is required for conversion.');
    }

    const formData = new FormData();
    formData.append('_id', deliveryChallanId);

    if (typeof data === 'object' && data?.payment_method) {
      formData.append('payment_method', data.payment_method);
    }
    if (typeof data === 'object' && data?.isRecurring !== undefined) {
      formData.append('isRecurring', String(data.isRecurring));
    } else {
      formData.append('isRecurring', 'false');
    }
    if (typeof data === 'object' && data?.recurringCycle !== undefined) {
      formData.append('recurringCycle', String(data.recurringCycle));
    }

    const response = await fetchWithAuth(ENDPOINTS.DELIVERY_CHALLANS.CONVERT_TO_INVOICE, {
      method: 'POST',
      body: formData,
      ...FETCH_NO_CACHE,
    });

    if (response.code === 200) {
      revalidateDeliveryChallanRoutes(deliveryChallanId);
      revalidatePath('/invoices/invoice-list');

      return {
        success: true,
        message: response.data?.message || 'Delivery challan converted to invoice successfully',
        data: response.data,
      };
    }

    const errorMessage = Array.isArray(response.data?.message)
      ? response.data.message.join(', ')
      : response.data?.message || response?.message;

    throw new Error(errorMessage || 'Failed to convert delivery challan to invoice');
  } catch (error) {
    console.error('Error converting delivery challan to invoice:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Add a new bank.
 */
export async function addBank(bankData) {
  noStore();
  try {
    const response = await fetchWithAuth(ENDPOINTS.BANK.ADD, {
      method: 'POST',
      body: JSON.stringify(bankData),
      ...FETCH_NO_CACHE,
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