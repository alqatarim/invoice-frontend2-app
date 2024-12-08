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

export async function getPurchaseOrderList  (page = 1, pageSize = 10, searchTerm = '', filters = {}) {
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

export async function addPurchaseOrder  (data)  {
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