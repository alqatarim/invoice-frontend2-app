'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';

const ENDPOINTS = {
  PURCHASE: {
    LIST: '/purchases/listPurchases',
    ADD: '/purchases/addPurchase',
    VIEW: '/purchases/viewPurchase',
    UPDATE: '/purchases/updatePurchase',
    DELETE: '/purchases/deletePurchase',
    GET_NUMBER: '/purchases/getPurchaseNumber'
  }
};

export const getPurchaseList = async (page = 1, pageSize = 10, searchTerm = '', filters = {}) => {
  try {
    let url = `${ENDPOINTS.PURCHASE.LIST}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

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
    console.error('Error fetching purchase list:', error);
    return { success: false, message: error.message };
  }
};

export const deletePurchase = async (id) => {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.DELETE}`, {
      method: 'POST',
      body: JSON.stringify({ _id: id })
    });

    return {
      success: response.code === 200,
      message: response.message
    };
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return { success: false, message: error.message };
  }
};

export const getPurchaseDetails = async (id) => {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.VIEW}/${id}`);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    return { success: false, message: error.message };
  }
};

export const addPurchase = async (data) => {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PURCHASE.ADD, {
      method: 'POST',
      body: data
    });

    return {
      success: response.code === 200,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error adding purchase:', error);
    return { success: false, message: error.message };
  }
};

export const updatePurchase = async (id, data) => {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE.UPDATE}/${id}`, {
      method: 'PUT',
      body: data
    });

    return {
      success: response.code === 200,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error updating purchase:', error);
    return { success: false, message: error.message };
  }
};

export const getPurchaseNumber = async () => {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PURCHASE.GET_NUMBER);
    return {
      success: response.code === 200,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting purchase number:', error);
    return { success: false, message: error.message };
  }
};