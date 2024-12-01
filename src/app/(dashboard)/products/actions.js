'use server';

import { fetchWithAuth } from '@/utils/fetchWithAuth';

// Update the endpoints to match the old implementation
const ENDPOINTS = {
  PRODUCT: '/products/listProduct',
  CATEGORY: '/category',
  UNIT: '/units/unitList'
};

// Product list with search and filter
export const getProductList = async (page = 1, pageSize = 10, searchTerm = '', productIds = '') => {
  try {
    let url = `${ENDPOINTS.PRODUCT}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

    if (searchTerm) {
      url += `&search_product=${searchTerm}`;
    }
    if (productIds) {
      url += `&product=${productIds}`;
    }

    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error fetching product list:', error);
    return { success: false, message: error.message };
  }
};

// Category list with search and filter
export const getCategoryList = async (page = 1, pageSize = 10, searchTerm = '', categoryIds = '') => {
  try {
    let url = `${ENDPOINTS.CATEGORY}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

    if (searchTerm) {
      url += `&search_category=${searchTerm}`;
    }
    if (categoryIds) {
      url += `&category=${categoryIds}`;
    }

    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error fetching category list:', error);
    return { success: false, message: error.message };
  }
};

// Unit list with search and filter
export const getUnitList = async (page = 1, pageSize = 10, searchTerm = '', unitIds = '') => {
  try {
    let url = `${ENDPOINTS.UNIT}?limit=${pageSize}&skip=${(page - 1) * pageSize}`;

    if (searchTerm) {
      url += `&search_unit=${searchTerm}`;
    }
    if (unitIds) {
      url += `&unit=${unitIds}`;
    }

    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error fetching unit list:', error);
    return { success: false, message: error.message };
  }
};

// Search functions for filters
export const searchProducts = async (searchTerm) => {
  try {
    const url = `${ENDPOINTS.PRODUCT}?search_product=${searchTerm}`;
    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return { success: false, message: error.message };
  }
};

export const searchCategories = async (searchTerm) => {
  try {
    const url = `${ENDPOINTS.CATEGORY}?search_category=${searchTerm}`;
    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error searching categories:', error);
    return { success: false, message: error.message };
  }
};

export const searchUnits = async (searchTerm) => {
  try {
    const url = `${ENDPOINTS.UNIT}?search_unit=${searchTerm}`;
    const response = await fetchWithAuth(url);
    return {
      success: response.code === 200,
      data: response.data || [],
      totalRecords: response.totalRecords
    };
  } catch (error) {
    console.error('Error searching units:', error);
    return { success: false, message: error.message };
  }
};

// Reset the product list
export const resetProductList = async (page = 1, pageSize = 10) => {
  const response = await fetchWithAuth(`/products/listProduct?limit=${pageSize}&skip=${(page - 1) * pageSize}`);

  if (response.error) {
    return { success: false, message: response.error }; // Propagate the error
  }

  return { success: true, data: response.data };
};


// Fetch product details by ID
export const getProductDetails = async (productId) => {
  const response = await fetchWithAuth(`/products/viewProduct/${productId}`);

  if (response.error) {
    return { success: false, message: response.error }; // Propagate the error
  }

  return { success: true, data: response.data };
};

// Add a new product
export const addProduct = async (productData, preparedImage) => {
  try {
    const formData = new FormData();

    // Add all product data to formData
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });

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
    }

    const response = await fetchWithAuth('/products/addProduct', {
      method: 'POST',
      body: formData,
    });

    if (response.error) {
      return { success: false, message: response.error }; // Propagate the error
    }

    if (response.code === 200) {
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.message || 'Failed to add product' };
    }
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, message: error.message || 'Failed to add product' };
  }
};



// Update an existing product
export const updateProduct = async (productData, preparedImage) => {
  try {
    const formData = new FormData();

    // Append all product data
    for (const key in productData) {
      // Handle nested objects (like category, units, tax)
      if (typeof productData[key] === 'object' && productData[key] !== null) {
        formData.append(key, productData[key]._id || JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }

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
    }

    const response = await fetchWithAuth(`/products/updateProduct/${productData._id}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, message: error.message || 'Failed to update product' };
  }
};


// Fetch dropdown data
export const getDropdownData = async () => {
  try {
    const [units, categories, taxes] = await Promise.all([
      fetchWithAuth('/drop_down/unit'),
      fetchWithAuth('/drop_down/category'),
      fetchWithAuth('/drop_down/tax'),
    ]);

    if (units.error || categories.error || taxes.error) {
      return { success: false, message: 'No authentication session found' }; // Propagate the error
    }

    return {
      success: true,
      data: {
        units: units.data,
        categories: categories.data,
        taxes: taxes.data,
      },
    };
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return { success: false, message: error.message || 'Failed to fetch dropdown data' };
  }
};


// Generate SKU
export const generateSKU = async () => {
  try {
    const response = await fetchWithAuth('/products/generateSKU');

    //this will run if no session is found
    if (response.error) {
      console.log('server error if caught', response)
      return { success: false, message: response.error }; // Propagate the error
    }
console.log('server success if caught', response)
    return { success: true, data: response.data };
  } catch (error) {
    console.log('server error catch caught', error)
    console.error('Error generating SKU:', error.message)
    return { success: false, message: error.message || 'Failed to generate SKU' };
  }
};

// Delete a product by ID
export const deleteProduct = async (productId) => {
  try {
    const response = await fetchWithAuth(`/products/deleteProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: productId }),
    });

    if (response.error) {
      return { success: false, message: response.error }; // Propagate the error
    }

    if (response.code === 200) {
      return { success: true, data: response.data || {} };
    } else {
      return { success: false, message: response.message || 'Failed to delete product' };
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: error.message };
  }
};









// Edit category


// Delete a category by ID
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetchWithAuth(`/category/${categoryId}`, {
      method: 'PATCH',
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, message: error.message };
  }
};

// Add these unit-related actions to your existing actions.js

export const deleteUnit = async (unitId) => {
  try {
    const response = await fetchWithAuth(`/units/delete/${unitId}`, {
      method: 'PATCH',
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting unit:', error);
    return { success: false, message: error.message };
  }
};

export const addUnit = async (unitData) => {
  try {
    const response = await fetchWithAuth('/units', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding unit:', error);
    return { success: false, message: error.message };
  }
};

export const getUnitDetails = async (unitId) => {
  try {
    const response = await fetchWithAuth(`/units/viewUnit/${unitId}`);

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching unit details:', error);
    return { success: false, message: error.message };
  }
};

export const updateUnit = async (unitId, unitData) => {
  try {
    const response = await fetchWithAuth(`/units/${unitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating unit:', error);
    return { success: false, message: error.message };
  }
};

// Add these category-related actions

export const getCategoryDetails = async (categoryId) => {
  try {
    const response = await fetchWithAuth(`/category/${categoryId}`);

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching category details:', error);
    return { success: false, message: error.message };
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetchWithAuth(`/category/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, message: error.message };
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await fetchWithAuth('/category', {
      method: 'POST',
      body: categoryData, // FormData will be sent directly
    });

    if (response.error) {
      return { success: false, message: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, message: error.message };
  }
};
