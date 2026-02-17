'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  CATEGORY: {
    LIST: '/category',
    VIEW: '/category',
    ADD: '/category',
    UPDATE: '/category',
    DELETE: '/category'
  }
};


const DROPDOWN = {
  CATEGORY: '/drop_down/category',
  TAX: '/drop_down/tax',
}

const CACHE_STABLE_LIST = { next: { revalidate: 60 } };
const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };


/**
 * Get category details by ID.
 */
export async function getCategoryById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid category ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.VIEW}/${id}`, {
      cache: 'no-store'
    });

    return response.data || {};
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    throw error;
  }
}

/**
 * Get initial category data with default pagination.
 */
export async function getInitialCategoryData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.LIST}?skip=0&limit=10`, CACHE_STABLE_LIST);

    if (response.code === 200) {
      const result = {
        categories: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
      };

      return result;
    } else {
      console.error('Failed to fetch initial category data - Response code:', response.code);
      throw new Error('Failed to fetch initial category data');
    }
  } catch (error) {
    console.error('Error in getInitialCategoryData:', error);
    throw new Error(error.message || 'Failed to fetch initial category data');
  }
}

/**
 * Get filtered categories with pagination and sorting.
 */
export async function getFilteredCategories(page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.CATEGORY.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters
    if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
      url += `&category=${filters.category.map(id => encodeURIComponent(id)).join(',')}`;
    }
    if (filters.search_category) {
      url += `&search_category=${encodeURIComponent(filters.search_category)}`;
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`;
    }
    
    // Apply sorting
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        categories: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    } else {
      console.error('Failed to fetch filtered categories:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered categories');
    }
  } catch (error) {
    console.error('Error in getFilteredCategories:', error);
    throw new Error(error.message || 'Failed to fetch filtered categories');
  }
}

/**
 * Search categories by name.
 */
export async function searchCategories(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.CATEGORY.LIST + `?search_category=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.CATEGORY.LIST;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else if (response.message) {
      console.error('Error searching categories:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search categories due to an unknown error.');
      throw new Error('Failed to search categories');
    }
  } catch (error) {
    console.error('Error in searchCategories:', error);
    throw new Error(error.message || 'Failed to search categories');
  }
}

/**
 * Add a new category.
 */
export async function addCategory(categoryData, preparedImage = null) {
  try {
    let requestBody;
    let requestOptions = {
      method: 'POST',
    };

    if (preparedImage) {
      // If there's an image, use FormData
      const formData = new FormData();
      
      // Add category fields to FormData
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key]);
        }
      });

      // Convert base64 to blob and add to FormData
      const base64Data = preparedImage.base64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: preparedImage.type });
      
      formData.append('image', blob, preparedImage.name);
      
      requestOptions.body = formData;
    } else {
      // No image, send JSON
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
      requestOptions.body = JSON.stringify(categoryData);
    }

    const response = await fetchWithAuth(ENDPOINTS.CATEGORY.ADD, requestOptions);

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to add category');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, message: error.message || 'Failed to add category' };
  }
}

/**
 * Update an existing category.
 */
export async function updateCategory(id, categoryData, preparedImage = null) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid category ID');
  }

  try {
    let requestBody;
    let requestOptions = {
      method: 'PUT',
    };

    if (preparedImage) {
      // If there's an image, use FormData
      const formData = new FormData();
      
      // Add category fields to FormData
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] !== null && categoryData[key] !== undefined) {
          formData.append(key, categoryData[key]);
        }
      });

      // Convert base64 to blob and add to FormData
      const base64Data = preparedImage.base64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: preparedImage.type });
      
      formData.append('image', blob, preparedImage.name);
      
      requestOptions.body = formData;
    } else {
      // No image, send JSON
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
      requestOptions.body = JSON.stringify(categoryData);
    }

    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.UPDATE}/${id}`, requestOptions);

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update category');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, message: error.message || 'Failed to update category' };
  }
}

/**
 * Delete a category (soft delete).
 */
export async function deleteCategory(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid category ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.DELETE}/${id}`, {
      method: 'PATCH',
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to delete category');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, message: error.message || 'Failed to delete category' };
  }
}

/**
 * Fetch dropdown data for category forms.
 */
export async function getCategoryDropdownData() {
  try {
    const [categories, taxes] = await Promise.all([
      fetchWithAuth(DROPDOWN.CATEGORY, CACHE_STABLE_DROPDOWN),
      fetchWithAuth(DROPDOWN.TAX, CACHE_STABLE_DROPDOWN),
    ]);

    // Check for authentication errors
    if (categories?.error || taxes?.error) {
      const errorMsg = categories?.error || taxes?.error || 'Authentication failed';
      throw new Error(errorMsg);
    }

    return {
      success: true,
      data: {
        categories: Array.isArray(categories?.data) ? categories.data : [],
        taxes: Array.isArray(taxes?.data) ? taxes.data : [],
      },
    };
  } catch (error) {
    console.error('Error fetching category dropdown data:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch category dropdown data',
      data: {
        categories: [],
        taxes: []
      }
    };
  }
}