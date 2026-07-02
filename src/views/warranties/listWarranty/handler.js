'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWarranties } from '@/app/(dashboard)/warranties/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

export function useWarrantyListHandler({
  initialRecords = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const stateRef = useRef({ pagination: initialPagination, searchTerm: '' });

  useEffect(() => {
    stateRef.current = { pagination, searchTerm };
  }, [pagination, searchTerm]);

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page ?? currentState.pagination.current;
      const pageSize = params.pageSize ?? currentState.pagination.pageSize;
      const search = params.search ?? currentState.searchTerm;
      const result = await getWarranties({ page, pageSize, search });

      if (!result.success) {
        throw new Error(result.message || 'Failed to load warranties');
      }

      setRecords(result.data || []);
      setPagination({ current: page, pageSize, total: result.totalRecords || 0 });
      setSummary(result.summary || {});
      setSearchTerm(search);

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to load warranties');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchRecords({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      search: currentState.searchTerm,
    });
  }, [fetchRecords]);

  const handlePageChange = useCallback(pageZeroBased => {
    fetchRecords({ page: Number(pageZeroBased) + 1 });
  }, [fetchRecords]);

  const handlePageSizeChange = useCallback(pageSize => {
    fetchRecords({ page: 1, pageSize: Number(pageSize) });
  }, [fetchRecords]);

  const handleSearchInputChange = useCallback(value => {
    if (value === stateRef.current.searchTerm) return;

    const trimmedValue = String(value || '').trim();
    setSearchTerm(value);
    fetchRecords({ page: 1, search: trimmedValue });
  }, [fetchRecords]);

  const handleView = useCallback(recordId => {
    if (!recordId) return;
    router.push(`/warranties/warranty-view/${recordId}`);
  }, [router]);

  const handleEdit = useCallback(recordId => {
    if (!recordId) return;
    router.push(`/warranties/warranty-edit/${recordId}`);
  }, [router]);

  const handleRowClick = useCallback(row => {
    handleView(row?._id);
  }, [handleView]);

  const handleAdd = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddDialogOpen(false);
  }, []);

  const handleWarrantyCreated = useCallback(async () => {
    closeAddDialog();
    await refreshData();
  }, [closeAddDialog, refreshData]);

  const tablePagination = useMemo(
    () => ({
      page: Math.max(pagination.current - 1, 0),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination]
  );

  return {
    records,
    tablePagination,
    summary,
    searchTerm,
    loading,
    addDialogOpen,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange,
    handleView,
    handleEdit,
    handleRowClick,
    handleAdd,
    closeAddDialog,
    handleWarrantyCreated,
  };
}

export default useWarrantyListHandler;
