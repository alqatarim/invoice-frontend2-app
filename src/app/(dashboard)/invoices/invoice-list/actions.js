'use server';

import { fetchWithAuth } from '@/Auth/fetchWithAuth';

const ENDPOINTS = {
  LIST: {
    CUSTOMERS: '/customers/listCustomers',
  },
  INVOICE: {
    LIST: '/invoice',
    CLONE: '/invoice',
    CARD_COUNTS: '/invoice/invoiceCard',
    PDF_CREATE: '/invoice/pdfCreate',
    PDF_DOWNLOAD: '/invoice/pdfDownload',
    CONVERT_SALES_RETURN: '/invoice',
  },
  UNAUTHORIZED: {
    PAYMENT_LINKS: '/unauthorized/sentPaymentLinks',
  },
};

export async function getInvoiceListPageData() {
  try {
    const [invoiceResponse, cardCountsResponse] = await Promise.all([
      fetchWithAuth(`${ENDPOINTS.INVOICE.LIST}?page=1&pageSize=10&sortBy=&sortDirection=asc`),
      fetchWithAuth(ENDPOINTS.INVOICE.CARD_COUNTS),
    ]);

    if (invoiceResponse.code === 200 && cardCountsResponse.code === 200) {
      return {
        invoices: invoiceResponse.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: invoiceResponse.totalRecords || 0,
        },
        cardCounts: cardCountsResponse.data || {},
      };
    }

    console.error('Failed to fetch initial invoice data or card counts');
    throw new Error('Failed to fetch initial invoice data or card counts');
  } catch (error) {
    console.error('Error in getInvoiceListPageData:', error.message);
    throw new Error(error.message || 'Failed to fetch initial invoice data');
  }
}

export async function getFilteredInvoices(
  tab,
  page,
  pageSize,
  filters = {},
  sortBy = '',
  sortDirection = 'asc',
  searchInvoiceNumber = ''
) {
  const statusFilters =
    filters.status && Array.isArray(filters.status) && filters.status.length > 0
      ? filters.status
      : tab !== 'ALL'
        ? [tab]
        : [];

  if (statusFilters.length === 0 || statusFilters.includes('ALL')) {
    return await fetchInvoicesWithSingleStatus(
      null,
      page,
      pageSize,
      filters,
      sortBy,
      sortDirection,
      searchInvoiceNumber
    );
  }

  if (statusFilters.length === 1) {
    return await fetchInvoicesWithSingleStatus(
      statusFilters[0],
      page,
      pageSize,
      filters,
      sortBy,
      sortDirection,
      searchInvoiceNumber
    );
  }

  try {
    const results = await Promise.all(
      statusFilters.map((status) =>
        fetchInvoicesWithSingleStatus(
          status,
          1,
          1000,
          filters,
          sortBy,
          sortDirection,
          searchInvoiceNumber
        )
      )
    );
    const allResults = results.flatMap((result) => result.invoices || []);

    const uniqueInvoices = allResults.filter(
      (invoice, index, self) => index === self.findIndex((i) => i._id === invoice._id)
    );

    if (sortBy) {
      uniqueInvoices.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy.includes('.')) {
          const keys = sortBy.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'desc' ? -comparison : comparison;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
        }

        if (aValue < bValue) return sortDirection === 'desc' ? 1 : -1;
        if (aValue > bValue) return sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedInvoices = uniqueInvoices.slice(startIndex, endIndex);

    return {
      invoices: paginatedInvoices,
      pagination: {
        current: page,
        pageSize,
        total: uniqueInvoices.length,
      },
    };
  } catch (error) {
    console.error('Error in getFilteredInvoices (multiple status):', error);
    throw new Error(error.message || 'Failed to fetch filtered invoices');
  }
}

async function fetchInvoicesWithSingleStatus(
  status,
  page,
  pageSize,
  filters,
  sortBy,
  sortDirection,
  searchInvoiceNumber
) {
  let url = ENDPOINTS.INVOICE.LIST + `?page=${page}&pageSize=${pageSize}`;

  if (status && status !== 'ALL') {
    url += `&status=${encodeURIComponent(status)}`;
  }

  if (filters.customer && Array.isArray(filters.customer) && filters.customer.length > 0) {
    url += `&customer=${filters.customer.map((id) => encodeURIComponent(id)).join(',')}`;
  }
  if (typeof searchInvoiceNumber === 'string' && searchInvoiceNumber.trim()) {
    url += `&search_invoiceNumber=${encodeURIComponent(searchInvoiceNumber.trim())}`;
  } else if (filters.invoiceNumber && Array.isArray(filters.invoiceNumber) && filters.invoiceNumber.length > 0) {
    url += `&invoiceNumber=${filters.invoiceNumber.map((num) => encodeURIComponent(num)).join(',')}`;
  }
  if (filters.fromDate) {
    url += `&fromDate=${encodeURIComponent(filters.fromDate)}`;
  }
  if (filters.toDate) {
    url += `&toDate=${encodeURIComponent(filters.toDate)}`;
  }

  if (sortBy) {
    url += `&sortBy=${encodeURIComponent(sortBy)}&sortDirection=${encodeURIComponent(sortDirection)}`;
  }

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
  }

  console.error('Failed to fetch filtered invoices:', response.message);
  throw new Error(response.message || 'Failed to fetch filtered invoices');
}

