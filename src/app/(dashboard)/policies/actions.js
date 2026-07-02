'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const POLICIES_ENDPOINT = '/policies';

const jsonRequest = (method, payload = {}) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
  cache: 'no-store',
});

const parseFormPayload = payload => {
  if (payload instanceof FormData) {
    return Object.fromEntries(payload.entries());
  }

  return payload || {};
};

const buildListQuery = ({ page = 1, pageSize = 10, search = '', filters = {} } = {}) => {
  const params = new URLSearchParams();
  params.set('skip', String(Math.max(page - 1, 0) * pageSize));
  params.set('limit', String(pageSize));

  if (search) params.set('search', search);
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

const normalizeListResponse = (response, fallbackMessage) => {
  if (response?.code !== 200) {
    throw new Error(response?.message || fallbackMessage);
  }

  return {
    success: true,
    data: response.data || [],
    totalRecords: response.totalRecords || 0,
    summary: response.summary || {},
  };
};

const normalizeMutationResponse = (response, fallbackMessage) => {
  if (response?.code !== 200) {
    const message = response?.data?.message || response?.message || fallbackMessage;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return {
    success: true,
    data: response.data || {},
    message: response.data?.message || response.message || 'Saved successfully',
  };
};

export async function getWarrantyPolicies(options = {}) {
  try {
    const response = await fetchWithAuth(`${POLICIES_ENDPOINT}?${buildListQuery(options)}`, {
      cache: 'no-store',
    });

    return normalizeListResponse(response, 'Failed to fetch warranty policies');
  } catch (error) {
    console.error('Error fetching warranty policies:', error);
    return { success: false, data: [], totalRecords: 0, summary: {}, message: error.message };
  }
}

export async function getWarrantyPolicyById(id) {
  if (!id) throw new Error('Warranty policy ID is required');

  const response = await fetchWithAuth(`${POLICIES_ENDPOINT}/${id}`, {
    cache: 'no-store',
  });

  if (response?.code !== 200) {
    throw new Error(response?.message || 'Failed to fetch warranty policy');
  }

  return response.data || {};
}

export async function addWarrantyPolicy(payload) {
  try {
    const response = await fetchWithAuth(
      POLICIES_ENDPOINT,
      jsonRequest('POST', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to create warranty policy');
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateWarrantyPolicy(id, payload) {
  try {
    const response = await fetchWithAuth(
      `${POLICIES_ENDPOINT}/${id}`,
      jsonRequest('PUT', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to update warranty policy');
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteWarrantyPolicy(id) {
  try {
    const response = await fetchWithAuth(
      `${POLICIES_ENDPOINT}/delete`,
      jsonRequest('POST', { _id: id })
    );

    return normalizeMutationResponse(response, 'Failed to delete warranty policy');
  } catch (error) {
    return { success: false, message: error.message };
  }
}
