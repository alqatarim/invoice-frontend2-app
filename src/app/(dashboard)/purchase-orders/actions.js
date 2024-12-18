'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/helpers';

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
    const formData = new FormData();

    // Add items data
    data.items.forEach((item, i) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          formData.append(`items[${i}][${key}]`, item[key]);
        }
      });
    });

    // Add all other fields
    Object.keys(data).forEach(key => {
      if (key !== 'items' && data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // Handle signature if provided
    if (signatureURL) {
      const blob = await dataURLtoBlob(signatureURL);
      formData.append('signatureImage', blob);
    }

    const response = await fetchWithAuth(ENDPOINTS.PURCHASE_ORDER.ADD, {
      method: 'POST',
      body: formData
    });

    return {
      success: response.code === 200,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding purchase order:', error);
    return { success: false, message: error.message };
  }
};

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

export async function updatePurchaseOrderc (id, data) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.UPDATE}/${id}`, {
      method: 'PUT',
      body: data
    });

    return {
      success: response.code === 200,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return { success: false, message: error.message };
  }
};

export async function updatePurchaseOrder(id, data, signatureURL) {
  try {
    const formData = new FormData();

    // Add items data
    data.items.forEach((item, i) => {
      Object.keys(item).forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          formData.append(`items[${i}][${key}]`, item[key]);
        }
      });
    });

    // Add all other fields
    Object.keys(data).forEach(key => {
      if (key !== 'items' && data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    // Handle signature if provided
    if (signatureURL) {
      const blob = await dataURLtoBlob(signatureURL);
      formData.append('signatureImage', blob);
    }

    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData
    });

    return {
      success: response.code === 200,
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