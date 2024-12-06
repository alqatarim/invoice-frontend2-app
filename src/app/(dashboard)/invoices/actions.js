'use server';


import moment from 'moment';
 import { fetchWithAuth } from '@/utils/fetchWithAuth';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import { dataURLtoBlob } from '@/utils/helpers';



/*
 * Get invoice details by ID.
 *
 * @param {string} id - Invoice ID.
 * @returns {Promise<Object>} - Invoice data.
 * @throws {Error} - Throws error with detailed message.
 */
export async function getInvoiceById(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`/invoice/${id}`);

    // Assuming a successful response contains a 'data' property
    return response.data?.invoice_details || {};
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    throw error; // Propagate the error to be handled by the caller
  }
}



/**
 * Add a payment to an invoice.
 *
 * @param {Object} paymentData - The payment details.
 * @param {string} paymentData.invoiceId - The ID of the invoice.
 * @param {number} paymentData.amount - The payment amount.
 * @param {string} paymentData.paymentMethod - The method of payment.
 * @param {string} [paymentData.notes] - Optional notes for the payment.
 * @returns {Promise<Object>} - The response from the backend.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function addPayment(paymentData) {
  const { invoiceId, amount, paymentMethod, notes, received_on } = paymentData;

  if (!invoiceId || typeof invoiceId !== 'string') {
    console.error('Invalid invoice ID for adding payment:', invoiceId);
    throw new Error(error.message || 'Invalid invoice ID');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    console.error('Invalid payment amount:', amount);
    throw new Error(error.message || 'Invalid payment amount');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    console.error('Invalid payment method:', paymentMethod);
    throw new Error(error.message || 'Invalid payment method');
  }

  const payload = {
    invoiceId,
    amount,
    payment_method: paymentMethod,
    notes: notes || '',
    received_on: received_on ? moment(received_on).format('DD/MM/YYYY') : null,
  };

  try {
    const response = await fetchWithAuth('/payment/addPayment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.code === 200) {
      return response;
    } else {
      console.error('Failed to add payment:', error);
      throw new Error(error.message || 'Failed to add payment');
    }
  } catch (error) {
    console.error('Error in addPayment:', error);
    throw new Error(error.message || 'Failed to add payment');
  }
}

/**
 * Get initial invoice data with default pagination and sorting.
 *
 * @returns {Promise<Object>} - The initial invoice data including invoices, pagination, and cardCounts.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function getInitialInvoiceData() {
  try {
    const [invoiceResponse, cardCountsResponse] = await Promise.all([
      fetchWithAuth('/invoice?limit=10&skip=0&sortBy=&sortDirection=asc'),
      fetchWithAuth('/invoice/invoiceCard')
    ]);

    if (invoiceResponse.code === 200 && cardCountsResponse.code === 200) {
      return {
        invoices: invoiceResponse.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: invoiceResponse.totalRecords || 0,
        },
        cardCounts: cardCountsResponse.data || {}
      };
    } else {
      console.error('Failed to fetch initial invoice data or card counts');
      throw new Error('Failed to fetch initial invoice data or card counts');
    }
  } catch (error) {
    console.error('Error in getInitialInvoiceData:', error.message);
    throw new Error(error.message || 'Failed to fetch initial invoice data');
  }
}

/**
 * Get filtered and sorted invoices based on parameters.
 *
 * @param {string} tab - The current tab/status filter (e.g., 'ALL', 'PAID').
 * @param {number} page - The current page number.
 * @param {number} pageSize - The number of invoices per page.
 * @param {Object} filters - Additional filters (e.g., customer, invoiceNumber, date range).
 * @param {string} [sortBy=''] - The field to sort by.
 * @param {string} [sortDirection='asc'] - The direction to sort ('asc' or 'desc').
 * @returns {Promise<Object>} - The filtered invoices and updated pagination.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function getFilteredInvoices(tab, page, pageSize, filters = {}, sortBy = '', sortDirection = 'asc') {
  const skip = (page - 1) * pageSize;
  let url = `/invoice?limit=${pageSize}&skip=${skip}`;

  // Only apply status filter if tab is not 'ALL'
  if (tab !== 'ALL') {
    url += `&status=${encodeURIComponent(tab)}`;
  }

  // Apply additional filters
  if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
      url += `&customer=${filters.customer.map(id => encodeURIComponent(id)).join(',')}`;
  }
  if (filters.invoiceNumber && Array.isArray(filters.invoiceNumber) && filters.invoiceNumber.length > 0) {
      url += `&invoiceNumber=${filters.invoiceNumber.map(num => encodeURIComponent(num)).join(',')}`;
  }
  if (filters.fromDate) {
      url += `&fromDate=${encodeURIComponent(filters.fromDate)}`;
  }
  if (filters.toDate) {
      url += `&toDate=${encodeURIComponent(filters.toDate)}`;
  }
  if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      url += `&status=${filters.status.map(status => encodeURIComponent(status)).join(',')}`;
  }

  // Apply sorting
  if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
  }

  try {
      const response = await fetchWithAuth(url);
      if (response.code === 200) {
          return {
              invoices: response.data || [],
              pagination: {
                  current: page,
                  pageSize,
                  total: response.totalRecords || 0,
              },
          };
      } else {
          console.error('Failed to fetch filtered invoices:', error);
          throw new Error(error.message || 'Failed to fetch filtered invoices');
      }
  } catch (error) {
    console.error('Error in getFilteredInvoices:', error);
    throw new Error(error.message || 'Failed to fetch filtered invoices');
  }
}

/**
* Clone an invoice by ID.
*
* @param {string} id - The ID of the invoice to clone.
* @returns {Promise<Object>} - The cloned invoice data.
*/
export async function cloneInvoice(id) {
  if (!id || typeof id !== 'string') {
      console.error('Invalid invoice ID for cloning:', id);
      throw new Error('Invalid invoice ID');
  }

  try {
      const response = await fetchWithAuth(`/invoice/${id}/clone`, { method: 'POST' });
      if (response.code === 200) {
          return response.invoice || response.data; // Adjust based on backend response
      } else {
          console.error('Failed to clone invoice:', error);
          throw new Error(error || 'Failed to clone invoice');
      }
  } catch (error) {
    console.error('Error in cloneInvoice:', error);
    throw new Error(error.message || 'Failed to clone invoice');
  }
}

