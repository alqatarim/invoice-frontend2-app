'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const RECORDS_ENDPOINT = '/warranties';
const DROPDOWN_ENDPOINTS = {
  products: '/drop_down/product',
  policies: '/policies?skip=0&limit=100&status=active',
  customers: '/customers/getCustomersMinimal',
};

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

export async function getWarranties(options = {}) {
  try {
    const response = await fetchWithAuth(`${RECORDS_ENDPOINT}?${buildListQuery(options)}`, {
      cache: 'no-store',
    });

    return normalizeListResponse(response, 'Failed to fetch warranties');
  } catch (error) {
    console.error('Error fetching warranties:', error);
    return { success: false, data: [], totalRecords: 0, summary: {}, message: error.message };
  }
}

export async function getWarrantyCreationOptions() {
  try {
    const [productsResponse, policiesResponse, customersResponse] = await Promise.all([
      fetchWithAuth(DROPDOWN_ENDPOINTS.products, { cache: 'no-store' }),
      fetchWithAuth(DROPDOWN_ENDPOINTS.policies, { cache: 'no-store' }),
      fetchWithAuth(DROPDOWN_ENDPOINTS.customers, { cache: 'no-store' }),
    ]);

    if (productsResponse?.code !== 200) {
      throw new Error(productsResponse?.message || 'Failed to fetch products');
    }

    if (policiesResponse?.code !== 200) {
      throw new Error(policiesResponse?.message || 'Failed to fetch warranty policies');
    }

    if (customersResponse?.code !== 200) {
      throw new Error(customersResponse?.message || 'Failed to fetch customers');
    }

    return {
      success: true,
      data: {
        products: productsResponse.data || [],
        policies: policiesResponse.data || [],
        customers: customersResponse.data?.customers || [],
      },
    };
  } catch (error) {
    console.error('Error fetching warranty creation options:', error);
    return {
      success: false,
      data: {
        products: [],
        policies: [],
        customers: [],
      },
      message: error.message,
    };
  }
}

export async function getWarrantyById(id) {
  if (!id) throw new Error('Warranty ID is required');

  const response = await fetchWithAuth(`${RECORDS_ENDPOINT}/${id}`, {
    cache: 'no-store',
  });

  if (response?.code !== 200) {
    throw new Error(response?.message || 'Failed to fetch warranty');
  }

  return response.data || {};
}

export async function createWarranty(payload) {
  try {
    const response = await fetchWithAuth(
      RECORDS_ENDPOINT,
      jsonRequest('POST', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to create warranty');
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateWarranty(id, payload) {
  try {
    const response = await fetchWithAuth(
      `${RECORDS_ENDPOINT}/${id}`,
      jsonRequest('PUT', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to update warranty');
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function voidWarranty(id, payload) {
  try {
    const response = await fetchWithAuth(
      `${RECORDS_ENDPOINT}/${id}/void`,
      jsonRequest('POST', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to void warranty');
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function extendWarranty(id, payload) {
  try {
    const response = await fetchWithAuth(
      `${RECORDS_ENDPOINT}/${id}/extend`,
      jsonRequest('POST', parseFormPayload(payload))
    );

    return normalizeMutationResponse(response, 'Failed to extend warranty');
  } catch (error) {
    return { success: false, message: error.message };
  }
}
