'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  invoiceView: '/invoice',
  companySettingsView: '/companySettings/viewCompanySetting',
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

export async function getCompanySettings(companyId) {
  if (!companyId) {
    return null;
  }

  try {
    const query = `?companyId=${encodeURIComponent(companyId)}`;
    const response = await fetchWithAuth(`${ENDPOINTS.companySettingsView}${query}`, {
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
