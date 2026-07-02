'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWarrantyClaim, getWarrantyClaims } from '@/app/(dashboard)/claims/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const EMPTY_CLAIM = {
  warrantyRecordId: '',
  issueType: 'repair',
  description: '',
  internalNotes: '',
};

export function useClaimListHandler({
  initialClaims = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CLAIM);
  const [saving, setSaving] = useState(false);
  const stateRef = useRef({ pagination: initialPagination, searchTerm: '' });

  useEffect(() => {
    stateRef.current = { pagination, searchTerm };
  }, [pagination, searchTerm]);

  const fetchClaims = useCallback(async (params = {}) => {
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page ?? currentState.pagination.current;
      const pageSize = params.pageSize ?? currentState.pagination.pageSize;
      const search = params.search ?? currentState.searchTerm;
      const result = await getWarrantyClaims({ page, pageSize, search });

      if (!result.success) {
        throw new Error(result.message || 'Failed to load claims');
      }

      setClaims(result.data || []);
      setPagination({ current: page, pageSize, total: result.totalRecords || 0 });
      setSummary(result.summary || {});
      setSearchTerm(search);

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to load claims');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchClaims({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      search: currentState.searchTerm,
    });
  }, [fetchClaims]);

  const handlePageChange = useCallback(pageZeroBased => {
    fetchClaims({ page: Number(pageZeroBased) + 1 });
  }, [fetchClaims]);

  const handlePageSizeChange = useCallback(pageSize => {
    fetchClaims({ page: 1, pageSize: Number(pageSize) });
  }, [fetchClaims]);

  const handleSearchInputChange = useCallback(value => {
    fetchClaims({ page: 1, search: String(value || '') });
  }, [fetchClaims]);

  const handleView = useCallback(claimId => {
    if (!claimId) return;
    router.push(`/claims/claim-view/${claimId}`);
  }, [router]);

  const handleRowClick = useCallback(row => {
    handleView(row?._id);
  }, [handleView]);

  const openDialog = useCallback(() => {
    setForm(EMPTY_CLAIM);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setForm(EMPTY_CLAIM);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.warrantyRecordId || !form.description) {
      onError?.('Warranty ID and description are required');
      return;
    }

    setSaving(true);

    try {
      const result = await createWarrantyClaim(form);

      if (!result.success) {
        throw new Error(result.message || 'Failed to create claim');
      }

      onSuccess?.(result.message || 'Warranty claim created');
      closeDialog();
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to create claim');
    } finally {
      setSaving(false);
    }
  }, [closeDialog, form, onError, onSuccess, refreshData]);

  const tablePagination = useMemo(
    () => ({
      page: Math.max(pagination.current - 1, 0),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination]
  );

  return {
    claims,
    tablePagination,
    summary,
    searchTerm,
    loading,
    dialogOpen,
    form,
    saving,
    setForm,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange,
    handleView,
    handleRowClick,
    openDialog,
    closeDialog,
    handleCreate,
  };
}

export default useClaimListHandler;
