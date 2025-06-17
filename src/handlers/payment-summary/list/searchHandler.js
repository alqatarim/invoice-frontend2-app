'use client';

import { useState, useCallback } from 'react';
import { searchCustomers } from '@/app/(dashboard)/payment-summary/actions';

/**
 * Search handler for payment summary list (following invoice pattern)
 */
export function searchHandler() {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

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

  return {
    customerOptions,
    customerSearchLoading,
    handleCustomerSearch,
    setCustomerOptions,
  };
}