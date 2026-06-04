'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';
import dayjs from 'dayjs';




const ENDPOINTS = {
  DEBIT_NOTE: {
    LIST: '/debit_note',
    ADD: '/debit_note/addData',
    VIEW: '/debit_note',
    UPDATE: '/debit_note',
    DELETE: '/debit_note',
    GET_NUMBER: '/debit_note/getDebitNoteNumber',
    CLONE: '/debit_note',
    PROCESS_REFUND: '/debit_note/processRefund',
    SET_AS_PENDING: '/debit_note/setAsPending',
  },
  DROPDOWN: {
    VENDOR: '/drop_down/vendor',
    PRODUCT: '/drop_down/product',
    TAX: '/drop_down/tax',
    BANK: '/drop_down/bank',
    SIGNATURE: '/drop_down/signature'
  },
  BANK: {
    ADD: '/bank/addBank'
  }
};

const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

export async function getDebitNotesList(page = 1, pageSize = 10, search = '') {
  try {
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;


    const response = await fetchWithAuth(
      `${ENDPOINTS.DEBIT_NOTE.LIST}?limit=${pageSize}&skip=${skipSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch debit notes');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0,
      summary: response.summary || {}
    };
  } catch (error) {
    console.error('Error fetching debit notes list:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteDebitNote(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.DELETE}/${id}/softDelete`, {
      method: 'PATCH'
    });

    if (response.code === 200) {
      return {
        success: true,
        message: response.data?.message || 'Purchase return deleted successfully',
      };
    }

    throw new Error(response.data?.message || response?.message || 'Failed to delete purchase return');
  } catch (error) {
    console.error('Error deleting debit note:', error);
    return { success: false, message: error.message };
  }
}

export async function getDebitNoteNumber() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DEBIT_NOTE.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting debit note number:', error);
    return { success: false, message: error.message };
  }
}

export async function getVendors() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.VENDOR, CACHE_STABLE_DROPDOWN);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.PRODUCT, CACHE_STABLE_DROPDOWN);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getTaxRates() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.TAX, CACHE_STABLE_DROPDOWN);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return [];
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.BANK, CACHE_STABLE_DROPDOWN);
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

