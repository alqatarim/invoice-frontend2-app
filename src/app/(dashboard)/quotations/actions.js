'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { revalidatePath } from 'next/cache';
import dayjs from 'dayjs';

const ENDPOINTS = {
  QUOTATION: {
    LIST: '/quotation/quotationList',
    ADD: '/quotation/addQuotation',
    VIEW: '/quotation/viewQuotation',
    UPDATE: '/quotation/updateQuotation',
    DELETE: '/quotation/deleteQuotation',
    GET_QUOTATION_NUMBER: '/quotation/getQuotationNumber',
    UPDATE_STATUS: '/quotation/update_status'
  },
  LIST: {
    CUSTOMER_LIST: '/customers/listCustomers',
    PRODUCT_LIST: '/products/listProduct',
    TAX_LIST: '/tax/listTaxes',
    UNIT_LIST: '/units/unitList'
  }
};

export async function getQuotationsList(page = 1, pageSize = 10, filters = {}) {
  try {
    revalidatePath('/quotations');
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;
    const queryParams = [`limit=${pageSize}`, `skip=${skipSize}`];

    if (filters.customer && filters.customer.length > 0) {
      queryParams.push(`customer=${filters.customer.join(',')}`);
    }

    if (filters.fromDate && filters.toDate) {
      queryParams.push(`fromDate=${filters.fromDate}`);
      queryParams.push(`toDate=${filters.toDate}`);
    }

    if (filters.status && filters.status.length > 0) {
      queryParams.push(`status=${filters.status.join(',')}`);
    }

    const response = await fetchWithAuth(
      `${ENDPOINTS.QUOTATION.LIST}?${queryParams.join('&')}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch quotations');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0
    };
  } catch (error) {
    console.error('Error fetching quotations list:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteQuotation(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.QUOTATION.DELETE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (response.code === 200) {
      revalidatePath('/quotations');
      return {
        success: true,
        message: 'Quotation deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete quotation');
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return { success: false, message: error.message };
  }
}

export async function getQuotationDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.QUOTATION.VIEW}/${id}`);

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch quotation details');
    }

    // Transform the data to include all necessary fields
    const quotationDetails = response.data;

    if (!quotationDetails) {
      throw new Error('Quotation details not found');
    }

    return {
      success: true,
      data: quotationDetails
    };
  } catch (error) {
    console.error('Error fetching quotation details:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch quotation details'
    };
  }
}



export async function addQuotation(data) {
  try {
    const formData = new FormData();

    // Append all required fields
    formData.append('quotationNumber', data.quotationNumber);
    formData.append('customerId', data.customerId);
    formData.append('customerName', data.customerName || '');
    formData.append('subject', data.subject || '');
    formData.append('date', data.date ? dayjs(data.date).format('YYYY-MM-DD') : '');
    formData.append('expiryDate', data.expiryDate ? dayjs(data.expiryDate).format('YYYY-MM-DD') : '');
    formData.append('status', data.status || 'DRAFTED');
    formData.append('subTotal', data.subTotal || 0);
    formData.append('totalAmount', data.totalAmount || 0);
    formData.append('totalDiscount', data.totalDiscount || 0);
    formData.append('totalTax', data.totalTax || 0);
    formData.append('notes', data.notes || '');
    formData.append('termsAndConditions', data.termsAndConditions || '');

    // Append items as JSON string
    if (data.items && data.items.length > 0) {
      formData.append('items', JSON.stringify(data.items));
    }

    // If there's a signature, append it
    if (data.signature) {
      formData.append('signature', data.signature);
    }

    const response = await fetchWithAuth(ENDPOINTS.QUOTATION.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      throw new Error(response?.message || 'Failed to add quotation');
    }

    revalidatePath('/quotations');
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding quotation:', error);
    return {
      success: false,
      message: error.message || 'Failed to add quotation'
    };
  }
}

// Alias for addQuotation to maintain consistency with the component naming
export const createQuotation = addQuotation;

