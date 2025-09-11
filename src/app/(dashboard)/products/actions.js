'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  PRODUCT: {
    LIST: '/products/listProduct',
    VIEW: '/products/viewProduct',
    ADD: '/products/addProduct',
    UPDATE: '/products/updateProduct',
    DELETE: '/products/deleteProduct',
    GENERATE_SKU: '/products/generateSKU'
  },
  DROPDOWN: {
    UNIT: '/drop_down/unit',
    CATEGORY: '/drop_down/category',
    TAX: '/drop_down/tax',
    PRODUCT: '/drop_down/product'
  }
};


/**
 * Get product details by ID.
 */
export async function getProductById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid product ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PRODUCT.VIEW}/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    return response.data || {};
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
}

/**
 * Get initial product data with default pagination.
 */
export async function getInitialProductData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.PRODUCT.LIST}?skip=0&limit=10`,
      {
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (response.code === 200) {
      const result = {
        products: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
      };

      return result;
    } else {
      console.error('Failed to fetch initial product data - Response code:', response.code);
      throw new Error('Failed to fetch initial product data');
    }
  } catch (error) {
    console.error('Error in getInitialProductData:', error);
    throw new Error(error.message || 'Failed to fetch initial product data');
  }
}

/**
 * Get filtered products with pagination and sorting.
 */
export async function getFilteredProducts(page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.PRODUCT.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters
    if (filters.product && Array.isArray(filters.product) && filters.product.length > 0) {
      url += `&product=${filters.product.map(id => encodeURIComponent(id)).join(',')}`;
    }
    if (filters.search_product) {
      url += `&search_product=${encodeURIComponent(filters.search_product)}`;
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`;
    }
    
    // Apply sorting
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
    }

    const response = await fetchWithAuth(url,
      {
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (response.code === 200) {
      return {
        products: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    } else {
      console.error('Failed to fetch filtered products:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered products');
    }
  } catch (error) {
    console.error('Error in getFilteredProducts:', error);
    throw new Error(error.message || 'Failed to fetch filtered products');
  }
}

/**
 * Search products by name.
 */
export async function searchProducts(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.PRODUCT.LIST + `?search_product=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.PRODUCT.LIST;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else if (response.message) {
      console.error('Error searching products:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search products due to an unknown error.');
      throw new Error('Failed to search products');
    }
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw new Error(error.message || 'Failed to search products');
  }
}

/**
 * Add a new product.
 */
export async function addProduct(productData, preparedImage) {
  try {
    const formData = new FormData();

    // Add fields in the exact order and format expected by backend (following old ReactJS app)
    formData.append("type", productData.type || 'product');
    formData.append("name", productData.name || '');
    formData.append("sku", productData.sku || '');
    formData.append("discountValue", productData.discountValue || 0);
    formData.append("barcode", productData.barcode || '');
    formData.append("units", productData.units || ''); // First append - should be the _id
    formData.append("category", productData.category || ''); // This should be the _id
    formData.append("sellingPrice", productData.sellingPrice || '');
    formData.append("purchasePrice", productData.purchasePrice || '');
    formData.append("units", productData.units || ''); // Second append (duplicate from old app)
    
    // discountType is already a numeric ID (2 for Percentage, 3 for Fixed)
    formData.append("discountType", productData.discountType || '');
    
    formData.append("alertQuantity", productData.alertQuantity || '');
    formData.append("tax", productData.tax || ''); // This should be the _id, empty string if none
    formData.append("productDescription", productData.productDescription || '');

    // Add image if provided
    if (preparedImage) {
      // Convert base64 to blob
      const base64Data = preparedImage.base64.split(',')[1];
      const mimeType = preparedImage.type;
      const fileName = preparedImage.name;

      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });

      formData.append('images', file);
    } else {
      formData.append('images', '');
    }

    const response = await fetchWithAuth(ENDPOINTS.PRODUCT.ADD, {
      method: 'POST',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to add product');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, message: error.message || 'Failed to add product' };
  }
}

/**
 * Update an existing product.
 */
export async function updateProduct(id, productData, preparedImage) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid product ID');
  }

  try {
    const formData = new FormData();

    // Add fields in the exact order and format expected by backend (following old ReactJS app)
    formData.append("name", productData.name || '');
    formData.append("type", productData.type || 'product');
    formData.append("sku", productData.sku || '');
    formData.append("discountValue", productData.discountValue || 0);
    formData.append("barcode", productData.barcode || '');
    formData.append("units", productData.units || ''); // This should be the _id
    formData.append("category", productData.category || ''); // This should be the _id
    formData.append("sellingPrice", productData.sellingPrice || '');
    formData.append("purchasePrice", productData.purchasePrice || '');
    
    // discountType is already a numeric ID (2 for Percentage, 3 for Fixed)
    formData.append("discountType", productData.discountType || '');
    
    formData.append("alertQuantity", productData.alertQuantity || '');
    formData.append("tax", productData.tax || ''); // This should be the _id, empty string if none
    formData.append("productDescription", productData.productDescription || '');
    formData.append("_id", id); // Add the product ID as expected by backend

    // Handle image upload
    if (preparedImage) {
      // Convert base64 to blob
      const base64Data = preparedImage.base64.split(',')[1];
      const mimeType = preparedImage.type;
      const fileName = preparedImage.name;

      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      const file = new File([blob], fileName, { type: mimeType });
      formData.append('images', file);
    } else {
      formData.append('images', '');
    }

    const response = await fetchWithAuth(`${ENDPOINTS.PRODUCT.UPDATE}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update product');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, message: error.message || 'Failed to update product' };
  }
}

/**
 * Delete a product (soft delete).
 */
export async function deleteProduct(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid product ID');
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.PRODUCT.DELETE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: id }),
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to delete product');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: error.message || 'Failed to delete product' };
  }
}

/**
 * Fetch dropdown data for product forms.
 */
export async function getDropdownData() {
  try {
    const [units, categories, taxes] = await Promise.all([
      fetchWithAuth(ENDPOINTS.DROPDOWN.UNIT),
      fetchWithAuth(ENDPOINTS.DROPDOWN.CATEGORY),
      fetchWithAuth(ENDPOINTS.DROPDOWN.TAX),
    ]);

    // Check for authentication errors
    if (units?.error || categories?.error || taxes?.error) {
      const errorMsg = units?.error || categories?.error || taxes?.error || 'Authentication failed';
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data: {
        units: Array.isArray(units?.data) ? units.data : (Array.isArray(units) ? units : []),
        categories: Array.isArray(categories?.data) ? categories.data : (Array.isArray(categories) ? categories : []),
        taxes: Array.isArray(taxes?.data) ? taxes.data : (Array.isArray(taxes) ? taxes : []),
      },
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch dropdown data',
      data: {
        units: [],
        categories: [],
        taxes: []
      }
    };
  }
}

/**
 * Generate SKU for a new product.
 */
export async function generateSKU() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PRODUCT.GENERATE_SKU);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to generate SKU');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error generating SKU:', error);
    return { success: false, message: error.message || 'Failed to generate SKU' };
  }
}