export async function cloneInvoice(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for cloning:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.INVOICE.CLONE}/${id}/clone`, { method: 'POST' });
    if (response.code === 200) {
      return response.invoice || response.data;
    }
    console.error('Failed to clone invoice:', response.message);
    throw new Error(response.message || 'Failed to clone invoice');
  } catch (error) {
    console.error('Error in cloneInvoice:', error);
    throw new Error(error.message || 'Failed to clone invoice');
  }
}

export async function sendInvoice(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for sending:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.INVOICE.PDF_CREATE}?invoiceId=${encodeURIComponent(id)}`);
    if (response.code === 200) {
      return response;
    }
    if (response.message) {
      console.error('Error sending invoice:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to send invoice due to an unknown error.');
    throw new Error('Failed to send invoice');
  } catch (error) {
    console.error('Error in sendInvoice:', error);
    throw new Error(error.message || 'Failed to send invoice');
  }
}

export async function convertTosalesReturn(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for conversion:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.INVOICE.CONVERT_SALES_RETURN}/${id}/convertsalesreturn`,
      { method: 'POST' }
    );
    if (response.code === 200) {
      return response;
    }
    if (response.message) {
      console.error('Error converting invoice to sales return:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to convert invoice to sales return due to an unknown error.');
    throw new Error('Failed to convert invoice to sales return');
  } catch (error) {
    console.error('Error in convertTosalesReturn:', error);
    throw new Error(error.message || 'Failed to convert invoice to sales return');
  }
}

export async function searchCustomers(searchTerm = '') {
  const url = searchTerm
    ? ENDPOINTS.LIST.CUSTOMERS + `?search_customer=${encodeURIComponent(searchTerm)}`
    : ENDPOINTS.LIST.CUSTOMERS;

  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.customers || [];
    }
    if (response.message) {
      console.error('Error searching customers:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to search customers due to an unknown error.');
    throw new Error('Failed to search customers');
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw new Error(error.message || 'Failed in search Customers');
  }
}

export async function searchInvoices(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    console.error('Invalid search term for invoices:', searchTerm);
    throw new Error('Invalid search term');
  }

  const url = ENDPOINTS.INVOICE.LIST + `?search_invoiceNumber=${encodeURIComponent(searchTerm)}`;
  try {
    const response = await fetchWithAuth(url);
    if (response.code === 200) {
      return response.invoiceList || [];
    }
    if (response.message) {
      console.error('Error searching invoices:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to search invoices due to an unknown error.');
    throw new Error('Failed to search invoices');
  } catch (error) {
    console.error('Error in searchInvoices:', error);
    throw new Error(error.message || 'Failed in search Invoices');
  }
}

export async function sendPaymentLink(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for sending payment link:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(
      `${ENDPOINTS.UNAUTHORIZED.PAYMENT_LINKS}?invoiceId=${encodeURIComponent(id)}`
    );

    if (response.code === 200) {
      return response;
    }
    if (response.message) {
      console.error('Error sending payment link:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to send payment link due to an unknown error.');
    throw new Error('Failed to send payment link');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred while sending the payment link.');
  }
}

export async function printDownloadInvoice(id) {
  if (!id || typeof id !== 'string') {
    console.error('Invalid invoice ID for printing/downloading:', id);
    throw new Error('Invalid invoice ID');
  }

  try {
    const response = await fetchWithAuth(`${ENDPOINTS.INVOICE.PDF_DOWNLOAD}?invoiceId=${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    if (response.code === 200) {
      return response.pdfUrl;
    }
    if (response.message) {
      console.error('Error printing/downloading invoice:', response.message);
      throw new Error(response.message);
    }
    console.error('Failed to print/download invoice due to an unknown error.');
    throw new Error('Failed to print/download invoice');
  } catch (error) {
    console.error('Error in printDownloadInvoice:', error);
    throw new Error(error.message || 'Failed to print/download invoice');
  }
}
