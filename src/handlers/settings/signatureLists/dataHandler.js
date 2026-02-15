'use client'

import { useState, useCallback } from 'react';
import { getInitialSignaturesData } from '@/app/(dashboard)/settings/actions';

/**
 * Data handler for signature lists - manages state and pagination
 * Initial data should come from page.jsx, this handler is for manual refresh/pagination only
 */
export function dataHandler({
  initialSignatures = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
  onSuccess,
}) {
  const [signatures, setSignatures] = useState(initialSignatures);
  const [pagination, setPagination] = useState({
    ...initialPagination,
    total: initialSignatures.length
  });
  const [loading, setLoading] = useState(false);

  // Fetch signatures with current or provided parameters (for pagination/manual refresh)
  const fetchData = useCallback(async (params = {}) => {
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
    } = params;

    setLoading(true);
    try {
      const result = await getInitialSignaturesData();

      if (result.success) {
        const newSignatures = result.data || [];
        const newPagination = {
          current: page,
          pageSize,
          total: result.data?.totalCount || 0
        };

        setSignatures(newSignatures);
        setPagination(newPagination);

        return { signatures: newSignatures, pagination: newPagination };
      } else {
        throw new Error(result.message || 'Failed to fetch signatures');
      }
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch signatures');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, onError, onSuccess]);

  const handlePageChange = useCallback((eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
    if (typeof nextPage !== 'number') return;
    fetchData({ page: nextPage + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((eventOrSize) => {
    const nextSize = typeof eventOrSize === 'number'
      ? eventOrSize
      : parseInt(eventOrSize.target.value, 10);
    if (!Number.isFinite(nextSize)) return;
    fetchData({ page: 1, pageSize: nextSize });
  }, [fetchData]);

  return {
    // State
    signatures,
    pagination,
    loading,

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,

    // State setters for external updates
    setSignatures,
    setPagination,
  };
}