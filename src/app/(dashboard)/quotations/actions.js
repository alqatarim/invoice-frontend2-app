'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { revalidatePath } from 'next/cache';
import dayjs from 'dayjs';

const ENDPOINTS = {
  QUOTATION: {
    LIST: '/quotation/quotationList',
    ADD: '/quotation/addQuotation',
    VIEW: '/quotation/viewQuotation',
    UPDATE: '/quotation',
    DELETE: '/quotation/deleteQuotation',
    GET_QUOTATION_NUMBER: '/quotation/getQuotationNumber',
    UPDATE_STATUS: '/quotation/update_status',
    CLONE: '/quotation/cloneQuotation',
    CONVERT: '/quotation/convertInvoice',
  },
  LIST: {
    CUSTOMER_LIST: '/customers/listCustomers',
    PRODUCT_LIST: '/products/listProduct',
    TAX_LIST: '/tax/listTaxes',
    UNIT_LIST: '/units/unitList'
  }
};

const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

const appendQuotationFormData = (formData, data = {}) => {
  const items = Array.isArray(data.items) ? data.items : [];

  items.forEach((item, index) => {
    Object.entries(item || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const nextValue = key === 'taxInfo' && typeof value !== 'string'
        ? JSON.stringify(value)
        : value;

      formData.append(`items[${index}][${key}]`, nextValue);
    });
  });

  formData.append('quotation_id', data.quotation_id || data.quotationNumber || '');
  formData.append('customerId', data.customerId || '');
  formData.append(
    'quotation_date',
    data.quotation_date || data.date || data.quotationDate
      ? dayjs(data.quotation_date || data.date || data.quotationDate).toISOString()
      : ''
  );
  formData.append(
    'due_date',
    data.due_date || data.expiryDate || data.dueDate
      ? dayjs(data.due_date || data.expiryDate || data.dueDate).toISOString()
      : ''
  );
  formData.append('reference_no', data.reference_no || data.referenceNo || '');
  formData.append('discountType', data.discountType || '3');
  formData.append('discount', Number(data.discount || 0).toString());
  formData.append('tax', Number(data.tax || data.totalTax || data.vat || 0).toString());
  formData.append('taxableAmount', Number(data.taxableAmount || data.subTotal || 0).toString());
  formData.append('totalDiscount', Number(data.totalDiscount || 0).toString());
  formData.append('vat', Number(data.vat || data.totalTax || 0).toString());
  formData.append('roundOff', Boolean(data.roundOff));
  formData.append('TotalAmount', Number(data.TotalAmount || data.totalAmount || 0).toString());
  formData.append('bank', data.bank || '');
  formData.append('employee', data.employee || '');
  formData.append('notes', data.notes || '');
  formData.append('termsAndCondition', data.termsAndCondition || data.termsAndConditions || '');
  formData.append('status', data.status || '');
};

const extractActionMessage = (response, fallbackMessage) =>
  response?.data?.message || response?.message || fallbackMessage;

export async function getQuotationsList(page = 1, pageSize = 10, filters = {}) {
  try {
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
    if (filters.search) {
      queryParams.push(`search=${encodeURIComponent(filters.search)}`);
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
      totalRecords: response.totalRecords || 0,
      summary: response.summary || {}
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
        message: extractActionMessage(response, 'Quotation deleted successfully')
      };
    }

    throw new Error(extractActionMessage(response, 'Failed to delete quotation'));
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
    appendQuotationFormData(formData, data);

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
      message: extractActionMessage(response, 'Quotation created successfully')
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
    appendQuotationFormData(formData, data);

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
      message: extractActionMessage(response, 'Quotation updated successfully')
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
    const response = await fetchWithAuth(ENDPOINTS.QUOTATION.GET_QUOTATION_NUMBER);
    return {
      quotationNumber: response.data,
    };
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
      message: extractActionMessage(response, 'Quotation status updated successfully')
    };
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return { success: false, message: error.message };
  }
}

export async function convertToInvoice(id, paymentMethod = 'Cash') {
  try {
    const response = await fetchWithAuth(ENDPOINTS.QUOTATION.CONVERT, {
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
        message: extractActionMessage(response, 'Quotation converted to invoice successfully')
      };
    }

    // Handle validation errors (inventory insufficient)
    if (response.code === 422 || response.code === 400) {
      const validationMessage = response.data?.message || response.message;
      return {
        success: false,
        message: Array.isArray(validationMessage)
          ? validationMessage.join(', ')
          : validationMessage || 'Validation error occurred'
      };
    }

    // Handle other error cases
    throw new Error(extractActionMessage(response, 'Failed to convert quotation to invoice'));

  } catch (error) {
    console.error('Error converting quotation to invoice:', error);

    // Return structured error response
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while converting the quotation'
    };
  }
}

export async function cloneQuotation(id) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.QUOTATION.CLONE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.code && response.code !== 200) {
      throw new Error(extractActionMessage(response, 'Failed to clone quotation'));
    }

    revalidatePath('/quotations');

    return {
      success: true,
      data: response.data?.quotation || response.data,
      message: extractActionMessage(response, 'Quotation cloned successfully'),
    };
  } catch (error) {
    console.error('Error cloning quotation:', error);
    return {
      success: false,
      message: error.message || 'Failed to clone quotation',
    };
  }
}

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.LIST.CUSTOMER_LIST, CACHE_STABLE_DROPDOWN);
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
    const response = await fetchWithAuth(ENDPOINTS.LIST.PRODUCT_LIST, CACHE_STABLE_DROPDOWN);
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
    const response = await fetchWithAuth(ENDPOINTS.LIST.TAX_LIST, CACHE_STABLE_DROPDOWN);
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
    const response = await fetchWithAuth(ENDPOINTS.LIST.UNIT_LIST, CACHE_STABLE_DROPDOWN);
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
    const response = await fetchWithAuth('/drop_down/bank', CACHE_STABLE_DROPDOWN);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
}

export async function getSignatures() {
  try {
    const response = await fetchWithAuth('/pos/bootstrap', { cache: 'no-store' });
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
