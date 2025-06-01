'use client';

import { useState, useCallback } from 'react';
import { searchVendors, searchPurchaseOrders } from '@/app/(dashboard)/purchase-orders/actions';

/**
 * Generic search handler for purchase order list filters.
 */
export function searchHandler() {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState([]);
  const [vendorSearchLoading, setVendorSearchLoading] = useState(false);
  const [purchaseOrderSearchLoading, setPurchaseOrderSearchLoading] = useState(false);

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

  const handleVendorSearch = useCallback((searchTerm) =>
    performSearch(
      searchVendors,
      searchTerm,
      setVendorOptions,
      setVendorSearchLoading,
      vendor => ({ value: vendor._id, label: vendor.vendor })
    ), [performSearch]);

  const handlePurchaseOrderSearch = useCallback((searchTerm) =>
    performSearch(
      searchPurchaseOrders,
      searchTerm,
      setPurchaseOrderOptions,
      setPurchaseOrderSearchLoading,
      purchaseOrder => ({ value: purchaseOrder.purchaseOrderId, label: purchaseOrder.purchaseOrderId })
    ), [performSearch]);

  return {
    vendorOptions,
    purchaseOrderOptions,
    vendorSearchLoading,
    purchaseOrderSearchLoading,
    handleVendorSearch,
    handlePurchaseOrderSearch,
    setVendorOptions,
    setPurchaseOrderOptions,
  };
}