/**
 * Send an invoice by ID.
 *
 * @param {string} id - The ID of the invoice to send.
 * @returns {Promise<Object>} - The response from sending the invoice.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function sendInvoice(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for sending:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`/invoice/pdfCreate?invoiceId=${encodeURIComponent(id)}`);
    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error sending invoice:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to send invoice due to an unknown error.');
      throw new Error('Failed to send invoice');
    }
  } catch (error) {
    console.error('Error in sendInvoice:', error);
    throw new Error(error.message || 'Failed to send invoice');
  }
}

/**
 * Convert an invoice to a sales return.
 *
 * @param {string} id - The ID of the invoice to convert.
 * @param {string} type - The current tab/status.
 * @returns {Promise<Object>} - The response from the conversion.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function convertTosalesReturn(id, type) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for conversion:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`/invoice/${id}/convertsalesreturn`, { method: 'POST' });
    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error converting invoice to sales return:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to convert invoice to sales return due to an unknown error.');
      throw new Error('Failed to convert invoice to sales return');
    }
  } catch (error) {
    console.error('Error in convertTosalesReturn:', error);
    throw new Error(error.message || 'Failed to convert invoice to sales return');
  }
}

/**
 * Search customers by name.
 *
 * @param {string} searchTerm - The term to search for customers.
 * @returns {Promise<Object>} - The search results.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function searchCustomers(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.error('Invalid search term for customers:', searchTerm);
    throw new Error('Invalid search term');
  }

  const url = `/customer?search_customer=${encodeURIComponent(searchTerm)}`;
  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.customers || [];
    } else if (response.message) {
      console.error('Error searching customers:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search customers due to an unknown error.');
      throw new Error('Failed to search customers');
    }
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw new Error(error.message || 'Failed in search Customers');
  }
}

/**
 * Search invoices by invoice number.
 *
 * @param {string} searchTerm - The term to search for invoices.
 * @returns {Promise<Object>} - The search results.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function searchInvoices(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.error('Invalid search term for invoices:', searchTerm);
    throw new Error('Invalid search term');
  }

  const url = `/invoice?search_invoiceNumber=${encodeURIComponent(searchTerm)}`;
  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.invoiceList || [];
    } else if (response.message) {
      console.error('Error searching invoices:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to search invoices due to an unknown error.');
      throw new Error('Failed to search invoices');
    }
  } catch (error) {
    console.error('Error in searchInvoices:', error);
    throw new Error(error.message || 'Failed in search Invoices');
  }
}

/**
 * Send a payment link to the customer.
 *
 * @param {string} id - The ID of the invoice.
 * @returns {Promise<Object>} - The response from the backend.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function sendPaymentLink(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for sending payment link:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`/unauthorized/sentPaymentLinks?invoiceId=${encodeURIComponent(id)}`);

    if (response.code === 200) {
      return response;
    } else if (response.message) {
      console.error('Error sending payment link:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to send payment link due to an unknown error.');
      throw new Error('Failed to send payment link');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Fetch error:', error.message);
      throw error; // Propagate the original error
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred while sending the payment link.');
    }
  }
}

/**
 * Print or download the invoice as PDF.
 *
 * @param {string} id - The ID of the invoice.
 * @returns {Promise<string>} - The PDF URL.
 * @throws {Error} - Throws an error with a detailed message if the operation fails.
 */
