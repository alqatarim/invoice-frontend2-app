'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

/**
 * Get initial inventory data with default pagination.
 *
 * @returns {Promise<Object>} Initial inventory data including items and pagination
 */
export const getInitialInventoryData = async () => {
  try {
    const response = await fetchWithAuth('/inventory/inventoryList?limit=10&skip=0');

    if (response.code === 200) {
      return {
        inventory: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
        cardCounts: response.cardCounts || {
          total_items: [],
          low_stock: [],
          out_of_stock: [],
          total_value: []
        }
      };
    } else {
      console.error('Failed to fetch initial inventory data');
      throw new Error('Failed to fetch initial inventory data');
    }
  } catch (error) {
    console.error('Error in getInitialInventoryData:', error);
    throw new Error(error.message || 'Failed to fetch initial inventory data');
  }
};

/**
 * Add stock to inventory
 *
 * @param {Object} stockData Stock details to add
 * @returns {Promise<Object>} Response from adding stock
 */
export async function addStock(stockData) {
  try {
    const response = await fetchWithAuth('/inventory/addStock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stockData)
    });

    if (response.code === 200) {
      return response;
    } else {
      throw new Error(response.message || 'Failed to add stock');
    }
  } catch (error) {
    console.error('Error in addStock:', error);
    throw new Error(error.message || 'Failed to add stock');
  }
}

/**
 * Remove stock from inventory
 *
 * @param {Object} stockData Stock details to remove
 * @returns {Promise<Object>} Response from removing stock
 */
export async function removeStock(stockData) {
  try {
    const response = await fetchWithAuth('/inventory/removeStock', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stockData)
    });

    if (response.code === 200) {
      return response;
    } else {
      throw new Error(response.message || 'Failed to remove stock');
    }
  } catch (error) {
    console.error('Error in removeStock:', error);
    throw new Error(error.message || 'Failed to remove stock');
  }
}

/**
 * Get filtered inventory items
 *
 * @param {number} page Current page number
 * @param {number} pageSize Items per page
 * @param {Object} filters Filter criteria
 * @param {string} sortBy Sort field
 * @param {string} sortDirection Sort direction
 * @param {string} searchTerm Search term for inventory items
 * @returns {Promise<Object>} Filtered inventory data
 */
export const getFilteredInventory = async (page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc', searchTerm = '') => {
  const skip = (page - 1) * pageSize;
  let url = `/inventory/inventoryList?limit=${pageSize}&skip=${skip}`;

  // Apply search
  if (searchTerm) {
    url += `&search_product=${encodeURIComponent(searchTerm)}`;
  }

  // Apply filters
  if (filters.product && Array.isArray(filters.product)) {
    url += `&product=${filters.product.join(',')}`;
  }

  // Apply sorting
  if (sortBy) {
    url += `&sortBy=${sortBy}&sortDirection=${sortDirection}`;
  }

  try {
    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        inventory: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        }
      };
    } else {
      throw new Error(response.message || 'Failed to fetch filtered inventory');
    }
  } catch (error) {
    console.error('Error in getFilteredInventory:', error);
    throw new Error(error.message || 'Failed to fetch filtered inventory');
  }
};

/**
 * Search products for filtering
 *
 * @param {string} searchTerm Search query
 * @returns {Promise<Array>} Matching products
 */
export async function searchProducts(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw new Error('Invalid search term');
  }
  
  try {
    const response = await fetchWithAuth(`/products/listProduct?search_product=${encodeURIComponent(searchTerm)}`);

    if (response.code === 200) {
      return response.data || [];
    } else {
      throw new Error(response.message || 'Failed to search products');
    }
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw new Error(error.message || 'Failed to search products');
  }
}