'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteWarrantyPolicy,
  getWarrantyPolicies,
} from '@/app/(dashboard)/policies/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

export function usePolicyListHandler({
  initialPolicies = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const [policies, setPolicies] = useState(initialPolicies);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const stateRef = useRef({ pagination: initialPagination, searchTerm: '' });

  useEffect(() => {
    stateRef.current = { pagination, searchTerm };
  }, [pagination, searchTerm]);

  const fetchPolicies = useCallback(async (params = {}) => {
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page ?? currentState.pagination.current;
      const pageSize = params.pageSize ?? currentState.pagination.pageSize;
      const search = params.search ?? currentState.searchTerm;
      const result = await getWarrantyPolicies({ page, pageSize, search });

      if (!result.success) {
        throw new Error(result.message || 'Failed to load warranty policies');
      }

      setPolicies(result.data || []);
      setSummary(result.summary || {});
      setPagination({ current: page, pageSize, total: result.totalRecords || 0 });
      setSearchTerm(search);

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to load warranty policies');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchPolicies({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      search: currentState.searchTerm,
    });
  }, [fetchPolicies]);

  const handlePageChange = useCallback(pageZeroBased => {
    fetchPolicies({ page: Number(pageZeroBased) + 1 });
  }, [fetchPolicies]);

  const handlePageSizeChange = useCallback(pageSize => {
    fetchPolicies({ page: 1, pageSize: Number(pageSize) });
  }, [fetchPolicies]);

  const handleSearchInputChange = useCallback(value => {
    fetchPolicies({ page: 1, search: String(value || '') });
  }, [fetchPolicies]);

  const handleAdd = useCallback(() => {
    router.push('/policies/policy-add');
  }, [router]);

  const handleView = useCallback(policyId => {
    if (!policyId) return;
    router.push(`/policies/policy-view/${policyId}`);
  }, [router]);

  const handleEdit = useCallback(policyId => {
    if (!policyId) return;
    router.push(`/policies/policy-edit/${policyId}`);
  }, [router]);

  const handleRowClick = useCallback(policy => {
    handleView(policy?._id);
  }, [handleView]);

  const handleDelete = useCallback(async policy => {
    if (!policy?._id) return;
    if (!window.confirm(`Delete warranty policy "${policy.name}"?`)) return;

    try {
      const result = await deleteWarrantyPolicy(policy._id);

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete warranty policy');
      }

      onSuccess?.(result.message || 'Warranty policy deleted');
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to delete warranty policy');
    }
  }, [onError, onSuccess, refreshData]);

  const tablePagination = useMemo(
    () => ({
      page: Math.max(pagination.current - 1, 0),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination]
  );

  return {
    policies,
    tablePagination,
    summary,
    searchTerm,
    loading,
    handleAdd,
    handleView,
    handleEdit,
    handleRowClick,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange,
  };
}

export default usePolicyListHandler;
