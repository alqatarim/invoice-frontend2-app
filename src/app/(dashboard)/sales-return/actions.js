'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';
import dayjs from 'dayjs';

const ENDPOINTS = {
  CREDIT_NOTE: {
    LIST: '/credit_note/creditNoteList',
    ADD: '/credit_note/addCreditNote',
    VIEW: '/credit_note/viewCreditNote',
    UPDATE: '/credit_note/updateCreditNote',
    DELETE: '/credit_note/deleteCreditNote',
    GET_NUMBER: '/credit_note/getCreditNoteNumber',
    FILTER: '/credit_note/filterCreditNote'
  },
  DROPDOWN: {
    CUSTOMER: '/drop_down/customer',
    PRODUCT: '/drop_down/product',
    TAX: '/drop_down/tax',
    BANK: '/drop_down/bank',
    SIGNATURE: '/drop_down/signature'
  },
  BANK: {
    ADD: '/bankSettings/addBank'
  }
};

export async function getSalesReturnList(page = 1, pageSize = 10) {
  try {
    const skipSize = page === 1 ? 0 : (page - 1) * pageSize;

    const response = await fetchWithAuth(
      `${ENDPOINTS.CREDIT_NOTE.LIST}?limit=${pageSize}&skip=${skipSize}`
    );

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch sales returns');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0
    };
  } catch (error) {
    console.error('Error fetching sales returns list:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteSalesReturn(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CREDIT_NOTE.DELETE}/${id}`, {
      method: 'PATCH'
    });

    if (response.code === 200) {
      return {
        success: true,
        message: 'Sales Return deleted successfully'
      };
    }

    throw new Error(response?.message || 'Failed to delete sales return');
  } catch (error) {
    console.error('Error deleting sales return:', error);
    return { success: false, message: error.message };
  }
}

export async function getSalesReturnNumber() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.CREDIT_NOTE.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting sales return number:', error);
    return { success: false, message: error.message };
  }
}

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.CUSTOMER);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
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

export async function addSalesReturn(data, signatureURL) {
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
        if (key === 'dueDate' || key === 'salesReturnDate') {
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

    const response = await fetchWithAuth(ENDPOINTS.CREDIT_NOTE.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to add sales return');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding sales return:', error);
    return {
      success: false,
      message: error.message || 'Failed to add sales return'
    };
  }
}

export async function getSalesReturnDetails(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CREDIT_NOTE.VIEW}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales return details:', error);
    throw error;
  }
}

export async function updateSalesReturn(data) {
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
    formData.append('salesReturnDate', dayjs(data?.salesReturnDate || new Date()).toISOString());
    formData.append('credit_note_id', data.credit_note_id);
    formData.append("dueDate", dayjs(data?.dueDate || new Date()).toISOString());
    formData.append("referenceNo", data.referenceNo);
    formData.append("taxableAmount", data.taxableAmount);
    formData.append("TotalAmount", data.TotalAmount);
    formData.append("vat", data.vat);
    formData.append("totalDiscount", data.totalDiscount);
    formData.append("bank", data.bank?._id || "");
    formData.append("notes", data.notes);
    formData.append("termsAndCondition", data.termsAndCondition);
    formData.append('customerId', data.customerId);
    formData.append('roundOff', data.roundOff || false);
    formData.append('sign_type', data.sign_type);

    // Handle signature based on type
    if (data.sign_type === "eSignature") {
      formData.append("signatureName", data.signatureName || "");

      if (data.signatureImage) {
        try {
          if (typeof data.signatureImage === 'string' && data.signatureImage.startsWith('data:image')) {
            // Handle base64 image
            const blob = await dataURLtoBlob(data.signatureImage);
            const file = new File([blob], 'signature.png', { type: 'image/png' });
            formData.append("signatureImage", file);

          } else if (typeof data.signatureImage === 'string' && data.signatureImage.startsWith('http')) {
            // Handle image URL
            const response = await fetch(data.signatureImage);
            const blob = await response.blob();
            const file = new File([blob], 'signature.png', { type: 'image/png' });
            formData.append("signatureImage", file);

          } else if (data.signatureImage instanceof Blob) {
            // Handle if it's already a Blob
            const file = new File([data.signatureImage], 'signature.png', { type: 'image/png' });
            formData.append("signatureImage", file);

          }
        } catch (error) {
          console.error('Error processing signature:', error);
          throw new Error('Failed to process signature: ' + error.message);
        }
      }
    } else {
      formData.append("signatureId", data.signatureId || "");
    }

    console.log('Submitting sales return data:', Object.fromEntries(formData));

    const response = await fetchWithAuth(`${ENDPOINTS.CREDIT_NOTE.UPDATE}/${data.id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to update sales return');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating sales return:', error);
    return {
      success: false,
      message: error.message || 'Failed to update sales return'
    };
  }
}

export async function getDropdownData() {
  try {
    const [customers, products, taxRates, banks, signatures] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures()
    ]);

    return {
      customers,
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

export async function filterSalesReturns(searchData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.CREDIT_NOTE.FILTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData)
    });

    if (response.code !== 200) {
      throw new Error(response?.message || 'Failed to filter sales returns');
    }

    return {
      success: true,
      data: response.data || [],
      totalRecords: response.totalRecords || 0
    };
  } catch (error) {
    console.error('Error filtering sales returns:', error);
    return { success: false, message: error.message };
  }
}