'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';
import { processSignatureImage } from '@/utils/fileUtils';

const ENDPOINTS = {
  invoice: {
    view: '/invoice',
    update: '/invoice/updateInvoice',
    customers: '/drop_down/customer',
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

export async function getInvoiceById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.invoice.view}/${id}`, {
      cache: 'no-store',
    });

    return response?.data?.invoice_details || {};
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    throw error;
  }
}

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

export async function updateInvoice(id, updatedFormData) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid invoice ID');
  }

  const formData = new FormData();
  const dataSource = updatedFormData.items || [];

  for (let i = 0; i < dataSource.length; i++) {
    formData.append(`items[${i}][name]`, dataSource[i]?.name);
    formData.append(`items[${i}][key]`, i);
    formData.append(`items[${i}][productId]`, dataSource[i]?.productId);
    formData.append(`items[${i}][quantity]`, dataSource[i]?.quantity);
    formData.append(`items[${i}][units]`, dataSource[i]?.units);
    formData.append(`items[${i}][unit]`, dataSource[i]?.unit);
    formData.append(`items[${i}][rate]`, dataSource[i]?.rate);
    formData.append(`items[${i}][discount]`, dataSource[i]?.discount);
    formData.append(`items[${i}][tax]`, dataSource[i]?.tax);
    let taxIfoFormdata = dataSource[i].taxInfo;
    if (typeof dataSource[i].taxInfo !== 'string') {
      taxIfoFormdata = JSON.stringify(dataSource[i].taxInfo);
    }
    formData.append(`items[${i}][taxInfo]`, taxIfoFormdata);
    formData.append(`items[${i}][amount]`, dataSource[i]?.amount);
    formData.append(`items[${i}][discountType]`, dataSource[i]?.discountType);
    formData.append(`items[${i}][isRateFormUpadted]`, dataSource[i]?.isRateFormUpadted);
    formData.append(`items[${i}][form_updated_discounttype]`, dataSource[i]?.form_updated_discounttype);
    formData.append(`items[${i}][form_updated_discount]`, dataSource[i]?.form_updated_discount);
    formData.append(`items[${i}][form_updated_rate]`, dataSource[i]?.form_updated_rate);
    formData.append(`items[${i}][form_updated_tax]`, dataSource[i]?.form_updated_tax);
    formData.append(`items[${i}][promotionAutoApplied]`, dataSource[i]?.promotionAutoApplied ? 'true' : 'false');
    if (dataSource[i]?.promotionSummary) {
      formData.append(`items[${i}][promotionSummary]`, dataSource[i].promotionSummary);
    }
    if (dataSource[i]?.promotionMeta) {
      formData.append(`items[${i}][promotionMeta]`, JSON.stringify(dataSource[i].promotionMeta));
    }
    if (dataSource[i]?.scaleBarcodeSummary) {
      formData.append(`items[${i}][scaleBarcodeSummary]`, dataSource[i].scaleBarcodeSummary);
    }
    if (dataSource[i]?.scaleBarcodeMeta) {
      formData.append(`items[${i}][scaleBarcodeMeta]`, JSON.stringify(dataSource[i].scaleBarcodeMeta));
    }
  }

  formData.append('invoiceNumber', updatedFormData.invoiceNumber);
  formData.append('customerId', updatedFormData.customerId);
  formData.append('payment_method', normalizePaymentMethodValue(updatedFormData.payment_method));
  formData.append('branchId', updatedFormData.branchId || '');
  formData.append('dueDate', updatedFormData?.dueDate);
  formData.append('invoiceDate', updatedFormData?.invoiceDate);
  formData.append('referenceNo', updatedFormData.referenceNo);
  formData.append('taxableAmount', updatedFormData.taxableAmount);
  formData.append('TotalAmount', updatedFormData.TotalAmount);
  formData.append('vat', updatedFormData.vat);
  formData.append('totalDiscount', updatedFormData.totalDiscount);
  formData.append('roundOff', updatedFormData.roundOff);
  formData.append('bank', updatedFormData.bank);
  formData.append('notes', updatedFormData.notes);
  formData.append('termsAndCondition', updatedFormData.termsAndCondition);
  formData.append('sign_type', updatedFormData.sign_type);

  if (updatedFormData.sign_type === 'eSignature') {
    formData.append('signatureName', updatedFormData.signatureName || '');

    if (updatedFormData.signatureImage) {
      try {
        const signatureFile = await processSignatureImage(updatedFormData.signatureImage);
        if (signatureFile) {
          formData.append('signatureImage', signatureFile);
        }
      } catch (error) {
        console.error('Error processing signature:', error);
        throw new Error(`Failed to process signature: ${error.message}`);
      }
    }
  } else if (updatedFormData.sign_type === 'manualSignature') {
    if (updatedFormData.signatureId) {
      formData.append('signatureId', updatedFormData.signatureId);
    }
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.invoice.update}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (response.code !== 200) {
      throw new Error(response.message || 'Failed to update invoice');
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, message: error.message || 'Failed to update invoice' };
  }
}
