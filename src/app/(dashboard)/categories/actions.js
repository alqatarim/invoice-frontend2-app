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

/**
 * Get category details by ID.
 */
export async function getCategoryById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid category ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.VIEW}/${id}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
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
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.LIST}?skip=0&limit=10`);

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
export async function addCategory(categoryData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.CATEGORY.ADD, {
      method: 'POST',
      body: categoryData, // FormData will be sent directly
    });

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
export async function updateCategory(id, categoryData) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid category ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.CATEGORY.UPDATE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

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
