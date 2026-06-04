'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  BRANCH: {
    LIST: '/branches',
    VIEW: '/branches',
    ADD: '/branches',
    UPDATE: '/branches',
    DELETE: '/branches'
  },
  PROVINCES_CITIES: '/provincesCities',
  USER_LIST: '/manage_users/listUsers',
};

const CACHE_STABLE_LIST = { next: { revalidate: 60 } };
const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

const appendBranchFilters = (url, filters = {}) => {
  const searchParams = new URLSearchParams(url.split('?')[1] || '');

  if (filters.search_branch) searchParams.set('search_branch', filters.search_branch);
  if (filters.branchType) searchParams.set('branchType', filters.branchType);
  if (filters.province) searchParams.set('province', filters.province);
  if (filters.city) searchParams.set('city', filters.city);
  if (filters.status !== undefined && filters.status !== '') searchParams.set('status', filters.status);

  return `${url.split('?')[0]}?${searchParams.toString()}`;
};

export async function getInitialBranchData(filters = {}) {
  try {
    const response = await fetchWithAuth(
      appendBranchFilters(`${ENDPOINTS.BRANCH.LIST}?skip=0&limit=10`, filters),
      CACHE_STABLE_LIST
    );

    if (response?.error) {
      throw new Error(response.error);
    }

    if (response.code === 200) {
      return {
        branches: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
        summary: response.summary || {},
      };
    }

    throw new Error(response?.message || 'Failed to fetch initial branch data');
  } catch (error) {
    console.error('Error in getInitialBranchData:', error);
    throw new Error(error.message || 'Failed to fetch initial branch data');
  }
}

export async function getBranchById(id) {
  noStore();
  const branchId = String(id || '').trim();
  if (!branchId) {
    return { success: false, message: 'Invalid branch ID' };
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.VIEW}/${branchId}`, {
      cache: 'no-store',
    });

    if (response.code === 200) {
      const data = response.data;
      const branch = data && !Array.isArray(data) ? data : null;

      if (branch && (branch._id || branch.id)) {
        return { success: true, data: branch };
      }

      return { success: false, message: 'Store not found.' };
    }

    throw new Error(response.message || 'Failed to fetch branch');
  } catch (error) {
    console.error('Error fetching branch:', error);
    return { success: false, message: error.message || 'Failed to fetch branch' };
  }
}

export async function getFilteredBranches(
  page,
  pageSize,
  filters = {},
  sortBy = '',
  sortDirection = 'asc'
) {
  try {
    const skip = (page - 1) * pageSize;
    let url = ENDPOINTS.BRANCH.LIST + `?skip=${skip}&limit=${pageSize}`;

    if (filters.search_branch) {
      url += `&search_branch=${encodeURIComponent(filters.search_branch)}`;
    }
    if (filters.branchType) {
      url += `&branchType=${encodeURIComponent(filters.branchType)}`;
    }
    if (filters.province) {
      url += `&province=${encodeURIComponent(filters.province)}`;
    }
    if (filters.city) {
      url += `&city=${encodeURIComponent(filters.city)}`;
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`;
    }
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        branches: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
        summary: response.summary || {},
      };
    }

    throw new Error(response.message || 'Failed to fetch filtered branches');
  } catch (error) {
    console.error('Error in getFilteredBranches:', error);
    throw new Error(error.message || 'Failed to fetch filtered branches');
  }
}

export async function getBranchInventory(
  page,
  pageSize,
  filters = {},
  sortBy = '',
  sortDirection = 'asc'
) {
  try {
    const skip = (page - 1) * pageSize;
    let url = `${ENDPOINTS.BRANCH.LIST}/inventory?skip=${skip}&limit=${pageSize}`;

    if (filters.search_branch) {
      url += `&search_branch=${encodeURIComponent(filters.search_branch)}`;
    }
    if (filters.search_product) {
      url += `&search_product=${encodeURIComponent(filters.search_product)}`;
    }
    if (filters.branchType) {
      url += `&branchType=${encodeURIComponent(filters.branchType)}`;
    }
    if (filters.status !== undefined && filters.status !== '') {
      url += `&status=${encodeURIComponent(filters.status)}`;
    }
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
    }

    const response = await fetchWithAuth(url);

    if (response.code === 200) {
      return {
        branches: response.data || [],
        pagination: {
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        },
      };
    }

    throw new Error(response.message || 'Failed to fetch branch inventory');
  } catch (error) {
    console.error('Error in getBranchInventory:', error);
    throw new Error(error.message || 'Failed to fetch branch inventory');
  }
}

export async function addBranch(branchData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.BRANCH.ADD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to add branch');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error adding branch:', error);
    return { success: false, message: error.message || 'Failed to add branch' };
  }
}

export async function updateBranch(id, branchData) {
  const branchId = String(id || '').trim();
  if (!branchId) {
    return { success: false, message: 'Invalid branch ID' };
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.UPDATE}/${branchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update branch');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating branch:', error);
    return { success: false, message: error.message || 'Failed to update branch' };
  }
}

export async function deleteBranch(id) {
  const branchId = String(id || '').trim();
  if (!branchId) {
    return { success: false, message: 'Invalid branch ID' };
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.DELETE}/${branchId}`, {
      method: 'PATCH',
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to delete branch');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting branch:', error);
    return { success: false, message: error.message || 'Failed to delete branch' };
  }
}

export async function getProvincesCities() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.PROVINCES_CITIES, CACHE_STABLE_DROPDOWN);

    if (response.code === 200) {
      return response.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching provinces/cities:', error);
    return [];
  }
}

export async function getBranchesForDropdown() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.LIST}?skip=0&limit=500&status=true`, CACHE_STABLE_DROPDOWN);
    if (response.code === 200) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

export async function getActiveUsersForBranchAssignment() {
  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.USER_LIST}?page=1&pageSize=500&status=Active`,
      CACHE_STABLE_DROPDOWN
    );

    if (response.code === 200) {
      return response.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching active users for branches:', error);
    return [];
  }
}
