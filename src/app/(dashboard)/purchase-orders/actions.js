'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';

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

export const getPurchaseOrderList = async (page = 1, pageSize = 10, searchTerm = '', filters = {}) => {
  try {
    let url = `${ENDPOINTS.PURCHASE_ORDER.LIST}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

    if (searchTerm) {
      url += `&search=${searchTerm}`;
    }

    if (filters.vendor) {
      url += `&vendor=${filters.vendor}`;
    }

    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error fetching purchase order list:', error);
    return { success: false, message: error.message };
  }
};

export const deletePurchaseOrder = async (id) => {
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

export const convertToPurchase = async (id, data) => {
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

export const clonePurchaseOrder = async (id) => {
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

export const getPurchaseOrderNumber = async () => {
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

export const getDropdownData = async () => {
  try {
    const [vendorsResponse, productsResponse, taxResponse, bankResponse] = await Promise.all([
      fetchWithAuth('/drop_down/vendor'),
      fetchWithAuth('/drop_down/product'),
      fetchWithAuth('/drop_down/tax'),
      fetchWithAuth('/drop_down/bank')
    ]);

    return {
      success: true,
      data: {
        vendors: vendorsResponse.data || [],
        products: productsResponse.data || [],
        taxes: taxResponse.data || [],
        banks: bankResponse.data || []
      }
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return { success: false, message: error.message };
  }
};

export const addPurchaseOrder = async (data) => {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PURCHASE_ORDER.ADD, {
      method: 'POST',
      body: data
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

export const getPurchaseOrderDetails = async (id) => {
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

export const updatePurchaseOrder = async (id, data) => {
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