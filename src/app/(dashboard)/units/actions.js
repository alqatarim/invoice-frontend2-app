'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  UNIT: {
    LIST: '/units/unitList',
    VIEW: '/units/viewUnit',
    ADD: '/units',
    UPDATE: '/units',
    DELETE: '/units/delete'
  }
};


const DROPDOWN = {
  UNIT: '/drop_down/unit',
}

const CACHE_STABLE_LIST = { next: { revalidate: 60 } };
const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

/**
 * Get unit details by ID.
 */
export async function getUnitById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid unit ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.UNIT.VIEW}/${id}`, {
      cache: 'no-store'
    });

    return response.data || {};
  } catch (error) {
    console.error('Error in getUnitById:', error);
    throw error;
  }
}

/**
 * Get initial unit data with default pagination.
 */
export async function getInitialUnitData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.UNIT.LIST}?skip=0&limit=10`, CACHE_STABLE_LIST);

    if (response.code === 200) {
      const result = {
        units: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
      };

      return result;
    } else {
      console.error('Failed to fetch initial unit data - Response code:', response.code);
      throw new Error('Failed to fetch initial unit data');
    }
  } catch (error) {
    console.error('Error in getInitialUnitData:', error);
    throw new Error(error.message || 'Failed to fetch initial unit data');
  }
}

/**
 * Get filtered units with pagination and sorting.
 */
export async function getFilteredUnits(page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.UNIT.LIST + `?skip=${skip}&limit=${pageSize}`;

    // Apply filters
    if (filters.unit && Array.isArray(filters.unit) && filters.unit.length > 0) {
      url += `&unit=${filters.unit.map(id => encodeURIComponent(id)).join(',')}`;
    }
    if (filters.search_unit) {
      url += `&search_unit=${encodeURIComponent(filters.search_unit)}`;
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
        units: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    } else {
      console.error('Failed to fetch filtered units:', response.message);
      throw new Error(response.message || 'Failed to fetch filtered units');
    }
  } catch (error) {
    console.error('Error in getFilteredUnits:', error);
    throw new Error(error.message || 'Failed to fetch filtered units');
  }
}

/**
 * Search units by name.
 */
export async function searchUnits(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.UNIT.LIST + `?search_unit=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.UNIT.LIST;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.data || [];
    } else if (response.message) {
      console.error('Error searching units:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search units due to an unknown error.');
      throw new Error('Failed to search units');
    }
  } catch (error) {
    console.error('Error in searchUnits:', error);
    throw new Error(error.message || 'Failed to search units');
  }
}

/**
 * Add a new unit.
 */
export async function addUnit(unitData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.UNIT.ADD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to add unit');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding unit:', error);
    return { success: false, message: error.message || 'Failed to add unit' };
  }
}

/**
 * Update an existing unit.
 */
export async function updateUnit(id, unitData) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid unit ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.UNIT.UPDATE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
      // body: unitData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update unit');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating unit:', error);
    return { success: false, message: error.message || 'Failed to update unit' };
  }
}

/**
 * Delete a unit (soft delete).
 */
export async function deleteUnit(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid unit ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.UNIT.DELETE}/${id}`, {
      method: 'PATCH',
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to delete unit');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting unit:', error);
    return { success: false, message: error.message || 'Failed to delete unit' };
  }
}

/**
 * Fetch dropdown data for unit forms.
 */
export async function getUnitDropdownData() {
  try {
    const response = await fetchWithAuth(DROPDOWN.UNIT, CACHE_STABLE_DROPDOWN);

    // Check for authentication errors
    if (response?.error) {
      throw new Error(response.error || 'Authentication failed');
    }

    return {
      success: true,
      data: {
        units: Array.isArray(response?.data) ? response.data : [],
      },
    };
  } catch (error) {
    console.error('Error fetching unit dropdown data:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch unit dropdown data',
      data: {
        units: []
      }
    };
  }
}