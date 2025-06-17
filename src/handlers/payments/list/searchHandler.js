'use client';

import { useState, useCallback } from 'react';
import { searchCustomers } from '@/app/(dashboard)/payments/actions';

/**
 * Search handler for payment list filters
 */
export function searchHandler() {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

  /**
   * Generic search function with error handling
   */
  const performSearch = useCallback(async (searchFn, searchTerm, setOptions, setLoading, formatFn) => {
    setLoading(true);
    try {
      const response = await searchFn(searchTerm);
      const results = response.data || [];
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
      customer => ({ 
        value: customer._id, 
        label: customer.name || 'Unknown Customer',
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
          image: customer.image
        }
      })
    ), [performSearch]);

  return {
    customerOptions,
    customerSearchLoading,
    handleCustomerSearch,
    setCustomerOptions,
  };
}