'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  BRANCH: {
    LIST: '/branches',
    VIEW: '/branches',
    ADD: '/branches',
    UPDATE: '/branches',
    DELETE: '/branches'
  },
  PROVINCES_CITIES: '/provincesCities'
};

export async function getInitialBranchData() {
  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.LIST}?skip=0&limit=10`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (response.code === 200) {
      return {
        branches: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0,
        },
      };
    }

    throw new Error('Failed to fetch initial branch data');
  } catch (error) {
    console.error('Error in getInitialBranchData:', error);
    throw new Error(error.message || 'Failed to fetch initial branch data');
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
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid branch ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.UPDATE}/${id}`, {
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
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid branch ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.DELETE}/${id}`, {
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
    const response = await fetchWithAuth(ENDPOINTS.PROVINCES_CITIES, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

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
    const response = await fetchWithAuth(`${ENDPOINTS.BRANCH.LIST}?skip=0&limit=500&status=true`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (response.code === 200) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}
