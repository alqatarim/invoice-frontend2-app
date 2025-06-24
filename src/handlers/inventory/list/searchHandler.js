'use client';

import { useState, useCallback } from 'react';
import { searchProducts } from '@/app/(dashboard)/inventory/actions';

/**
 * Generic search handler for inventory list filters.
 */
export function searchHandler() {
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

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

  const handleProductSearch = useCallback((searchTerm) =>
    performSearch(
      searchProducts,
      searchTerm,
      setProductOptions,
      setProductSearchLoading,
      product => ({ value: product._id, label: product.name })
    ), [performSearch]);

  return {
    productOptions,
    productSearchLoading,
    handleProductSearch,
    setProductOptions,
  };
}