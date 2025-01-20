'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/helpers';
import dayjs from 'dayjs';

const ENDPOINTS = {
  PURCHASE_ORDER: {
    LIST: '/purchase_orders/getAllData',
    ADD: '/purchase_orders/addPurchaseOrder',
    VIEW: '/purchase_orders',
    UPDATE: '/purchase_orders',
    DELETE: '/purchase_orders',
    CONVERT: '/purchase_orders/convert',
    CLONE: '/purchase_orders/purchaseOrders',
    GET_NUMBER: '/purchase_orders/getPurchaseOrderNumber'
  }
};

export async function getPurchaseOrderList(page = 1, pageSize = 10) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PURCHASE_ORDER.LIST);
    return {
      success: true,
      data: response.data || [],
      totalRecords: response.data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching purchase order list:', error);
    return { success: false, message: error.message };
  }
}

export async function deletePurchaseOrder (id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.DELETE}/${id}/softDelete`, {
      method: 'PATCH'
    });

    return {
      success: response.code === 200,
      message: response.message
    };
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return { success: false, message: error.message };
  }
};

export async function convertToPurchase (id, data) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.CONVERT}`, {
      method: 'POST',
      body: data
    });

    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error converting purchase order:', error);
    return { success: false, message: error.message };
  }
};

export async function clonePurchaseOrder  (id)  {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.CLONE}/${id}/clone`, {
      method: 'POST'
    });

    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error cloning purchase order:', error);
    return { success: false, message: error.message };
  }
};

export async function getPurchaseOrderNumber  () {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PURCHASE_ORDER.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting purchase order number:', error);
    return { success: false, message: error.message };
  }
};

export async function getVendors  () {
  try {
    const response = await fetchWithAuth('/drop_down/vendor');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

export async function getProducts ()  {
  try {
    const response = await fetchWithAuth('/drop_down/product');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export async function getTaxRates () {
  try {
    const response = await fetchWithAuth('/drop_down/tax');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return [];
  }
};

export async function getBanks  () {
  try {
    const response = await fetchWithAuth('/drop_down/bank');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
};

export async function getSignatures ()  {
  try {
    const response = await fetchWithAuth('/drop_down/signature');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return [];
  }
};

export async function addPurchaseOrder(data, signatureURL) {
  try {
    // Debug log the incoming data
    console.log('Submitting purchase order data:', data);

    const formData = new FormData();

    // Add items data with proper format
    data.items.forEach((item, i) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          // Handle special cases
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
        if (key === 'dueDate' || key === 'purchaseOrderDate') {
          // Ensure dates are in ISO format
          formData.append(key, new Date(data[key]).toISOString());
        } else if (key === 'taxableAmount' || key === 'TotalAmount' || key === 'vat' || key === 'totalDiscount') {
          // Ensure numbers are properly formatted
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

    // Debug log the FormData
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await fetchWithAuth(ENDPOINTS.PURCHASE_ORDER.ADD, {
      method: 'POST',
      body: formData
    });

    if (!response || response.code !== 200) {
      console.error('Server response:', response);
      throw new Error(response?.message || 'Failed to add purchase order');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error details:', error);

    // Extract error messages from the response
    const errorMessages = error.response?.data?.message || [error.message || 'Error adding purchase order'];

    return {
      success: false,
      message: error.message || 'Error adding purchase order',
      errors: errorMessages
    };
  }
}

export async function getPurchaseOrderDetails (id)  {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.VIEW}/${id}`);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching purchase order details:', error);
    return { success: false, message: error.message };
  }
};

export async function updatePurchaseOrder(id, data, signatureURL) {
  // 1. ID Validation
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid purchase order ID');
  }

  try {
    const formData = new FormData();

    // 2. Items Data Processing - Match exact structure from old code
    const dataSource = data.items || [];
    for (let i = 0; i < dataSource.length; i++) {
      formData.append(`items[${i}][name]`, dataSource[i]?.name);
      formData.append(`items[${i}][key]`, i);
      formData.append(`items[${i}][productId]`, dataSource[i]?.productId);
      formData.append(`items[${i}][quantity]`, dataSource[i]?.quantity);
      formData.append(`items[${i}][units]`, dataSource[i]?.units);
      formData.append(`items[${i}][unit]`, dataSource[i]?.unit_id); // Important: use unit_id
      formData.append(`items[${i}][rate]`, dataSource[i]?.rate);
      formData.append(`items[${i}][discount]`, dataSource[i]?.discount);
      formData.append(`items[${i}][tax]`, dataSource[i]?.tax);

      // Special handling for taxInfo
      let taxIfoFormdata = dataSource[i].taxInfo;
      if (typeof dataSource[i].taxInfo !== "string") {
        taxIfoFormdata = JSON.stringify(dataSource[i].taxInfo);
      }
      formData.append(`items[${i}][taxInfo]`, taxIfoFormdata);

      formData.append(`items[${i}][amount]`, dataSource[i]?.amount);
      formData.append(`items[${i}][discountType]`, dataSource[i]?.discountType);
      formData.append(`items[${i}][isRateFormUpadted]`, dataSource[i]?.isRateFormUpadted);
      formData.append(`items[${i}][form_updated_discounttype]`, dataSource[i]?.form_updated_discounttype);
      formData.append(`items[${i}][form_updated_discount]`, dataSource[i]?.form_updated_discount);
      formData.append(`items[${i}][form_updated_rate]`, dataSource[i]?.form_updated_rate);
      formData.append(`items[${i}][form_updated_tax]`, dataSource[i]?.form_updated_tax);
    }

    // 3. Main Form Fields - Match exact structure
    formData.append("purchaseOrderId", data.purchaseOrderId);
    formData.append("vendorId", data.vendorId);
    formData.append("dueDate", dayjs(data?.dueDate || new Date()).toISOString());
    formData.append("purchaseOrderDate", dayjs(data?.purchaseOrderDate || new Date()).toISOString());
    formData.append("referenceNo", data.referenceNo);
    formData.append("taxableAmount", data.taxableAmount);
    formData.append("TotalAmount", data.TotalAmount);
    formData.append("vat", data.vat);
    formData.append("totalDiscount", data.totalDiscount);
    formData.append("roundOff", data.roundOff);
    formData.append("bank", data.bank?._id || "");
    formData.append("notes", data.notes);
    formData.append("termsAndCondition", data.termsAndCondition);
    formData.append("sign_type", data.sign_type);

    // 4. Signature Handling
    if (data.sign_type === "eSignature") {
      formData.append("signatureName", data.signatureName || "");
      if (signatureURL) {
        const blob = await dataURLtoBlob(signatureURL);
        formData.append("signatureImage", blob);
      }
    } else {
      formData.append("signatureId", data.signatureId || "");
    }

    // Debug logging
    console.log('Submitting purchase order data:', Object.fromEntries(formData));

    // 5. API Call
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData
    });

    if (!response || response.code !== 200) {
      throw new Error(response?.message || 'Failed to update purchase order');
    }

    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return { success: false, message: error.message };
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
      success: true,
      data: {
        vendors,
        products,
        taxRates,
        banks,
        signatures
      }
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return { success: false, message: error.message };
  }
}

export async function addBank(bankData) {
  try {
    const response = await fetchWithAuth('/bankSettings/addBank', {
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