export async function printDownloadInvoice(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for printing/downloading:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`/invoice/pdfDownload?invoiceId=${encodeURIComponent(id)}`, { method: 'GET' });
    if (response.code === 200) {
      return response.pdfUrl;
    } else if (response.message) {
      console.error('Error printing/downloading invoice:', response.message);
      throw new Error(response.message);
    } else {
      console.error('Failed to print/download invoice due to an unknown error.');
      throw new Error('Failed to print/download invoice');
    }
  } catch (error) {
    console.error('Error in printDownloadInvoice:', error);
    throw new Error(error.message || 'Failed to print/download invoice');
  }
}



export async function updateInvoice(id, updatedFormData, signatureURL) {



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
    if (typeof dataSource[i].taxInfo !== "string")
      taxIfoFormdata = JSON.stringify(dataSource[i].taxInfo);
    formData.append(`items[${i}][taxInfo]`, taxIfoFormdata);
    formData.append(`items[${i}][amount]`, dataSource[i]?.amount);
    formData.append(`items[${i}][discountType]`, dataSource[i]?.discountType);
    formData.append(`items[${i}][isRateFormUpadted]`, dataSource[i]?.isRateFormUpadted);
    formData.append(`items[${i}][form_updated_discounttype]`, dataSource[i]?.form_updated_discounttype);
    formData.append(`items[${i}][form_updated_discount]`, dataSource[i]?.form_updated_discount);
    formData.append(`items[${i}][form_updated_rate]`, dataSource[i]?.form_updated_rate);
    formData.append(`items[${i}][form_updated_tax]`, dataSource[i]?.form_updated_tax);
  }

  formData.append("invoiceNumber", updatedFormData.invoiceNumber);
  formData.append("customerId", updatedFormData.customerId);
  formData.append("payment_method", updatedFormData.payment_method);
  formData.append("dueDate", updatedFormData?.dueDate);
  formData.append("invoiceDate", updatedFormData?.invoiceDate);
  formData.append("referenceNo", updatedFormData.referenceNo);
  formData.append("taxableAmount", updatedFormData.taxableAmount);
  formData.append("TotalAmount", updatedFormData.TotalAmount);
  formData.append("vat", updatedFormData.vat);
  formData.append("totalDiscount", updatedFormData.totalDiscount);
  formData.append("roundOff", updatedFormData.roundOff);
  formData.append("bank", updatedFormData.bank);
  formData.append("notes", updatedFormData.notes);
  formData.append("termsAndCondition", updatedFormData.termsAndCondition);
  formData.append("sign_type", updatedFormData.sign_type);
  formData.append("signatureName", updatedFormData?.signatureName);

  // Add signatureId if it exists
  if (updatedFormData.signatureId) {
    formData.append("signatureId", updatedFormData.signatureId);
  }

  if (signatureURL) {
    try {
       const blob =  dataURLtoBlob(signatureURL);


        formData.append("signatureImage", blob); // Add filename



    } catch (error) {
      console.error('Error processing signature:', error);
      throw new Error('Failed to process signature');
    }
  }





console.log('final form data', formData)

  try {
    const response = await fetchWithAuth(`/invoice/updateInvoice/${id}`, {
      method: 'PUT', // Ensure the method is correctly specified
      body: formData,
    });

      return { success: true, data: response.data };

  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, message: error.message || 'Failed to update invoice' };
  }
}







export async function getCustomers() {
  try {
    const response = await fetchWithAuth('/drop_down/customer');
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to fetch customers');
      throw new Error(response.message || 'Failed to fetch customers');
    }
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const response = await fetchWithAuth('/drop_down/product');
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to fetch products');
      throw new Error(response.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

export async function getTaxRates() {
  try {
    const response = await fetchWithAuth('/drop_down/tax');
    if (response.code === 200) {

      return response.data || [];
    } else {
      console.error('Failed to fetch tax rates');
      throw new Error(response.message || 'Failed to fetch tax rates');
    }
  } catch (error) {
    console.error('Error in getTaxRates:', error);
    throw error;
  }
}

export async function getBanks() {
  try {
    const response = await fetchWithAuth('/bankSettings/listBanks');
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to fetch banks');
      throw new Error(response.message || 'Failed to fetch banks');
    }
  } catch (error) {
    console.error('Error in getBanks:', error);
    throw error;
  }
}

export async function addBank(bankData) {
  try {
    const response = await fetchWithAuth('/bankSettings/addBank', {
      method: 'POST',
      body: JSON.stringify(bankData),
    });

    if (response.code === 200) {
      return response.data || {};
    } else {
      console.error('Failed to add bank');
      throw new Error(response.message || 'Failed to add bank');
    }
  } catch (error) {
    console.error('Error in addBank:', error);
    throw error;
  }
}

// Add a new function to fetch manual signatures
export async function getManualSignatures() {
  try {
    const response = await fetchWithAuth('/drop_down/signature');
    if (response.code === 200) {
      return response.data || [];
    } else {
      console.error('Failed to fetch manual signatures');
      throw new Error(response.message || 'Failed to fetch manual signatures');
    }
  } catch (error) {
    console.error('Error in getManualSignatures:', error);
    throw error;
  }
}