export async function updateQuotation(id, data) {
  try {
    const formData = new FormData();

    // Append all required fields
    formData.append('quotationNumber', data.quotationNumber);
    formData.append('customerId', data.customerId);
    formData.append('subject', data.subject || '');
    formData.append('date', data.date ? dayjs(data.date).format('YYYY-MM-DD') : '');
    formData.append('expiryDate', data.expiryDate ? dayjs(data.expiryDate).format('YYYY-MM-DD') : '');
    formData.append('status', data.status || 'DRAFTED');
    formData.append('subTotal', data.subTotal || 0);
    formData.append('totalAmount', data.totalAmount || 0);
    formData.append('totalDiscount', data.totalDiscount || 0);
    formData.append('totalTax', data.totalTax || 0);
    formData.append('notes', data.notes || '');
    formData.append('termsAndConditions', data.termsAndConditions || '');

    // Append items as JSON string
    if (data.items && data.items.length > 0) {
      formData.append('items', JSON.stringify(data.items));
    }

    // If there's a signature, append it
    if (data.signature) {
      formData.append('signature', data.signature);
    }

    const response = await fetchWithAuth(`${ENDPOINTS.QUOTATION.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update quotation');
    }

    revalidatePath('/quotations');
    revalidatePath(`/quotations/quotation-view/${id}`);
    revalidatePath(`/quotations/quotation-edit/${id}`);

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating quotation:', error);
    return {
      success: false,
      message: error.message || 'Failed to update quotation'
    };
  }
}

export async function getQuotationNumber() {
  try {
    revalidatePath('/quotations/quotation-add');
    const response = await fetchWithAuth(ENDPOINTS.QUOTATION.GET_QUOTATION_NUMBER);
    return response.data;
  } catch (error) {
    console.error('Error fetching quotation number:', error);
    throw error;
  }
}

export async function updateQuotationStatus(id, status) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.QUOTATION.UPDATE_STATUS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      })
    });

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to update quotation status');
    }

    revalidatePath('/quotations');
    return {
      success: true,
      message: 'Quotation status updated successfully'
    };
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return { success: false, message: error.message };
  }
}

export async function convertToInvoice(id, paymentMethod = 'Cash') {
  try {
    const response = await fetchWithAuth('/quotation/convertInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _id: id,
        isRecurring: false,
        recurringCycle: "0",
        payment_method: paymentMethod
      })
    });

    // Handle success case
    if (response.code === 200) {
      revalidatePath('/quotations');
      revalidatePath('/invoices');
      return {
        success: true,
        data: response.data,
        message: response.message || 'Quotation converted to invoice successfully'
      };
    }

    // Handle validation errors (inventory insufficient)
    if (response.code === 422 || response.code === 400) {
      return {
        success: false,
        message: response.message || 'Validation error occurred'
      };
    }

    // Handle other error cases
    throw new Error(response?.message || 'Failed to convert quotation to invoice');

  } catch (error) {
    console.error('Error converting quotation to invoice:', error);

    // Return structured error response
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while converting the quotation'
    };
  }
}

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LIST.CUSTOMER_LIST);
    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}



export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LIST.PRODUCT_LIST);
    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getTaxes() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LIST.TAX_LIST);
    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch taxes');
  } catch (error) {
    console.error('Error fetching taxes:', error);
    throw error;
  }
}

export async function getUnits() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LIST.UNIT_LIST);
    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || 'Failed to fetch units');
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth('/drop_down/bank');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
}

export async function getSignatures() {
  try {
    const response = await fetchWithAuth('/drop_down/signature');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return [];
  }
}

export async function getDropdownData() {
  try {
    const [customers, products, taxRates, banks, signatures, units] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxes(),
      getBanks(),
      getSignatures(),
      getUnits()
    ]);

    return {
      customers,
      products,
      taxRates,
      banks,
      signatures,
      units
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return {
      customers: [],
      products: [],
      taxRates: [],
      banks: [],
      signatures: [],
      units: []
    };
  }
}

export async function searchCustomers(searchText) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.LIST.CUSTOMER_LIST}?name=${searchText}`);

    if (response.code === 200) {
      return {
        success: true,
        data: response.data || []
      };
    }
    throw new Error(response.message || 'Failed to search customers');
  } catch (error) {
    console.error('Error searching customers:', error);
    return { success: false, message: error.message };
  }
}
