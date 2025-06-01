'use client';

import { useState, useCallback } from 'react';
import { searchCustomers, searchInvoices } from '@/app/(dashboard)/invoices/actions';

/**
 * Generic search handler for invoice list filters.
 */
export function searchHandler() {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [invoiceSearchLoading, setInvoiceSearchLoading] = useState(false);

  /**
   * Generic search function with error handling.
   */
  const performSearch = useCallback(async (searchFn, searchTerm, setOptions, setLoading, formatFn) => {
    setLoading(true);
    try {
      const results = await searchFn(searchTerm);
      setOptions(results.map(formatFn));
    } catch (error) {
      console.error('Search error:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCustomerSearch = useCallback((searchTerm) =>
    performSearch(
      searchCustomers,
      searchTerm,
      setCustomerOptions,
      setCustomerSearchLoading,
      customer => ({ value: customer._id, label: customer.name })
    ), [performSearch]);

  const handleInvoiceSearch = useCallback((searchTerm) =>
    performSearch(
      searchInvoices,
      searchTerm,
      setInvoiceOptions,
      setInvoiceSearchLoading,
      invoice => ({ value: invoice.invoiceNumber, label: invoice.invoiceNumber })
    ), [performSearch]);

  return {
    customerOptions,
    invoiceOptions,
    customerSearchLoading,
    invoiceSearchLoading,
    handleCustomerSearch,
    handleInvoiceSearch,
    setCustomerOptions,
    setInvoiceOptions,
  };
}