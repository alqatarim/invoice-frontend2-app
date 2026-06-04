'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  invoiceView: '/invoice',
  companyProfileView: '/company',
  invoiceSettingsView: '/invoiceSettings/viewInvoiceSetting',
};

export async function getInvoiceById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.invoiceView}/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });

    return response?.data?.invoice_details || null;
  } catch (error) {
    console.error('Error fetching invoice by id:', error);
    return null;
  }
}

export async function getCompanyProfile(companyId) {
  if (!companyId) {
    return null;
  }

  try {
    const query = `?companyId=${encodeURIComponent(companyId)}`;
    const response = await fetchWithAuth(`${ENDPOINTS.companyProfileView}${query}`, {
      method: 'GET',
      cache: 'no-store',
    });

    return response?.data || null;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return null;
  }
}

export async function getInvoiceSettings() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.invoiceSettingsView, {
      method: 'GET',
      cache: 'no-store',
    });

    return response?.data || null;
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    return null;
  }
}
