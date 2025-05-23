import { useState, useCallback } from 'react';
import { searchCustomers, searchInvoices } from '@/app/(dashboard)/invoices/actions';

/**
 * searchHandler
 * Handles async search for customers and invoices for filters/autocomplete.
 */
export function searchHandler() {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [invoiceSearchLoading, setInvoiceSearchLoading] = useState(false);

  const handleCustomerSearch = useCallback(async (searchTerm) => {
    setCustomerSearchLoading(true);
    try {
      const customers = await searchCustomers(searchTerm);
      setCustomerOptions(customers.map(c => ({ value: c._id, label: c.name })));
    } catch {
      setCustomerOptions([]);
    } finally {
      setCustomerSearchLoading(false);
    }
  }, []);

  const handleInvoiceSearch = useCallback(async (searchTerm) => {
    setInvoiceSearchLoading(true);
    try {
      const invoices = await searchInvoices(searchTerm);
      setInvoiceOptions(invoices.map(inv => ({ value: inv.invoiceNumber, label: inv.invoiceNumber })));
    } catch {
      setInvoiceOptions([]);
    } finally {
      setInvoiceSearchLoading(false);
    }
  }, []);

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