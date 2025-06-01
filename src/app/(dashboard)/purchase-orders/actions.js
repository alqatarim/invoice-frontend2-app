'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { dataURLtoBlob } from '@/utils/fileUtils';
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

export async function getPurchaseOrderList(page = 1, pageSize = 10, filters = {}, sortConfig = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add pagination
    queryParams.append('skip', (page - 1) * pageSize);
    queryParams.append('limit', pageSize);

    // Add filters
    if (filters.vendorId) {
      queryParams.append('vendorId', filters.vendorId);
    }
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    if (filters.minAmount) {
      queryParams.append('minAmount', filters.minAmount);
    }
    if (filters.maxAmount) {
      queryParams.append('maxAmount', filters.maxAmount);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.purchaseOrderId) {
      queryParams.append('purchaseOrderId', filters.purchaseOrderId);
    }

    // Add sorting
    if (sortConfig.sortBy) {
      queryParams.append('sortBy', sortConfig.sortBy);
      queryParams.append('sortDirection', sortConfig.sortDirection || 'asc');
    }

    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.LIST}?${queryParams.toString()}`);

    // Ensure vendor information is properly populated
    const enhancedData = response.data?.map(order => ({
      ...order,
      vendorInfo: order.vendorInfo || order.vendorId || {}
    })) || [];

    return {
      success: true,
      data: enhancedData,
      totalRecords: response.total || response.data?.length || 0,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error fetching purchase order list:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      totalRecords: 0
    };
  }
}

export async function getFilteredPurchaseOrders(tab, page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  // Handle multiple status filtering
  const statusFilters = filters.status && Array.isArray(filters.status) && filters.status.length > 0
    ? filters.status
    : (tab !== 'ALL' ? [tab] : []);

  // If no specific status filters or ALL is selected, fetch all purchase orders
  if (statusFilters.length === 0 || statusFilters.includes('ALL')) {
    return await fetchPurchaseOrdersWithSingleStatus(null, page, pageSize, filters, sortBy, sortDirection);
  }

  // If only one status filter, use the existing logic
  if (statusFilters.length === 1) {
    return await fetchPurchaseOrdersWithSingleStatus(statusFilters[0], page, pageSize, filters, sortBy, sortDirection);
  }

  // For multiple status filters, we need to fetch each status separately and combine
  // Since the backend doesn't support multiple status filtering in a single call
  try {
    const allResults = [];
    let totalRecords = 0;

    // Fetch data for each status
    for (const status of statusFilters) {
      const result = await fetchPurchaseOrdersWithSingleStatus(status, 1, 1000, filters, sortBy, sortDirection);
      allResults.push(...result.purchaseOrders);
      // Note: totalRecords will be the sum of all status results, which might not be accurate for pagination
    }

    // Remove duplicates (in case a purchase order appears in multiple status results)
    const uniquePurchaseOrders = allResults.filter((purchaseOrder, index, self) =>
      index === self.findIndex(po => po._id === purchaseOrder._id)
    );

    // Apply client-side sorting if needed
    if (sortBy) {
      uniquePurchaseOrders.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle nested properties like vendorId.vendor_name
        if (sortBy.includes('.')) {
          const keys = sortBy.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'desc' ? -comparison : comparison;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
        }

        // Default comparison
        if (aValue < bValue) return sortDirection === 'desc' ? 1 : -1;
        if (aValue > bValue) return sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply client-side pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPurchaseOrders = uniquePurchaseOrders.slice(startIndex, endIndex);

    return {
      purchaseOrders: paginatedPurchaseOrders,
      pagination: {
        current: page,
        pageSize,
        total: uniquePurchaseOrders.length,
      },
    };
  } catch (error) {
    console.error('Error in getFilteredPurchaseOrders (multiple status):', error);
    throw new Error(error.message || 'Failed to fetch filtered purchase orders');
  }
}

async function fetchPurchaseOrdersWithSingleStatus(status, page, pageSize, filters, sortBy, sortDirection) {
  // Build the URL with single status
  let url = ENDPOINTS.PURCHASE_ORDER.LIST + `?page=${page}&pageSize=${pageSize}`;

  // Apply single status filter
  if (status && status !== 'ALL') {
    url += `&status=${encodeURIComponent(status)}`;
  }

  // Apply additional filters (excluding status since we handle it separately)
  if (filters.vendor && Array.isArray(filters.vendor) && filters.vendor.length > 0) {
    url += `&vendor=${filters.vendor.map(id => encodeURIComponent(id)).join(',')}`;
  }
  if (filters.purchaseOrderId && Array.isArray(filters.purchaseOrderId) && filters.purchaseOrderId.length > 0) {
    url += `&purchaseOrderId=${filters.purchaseOrderId.map(id => encodeURIComponent(id)).join(',')}`;
  }
  if (filters.fromDate) {
    url += `&fromDate=${encodeURIComponent(filters.fromDate)}`;
  }
  if (filters.toDate) {
    url += `&toDate=${encodeURIComponent(filters.toDate)}`;
  }

  // Apply sorting
  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
  }

  const response = await fetchWithAuth(url);

  if (response.code === 200 || response.data) {
    // Ensure vendor information is properly populated
    const enhancedData = response.data?.map(order => ({
      ...order,
      vendorDetails: order.vendorDetails || order.vendorId || order.vendorInfo || {},
      vendorInfo: order.vendorInfo || order.vendorId || order.vendorDetails || {}
    })) || [];

    return {
      purchaseOrders: enhancedData,
      pagination: {
        current: page,
        pageSize,
        total: response.totalRecords || response.total || enhancedData.length,
      },
    };
  } else {
    console.error('Failed to fetch filtered purchase orders:', response.message);
    throw new Error(response.message || 'Failed to fetch filtered purchase orders');
  }
}

export async function searchPurchaseOrders(searchTerm) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.LIST}?search=${encodeURIComponent(searchTerm)}`);

    const enhancedData = response.data?.map(order => ({
      ...order,
      vendorInfo: order.vendorInfo || order.vendorId || {}
    })) || [];

    return {
      success: true,
      data: enhancedData,
      totalRecords: response.total || response.data?.length || 0
    };
  } catch (error) {
    console.error('Error searching purchase orders:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      totalRecords: 0
    };
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

export async function convertToPurchase(id, data) {
  try {
    // Convert data to FormData
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
        if (key === 'dueDate' || key === 'purchaseOrderDate') {
          formData.append(key, new Date(data[key]).toISOString());
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.CONVERT}`, {
      method: 'POST',
      body: formData
    });

    return {
      success: response.code === 200,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('Error converting purchase order:', error);
    return {
      success: false,
      message: error.message || 'Failed to convert purchase order'
    };
  }
}

export async function clonePurchaseOrder(id) {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PURCHASE_ORDER.CLONE}/${id}/clone`, {
      method: 'POST',
      body: {}
    });


    // If we have clonedDebitNote directly, it means success
    if (response.clonedDebitNote) {
      return {
        success: true,
        data: response.clonedDebitNote,
        message: 'Purchase order cloned successfully'
      };
    }

    // If we have a code and it's not 200, it's an error
    if (response.code !== 200) {
      const errorMessage = response.data?.message?.[0] || response.message || 'Failed to clone purchase order';
      throw new Error(errorMessage);
    }

    // Fallback error if no valid response format is found
    throw new Error('Invalid response format from server');

  } catch (error) {
    console.error('Error cloning purchase order:', error);
    return {
      success: false,
      message: error.message || 'Failed to clone purchase order'
    };
  }
}

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

export async function exportPurchaseOrders(format = 'csv', filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      format,
      ...filters
    });

    const response = await fetchWithAuth(
      `/purchase_orders/export?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': format === 'csv' ? 'text/csv' : 'application/pdf'
        }
      }
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error exporting purchase orders:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

export async function getPurchaseOrderStats() {
  try {
    const response = await fetchWithAuth('/purchase_orders/stats');

    return {
      success: true,
      data: response.data || {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalAmount: 0,
        avgOrderValue: 0
      }
    };
  } catch (error) {
    console.error('Error fetching purchase order stats:', error);
    return {
      success: false,
      message: error.message,
      data: {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalAmount: 0,
        avgOrderValue: 0
      }
    };
  }
}

export async function getInitialPurchaseOrderData() {
  try {
    const response = await fetchWithAuth('/purchase_orders/getAllData');

    if (response.code === 200) {
      return {
        purchaseOrders: response.data || [],
        cardCounts: response.cardCounts || {},
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.total || 0
        }
      };
    }

    throw new Error(response.message || 'Failed to fetch purchase order data');
  } catch (error) {
    console.error('Error fetching initial purchase order data:', error);
    return {
      purchaseOrders: [],
      cardCounts: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  }
}