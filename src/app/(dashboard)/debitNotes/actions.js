'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/helpers';
import dayjs from 'dayjs';




const ENDPOINTS = {
  DEBIT_NOTE: {
    LIST: '/debit_note',
    ADD: '/debit_note/addData',
    VIEW: '/debit_note',
    UPDATE: '/debit_note',
    DELETE: '/debit_note',
    GET_NUMBER: '/debit_note/getDebitNoteNumber',
    CLONE: '/debit_note'
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

export async function getDebitNotesList(page = 1, pageSize = 10) {
  try {
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;

    console.log('purchase return list URL:', `${ENDPOINTS.DEBIT_NOTE.LIST}?limit=${pageSize}&skip=${skipSize}`);
    const response = await fetchWithAuth(
      `${ENDPOINTS.DEBIT_NOTE.LIST}?limit=${pageSize}&skip=${skipSize}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch debit notes');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0
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
        message: 'Debit Notes Deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete debit note');
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
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.VENDOR);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.PRODUCT);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getTaxRates() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.TAX);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return [];
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.BANK);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
}

export async function getSignatures() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.SIGNATURE);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return [];
  }
}

export async function addDebitNote(data, signatureURL) {
  try {
    console.log('Submitting debit note data:', data);

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
    formData.append('sign_type', data.sign_type || 'eSignature');

    // Handle signature
    if (signatureURL) {
      try {
        const blob = await dataURLtoBlob(signatureURL);
        formData.append('signatureImage', blob, 'signature.png');
      } catch (error) {
        console.error('Error processing signature:', error);
        throw new Error('Failed to process signature');
      }
    }

    const response = await fetchWithAuth(ENDPOINTS.DEBIT_NOTE.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to add debit note');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding debit note:', error);
    return {
      success: false,
      message: error.message || 'Failed to add debit note'
    };
  }
}

export async function getDebitNoteDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.VIEW}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching debit note details:', error);
    throw error;
  }
}

export async function updateDebitNote(id, data, signatureURL) {
  try {
    console.log('Updating debit note data:', data);

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
    formData.append('sign_type', data.sign_type || 'eSignature');

    // Handle signature
    if (signatureURL) {
      try {
        const blob = await dataURLtoBlob(signatureURL);
        formData.append('signatureImage', blob, 'signature.png');
      } catch (error) {
        console.error('Error processing signature:', error);
        throw new Error('Failed to process signature');
      }
    }

    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update debit note');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating debit note:', error);
    return {
      success: false,
      message: error.message || 'Failed to update debit note'
    };
  }
}

export async function getDropdownData() {
  try {
    const [vendors, products, taxRates, banks, signatures] = await Promise.all([
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures()
    ]);

    return {
      vendors,
      products,
      taxRates,
      banks,
      signatures
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    throw error;
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

export async function cloneDebitNote(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.DEBIT_NOTE.CLONE}/${id}/clone`, {
      method: 'POST',
      body: {}
    });

    // Check if we received an error response
    if (response.code && response.code !== 200) {
      // Handle validation or other errors
      const errorMessage = response.data?.message?.[0] || response.message || 'Failed to clone debit note';
      throw new Error(errorMessage);
    }

    // If successful, response will contain clonedDebitNote
    if (!response.clonedDebitNote) {
      throw new Error('No cloned data received');
    }

    return {
      success: true,
      data: response.clonedDebitNote,
      message: 'Debit note cloned successfully'
    };
  } catch (error) {
    console.error('Error cloning debit note:', error);
    return {
      success: false,
      message: error.message || 'Failed to clone debit note'
    };
  }
}