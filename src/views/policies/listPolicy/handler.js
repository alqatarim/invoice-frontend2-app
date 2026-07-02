'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addWarrantyPolicy,
  deleteWarrantyPolicy,
  getWarrantyPolicies,
  updateWarrantyPolicy,
} from '@/app/(dashboard)/policies/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const EMPTY_POLICY_FORM = {
  name: '',
  code: '',
  description: '',
  durationValue: 12,
  durationUnit: 'months',
  coverageType: 'repair_or_replace',
  returnBehavior: 'void_on_full_return',
  extensionAllowed: false,
  maxExtensionValue: '',
  maxExtensionUnit: 'months',
  claimLimitType: 'unlimited',
  claimLimitCount: '',
  termsAndConditions: '',
  exclusions: '',
  instructions: '',
  requiresSerialNumber: false,
  isTransferable: false,
  status: 'active',
};

const mapPolicyToForm = policy => ({
  name: policy?.name || '',
  code: policy?.code || '',
  description: policy?.description || '',
  durationValue: policy?.duration?.value || 12,
  durationUnit: policy?.duration?.unit || 'months',
  coverageType: policy?.coverageType || EMPTY_POLICY_FORM.coverageType,
  returnBehavior: policy?.returnBehavior || EMPTY_POLICY_FORM.returnBehavior,
  extensionAllowed: Boolean(policy?.extensionAllowed),
  maxExtensionValue: policy?.maxExtension?.value || '',
  maxExtensionUnit: policy?.maxExtension?.unit || 'months',
  claimLimitType: policy?.claimLimit?.type || EMPTY_POLICY_FORM.claimLimitType,
  claimLimitCount: policy?.claimLimit?.count || '',
  termsAndConditions: policy?.termsAndConditions || '',
  exclusions: policy?.exclusions || '',
  instructions: policy?.instructions || '',
  requiresSerialNumber: Boolean(policy?.requiresSerialNumber),
  isTransferable: Boolean(policy?.isTransferable),
  status: policy?.status || 'active',
});

const buildPolicyPayload = form => ({
  name: form.name,
  code: form.code,
  description: form.description,
  duration: {
    value: Number(form.durationValue || 0),
    unit: form.durationUnit,
  },
  coverageType: form.coverageType,
  returnBehavior: form.returnBehavior,
  extensionAllowed: Boolean(form.extensionAllowed),
  maxExtension: form.extensionAllowed && form.maxExtensionValue
    ? {
      value: Number(form.maxExtensionValue || 0),
      unit: form.maxExtensionUnit,
    }
    : null,
  claimLimit: {
    type: form.claimLimitType,
    count: form.claimLimitType === 'count' ? Number(form.claimLimitCount || 0) : null,
  },
  termsAndConditions: form.termsAndConditions,
  exclusions: form.exclusions,
  instructions: form.instructions,
  requiresSerialNumber: Boolean(form.requiresSerialNumber),
  isTransferable: Boolean(form.isTransferable),
  status: form.status,
});

export function usePolicyListHandler({
  initialPolicies = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState(EMPTY_POLICY_FORM);
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

  const openAdd = useCallback(() => {
    setSelectedPolicy(null);
    setForm(EMPTY_POLICY_FORM);
    setDialogMode('add');
  }, []);

  const openPolicy = useCallback((policy, mode) => {
    setSelectedPolicy(policy);
    setForm(mapPolicyToForm(policy));
    setDialogMode(mode);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedPolicy(null);
    setForm(EMPTY_POLICY_FORM);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name || !form.durationValue) {
      onError?.('Policy name and duration are required');
      return;
    }

    setSaving(true);

    try {
      const payload = buildPolicyPayload(form);
      const result = dialogMode === 'edit' && selectedPolicy?._id
        ? await updateWarrantyPolicy(selectedPolicy._id, payload)
        : await addWarrantyPolicy(payload);

      if (!result.success) {
        throw new Error(result.message || 'Failed to save warranty policy');
      }

      onSuccess?.(result.message || 'Warranty policy saved');
      closeDialog();
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to save warranty policy');
    } finally {
      setSaving(false);
    }
  }, [closeDialog, dialogMode, form, onError, onSuccess, refreshData, selectedPolicy?._id]);

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
    saving,
    dialogMode,
    form,
    setForm,
    openAdd,
    openPolicy,
    closeDialog,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange,
  };
}

export default usePolicyListHandler;
