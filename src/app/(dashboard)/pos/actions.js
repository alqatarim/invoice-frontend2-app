'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  POS: {
    BOOTSTRAP: '/pos/bootstrap',
    CHECKOUT: '/pos/checkout',
  },
};

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