export async function addDebitNote(data) {
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

    // Add all other fields with proper formatting
    Object.keys(data).forEach(key => {
      if (key !== 'items' && data[key] !== undefined && data[key] !== null) {
        if (key === 'dueDate' || key === 'debitNoteDate') {
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
    const paymentMode = data.paymentMode || data.payment_method || 'Cash';
    formData.append('paymentMode', paymentMode);
    formData.append('payment_method', paymentMode);
    if (data.status) {
      formData.append('status', data.status);
    }

    const response = await fetchWithAuth(ENDPOINTS.DEBIT_NOTE.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response.data?.message || response?.message || 'Failed to add purchase return');
    }

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Purchase return created successfully',
    };
  } catch (error) {
    console.error('Error adding purchase return:', error);
    return {
      success: false,
      message: error.message || 'Failed to add debit note'
    };
  }
}

export async function getDebitNoteDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.VIEW}/${id}`);

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch debit note details');
    }

    return {
      success: true,
      data: response.data || null
    };
  } catch (error) {
    console.error('Error fetching debit note details:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
}

export async function updateDebitNote(data) {
  try {


    const formData = new FormData();

    // Add items data with proper format
    if (Array.isArray(data.items)) {
      data.items.forEach((item, i) => {
        Object.keys(item).forEach(key => {
          formData.append(`items[${i}][productId]`, item.productId);
          formData.append(`items[${i}][quantity]`, item.quantity);
          formData.append(`items[${i}][unit]`, item?.unit);
          formData.append(`items[${i}][rate]`, item?.rate);
          formData.append(`items[${i}][discount]`, item?.discount);
          formData.append(`items[${i}][tax]`, item?.tax);
          formData.append(`items[${i}][amount]`, item?.amount);
          formData.append(`items[${i}][name]`, item?.name);

          if (item[key] !== undefined && item[key] !== null) {
            if (key === 'taxInfo') {
              const taxInfoStr = typeof item[key] === 'string'
                ? item[key]
                : JSON.stringify(item[key]);
              formData.append(`items[${i}][${key}]`, taxInfoStr);
            }
          }
        });
      });
    }

    // Ensure required fields are present
    formData.append('debitNoteDate', dayjs(data?.debitNoteDate || new Date()).toISOString());
    formData.append('debit_note_id', data.debit_note_id);
    formData.append("dueDate", dayjs(data?.dueDate || new Date()).toISOString());
    formData.append("referenceNo", data.referenceNo);
    formData.append("taxableAmount", data.taxableAmount);
    formData.append("TotalAmount", data.TotalAmount);
    formData.append("vat", data.vat);
    formData.append("totalDiscount", data.totalDiscount);
    const bankValue = data.bank?._id || data.bank || '';
    formData.append('bank', bankValue);
    formData.append('employee', data.employee || '');
    formData.append('notes', data.notes || '');
    formData.append('termsAndCondition', data.termsAndCondition || '');
    formData.append('purchaseOrderDate', data.purchaseOrderDate || '');
    formData.append('vendorId', data.vendorId || '');
    formData.append('roundOff', data.roundOff || false);
    const paymentMode = data.paymentMode || data.payment_method || 'Cash';
    formData.append('paymentMode', paymentMode);
    formData.append('payment_method', paymentMode);
    if (data.status) {
      formData.append('status', data.status);
    }
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.UPDATE}/${data.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response.data?.message || response?.message || 'Failed to update purchase return');
    }

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Purchase return updated successfully',
    };
  } catch (error) {
    console.error('Error updating purchase return:', error);
    return {
      success: false,
      message: error.message || 'Failed to update debit note'
    };
  }
}

export async function addBank(bankData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.BANK.ADD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bankData)
    });

    if (!response || response.code !== 200) {
      throw new Error(response?.message || 'Failed to add bank');
    }

    return response.data;
  } catch (error) {
    console.error('Error adding bank:', error);
    throw error;
  }
}

export async function processPurchaseReturnRefund(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.PROCESS_REFUND}/${id}`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (response.code === 200) {
      return {
        success: true,
        message: response.data?.message || 'Purchase return processed successfully',
      };
    }

    const message = Array.isArray(response.data?.message)
      ? response.data.message.join(' ')
      : response.data?.message || response.message;

    throw new Error(message || 'Failed to process purchase return');
  } catch (error) {
    console.error('Error processing purchase return:', error);
    return { success: false, message: error.message };
  }
}

export async function setPurchaseReturnAsPending(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.SET_AS_PENDING}/${id}`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (response.code === 200) {
      return {
        success: true,
        message: response.data?.message || 'Purchase return set to pending successfully',
      };
    }

    const message = Array.isArray(response.data?.message)
      ? response.data.message.join(' ')
      : response.data?.message || response.message;

    throw new Error(message || 'Failed to set purchase return as pending');
  } catch (error) {
    console.error('Error setting purchase return as pending:', error);
    return { success: false, message: error.message };
  }
}

export async function cloneDebitNote(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.CLONE}/${id}/clone`, {
      method: 'POST',
      body: {},
    });

    if (response.code && response.code !== 200) {
      const errorMessage = response.data?.message?.[0] || response.data?.message || response.message || 'Failed to clone purchase return';
      throw new Error(errorMessage);
    }

    const cloned = response.data?.debit_note || response.data?.clonedDebitNote || response.data;

    return {
      success: true,
      data: cloned,
      message: response.data?.message || 'Purchase return cloned successfully',
    };
  } catch (error) {
    console.error('Error cloning purchase return:', error);
    return {
      success: false,
      message: error.message || 'Failed to clone purchase return',
    };
  }
}
