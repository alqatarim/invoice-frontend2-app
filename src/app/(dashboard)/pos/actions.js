'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  POS: {
    BOOTSTRAP: '/pos/bootstrap',
    CHECKOUT: '/pos/checkout',
  },
  DROPDOWN: {
    CUSTOMER: '/drop_down/customer',
    PRODUCT: '/drop_down/product',
    TAX: '/drop_down/tax',
    SIGNATURE: '/drop_down/signature',
  },
  BANK: {
    LIST: '/bankSettings/listBanks',
  },
};

const CACHE_STABLE_DROPDOWN = { next: { revalidate: 300 } };

const normalizePaymentMethodValue = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'cash' || normalized === 'cash value') return 'Cash';
  if (normalized === 'card' || normalized === 'credit card' || normalized === 'debit card') return 'Card';
  if (normalized === 'bank' || normalized === 'bank transfer') return 'Bank';
  if (normalized === 'online') return 'Online';
  if (normalized === 'cheque' || normalized === 'check') return 'Cheque';

  return value || 'Cash';
};

const getResponseMessage = (response, fallbackMessage) => {
  if (!response) return fallbackMessage;

  if (Array.isArray(response?.message)) {
    return response.message.join(', ');
  }

  if (Array.isArray(response?.data?.message)) {
    return response.data.message.join(', ');
  }

  return response?.data?.message || response?.message || fallbackMessage;
};

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.CUSTOMER, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch POS customers');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching POS customers:', error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.PRODUCT, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch POS products');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching POS products:', error);
    throw error;
  }
}

export async function getTaxRates() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.TAX, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch POS tax rates');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching POS tax rates:', error);
    throw error;
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.BANK.LIST, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch POS banks');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching POS banks:', error);
    throw error;
  }
}

export async function getManualSignatures() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.DROPDOWN.SIGNATURE, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch POS signatures');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching POS signatures:', error);
    throw error;
  }
}

export async function getPosBootstrap() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.POS.BOOTSTRAP, {
      cache: 'no-store',
    });

    if (response.code !== 200) {
      throw new Error(getResponseMessage(response, 'Failed to load POS bootstrap data'));
    }

    return response.data || {
      branches: [],
      settings: {},
      invoiceNumber: '',
      paymentMethods: [],
    };
  } catch (error) {
    console.error('Error loading POS bootstrap:', error);
    throw new Error(error.message || 'Failed to load POS bootstrap data');
  }
}

export async function checkoutPosSale(payload) {
  try {
    const normalizedPayload = {
      ...payload,
      payment_method: normalizePaymentMethodValue(payload?.payment_method),
    };

    const response = await fetchWithAuth(ENDPOINTS.POS.CHECKOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedPayload),
    });

    if (response.code !== 200) {
      throw new Error(getResponseMessage(response, 'Failed to complete POS checkout'));
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error completing POS checkout:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete POS checkout',
    };
  }
}
