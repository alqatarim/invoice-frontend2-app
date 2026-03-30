'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { processSignatureImage } from '@/utils/fileUtils';

const ENDPOINTS = {
  invoice: {
    add: '/invoice',
    customers: '/drop_down/customer',
    nextNumber: '/invoice/getInvoiceNumber',
  },
  dropdown: {
    product: '/drop_down/product',
    tax: '/drop_down/tax',
    signature: '/drop_down/signature',
  },
  bank: {
    list: '/bankSettings/listBanks',
    add: '/bankSettings/addBank',
  },
  branch: {
    list: '/branches',
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

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.invoice.customers, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch customers');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice customers:', error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.dropdown.product, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch products');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice products:', error);
    throw error;
  }
}

export async function getTaxRates() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.dropdown.tax, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch tax rates');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice tax rates:', error);
    throw error;
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.bank.list, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch banks');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice banks:', error);
    throw error;
  }
}

export async function getManualSignatures() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.dropdown.signature, CACHE_STABLE_DROPDOWN);

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch manual signatures');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice signatures:', error);
    throw error;
  }
}

export async function getNextInvoiceNumber() {
  try {
    const response = await fetchWithAuth(ENDPOINTS.invoice.nextNumber, {
      cache: 'no-store',
    });

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch next invoice number');
    }

    return response?.data || '';
  } catch (error) {
    console.error('Error fetching next invoice number:', error);
    throw error;
  }
}

export async function getBranchesForDropdown() {
  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.branch.list}?skip=0&limit=500&status=true`,
      CACHE_STABLE_DROPDOWN
    );

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to fetch branches');
    }

    return response?.data || [];
  } catch (error) {
    console.error('Error fetching invoice branches:', error);
    throw error;
  }
}

export async function addBank(bankData) {
  try {
    const response = await fetchWithAuth(ENDPOINTS.bank.add, {
      method: 'POST',
      body: JSON.stringify(bankData),
    });

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to add bank');
    }

    return response?.data || {};
  } catch (error) {
    console.error('Error adding invoice bank:', error);
    throw error;
  }
}

export async function addInvoice(invoiceData) {
  const formData = new FormData();
  const items = Array.isArray(invoiceData?.items) ? invoiceData.items : [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] || {};
    const taxInfoValue =
      typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo || {});

    formData.append(`items[${index}][name]`, item.name);
    formData.append(`items[${index}][key]`, index);
    formData.append(`items[${index}][productId]`, item.productId);
    formData.append(`items[${index}][quantity]`, item.quantity);
    formData.append(`items[${index}][units]`, item.units);
    formData.append(`items[${index}][unit]`, item.unit);
    formData.append(`items[${index}][rate]`, item.rate);
    formData.append(`items[${index}][discount]`, item.discount);
    formData.append(`items[${index}][tax]`, item.tax);
    formData.append(`items[${index}][taxInfo]`, taxInfoValue);
    formData.append(`items[${index}][amount]`, item.amount);
    formData.append(`items[${index}][discountType]`, item.discountType);
    formData.append(`items[${index}][isRateFormUpadted]`, item.isRateFormUpadted);
    formData.append(`items[${index}][form_updated_discounttype]`, item.form_updated_discounttype);
    formData.append(`items[${index}][form_updated_discount]`, item.form_updated_discount);
    formData.append(`items[${index}][form_updated_rate]`, item.form_updated_rate);
    formData.append(`items[${index}][form_updated_tax]`, item.form_updated_tax);
    formData.append(
      `items[${index}][promotionAutoApplied]`,
      item.promotionAutoApplied ? 'true' : 'false'
    );

    if (item.promotionSummary) {
      formData.append(`items[${index}][promotionSummary]`, item.promotionSummary);
    }

    if (item.promotionMeta) {
      formData.append(`items[${index}][promotionMeta]`, JSON.stringify(item.promotionMeta));
    }

    if (item.scaleBarcodeSummary) {
      formData.append(`items[${index}][scaleBarcodeSummary]`, item.scaleBarcodeSummary);
    }

    if (item.scaleBarcodeMeta) {
      formData.append(`items[${index}][scaleBarcodeMeta]`, JSON.stringify(item.scaleBarcodeMeta));
    }
  }

  formData.append('invoiceNumber', invoiceData?.invoiceNumber || '');
  formData.append('customerId', invoiceData?.customerId || '');
  formData.append(
    'payment_method',
    normalizePaymentMethodValue(invoiceData?.payment_method)
  );
  formData.append('branchId', invoiceData?.branchId || '');
  formData.append('dueDate', invoiceData?.dueDate || '');
  formData.append('invoiceDate', invoiceData?.invoiceDate || '');
  formData.append('referenceNo', invoiceData?.referenceNo || '');
  formData.append('taxableAmount', invoiceData?.taxableAmount || 0);
  formData.append('TotalAmount', invoiceData?.TotalAmount || 0);
  formData.append('vat', invoiceData?.vat || 0);
  formData.append('totalDiscount', invoiceData?.totalDiscount || 0);
  formData.append('roundOff', invoiceData?.roundOff || false);
  formData.append('bank', invoiceData?.bank || '');
  formData.append('notes', invoiceData?.notes || '');
  formData.append('termsAndCondition', invoiceData?.termsAndCondition || '');
  formData.append('sign_type', invoiceData?.sign_type || 'manualSignature');
  formData.append('isRecurring', false);
  formData.append('recurringCycle', '0');

  if (invoiceData?.sign_type === 'eSignature') {
    formData.append('signatureName', invoiceData?.signatureName || '');

    if (invoiceData?.signatureImage) {
      try {
        const signatureFile = await processSignatureImage(invoiceData.signatureImage);

        if (signatureFile) {
          formData.append('signatureImage', signatureFile);
        }
      } catch (error) {
        console.error('Error processing invoice signature:', error);
        throw new Error(`Failed to process signature: ${error.message}`);
      }
    }
  } else {
    formData.append('signatureId', invoiceData?.signatureId || '');
  }

  try {
    const response = await fetchWithAuth(ENDPOINTS.invoice.add, {
      method: 'POST',
      body: formData,
    });

    if (response?.code !== 200) {
      throw new Error(response?.message || 'Failed to add invoice');
    }

    return { success: true, data: response?.data };
  } catch (error) {
    console.error('Error adding invoice:', error);
    return { success: false, message: error.message || 'Failed to add invoice' };
  }
}
