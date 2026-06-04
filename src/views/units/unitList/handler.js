'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addUnit,
  deleteUnit,
  getFilteredUnits,
  updateUnit,
} from '@/app/(dashboard)/units/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const DEFAULT_DIALOG_STATE = {
  add: false,
  edit: false,
  view: false,
  editUnitId: null,
  viewUnitId: null,
};

export function useUnitListHandler({
  initialUnits = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onInfo,
  onSuccess,
}) {
  const [units, setUnits] = useState(initialUnits);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogStates, setDialogStates] = useState(DEFAULT_DIALOG_STATE);
  const loadingRef = useRef(false);
  const stateRef = useRef({
    pagination: initialPagination,
    sortBy: '',
    sortDirection: 'asc',
    filters: {},
    searchTerm: '',
  });

  useEffect(() => {
    stateRef.current = {
      pagination,
      sortBy,
      sortDirection,
      filters,
      searchTerm,
    };
  }, [pagination, sortBy, sortDirection, filters, searchTerm]);

  const fetchUnits = useCallback(async (params = {}) => {
    if (loadingRef.current) return null;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const page = params.page ?? currentState.pagination.current;
      const pageSize = params.pageSize ?? currentState.pagination.pageSize;
      const nextFilters = params.filters ?? currentState.filters;
      const nextSortBy = params.sortBy ?? currentState.sortBy;
      const nextSortDirection = params.sortDirection ?? currentState.sortDirection;

      const result = await getFilteredUnits(
        page,
        pageSize,
        nextFilters,
        nextSortBy,
        nextSortDirection
      );

      setUnits(result?.units || []);
      setPagination(result?.pagination || DEFAULT_PAGINATION);
      setSummary(result?.summary || {});
      setFilters(nextFilters);
      setSortBy(nextSortBy);
      setSortDirection(nextSortDirection);

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to fetch units');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchUnits({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      filters: currentState.filters,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
    });
  }, [fetchUnits]);

  const handlePageChange = useCallback(
    newPageZeroBased => {
      const nextPage = Number(newPageZeroBased) + 1;

      if (!Number.isFinite(nextPage)) return;

      setPagination(current => ({ ...current, current: nextPage }));
      fetchUnits({ page: nextPage });
    },
    [fetchUnits]
  );

  const handlePageSizeChange = useCallback(
    newPageSize => {
      const pageSize = Number(newPageSize);

      if (!Number.isFinite(pageSize) || pageSize <= 0) return;

      setPagination(current => ({ ...current, current: 1, pageSize }));
      fetchUnits({ page: 1, pageSize });
    },
    [fetchUnits]
  );

  const handleSortRequest = useCallback(
    (columnKey, direction) => {
      const currentState = stateRef.current;
      const nextDirection =
        direction ||
        (currentState.sortBy === columnKey && currentState.sortDirection === 'asc'
          ? 'desc'
          : 'asc');

      setSortBy(columnKey);
      setSortDirection(nextDirection);
      fetchUnits({ page: 1, sortBy: columnKey, sortDirection: nextDirection });
    },
    [fetchUnits]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) return;

      const trimmed = String(value || '').trim();
      const nextFilters = { ...stateRef.current.filters };

      if (trimmed) {
        nextFilters.search_unit = trimmed;
      } else {
        delete nextFilters.search_unit;
      }

      setSearchTerm(value);

      try {
        await fetchUnits({ page: 1, filters: nextFilters });
      } catch (error) {
        onError?.(error.message || 'Search failed');
      }
    },
    [fetchUnits, onError]
  );

  const handleOpenAddDialog = useCallback(() => {
    setDialogStates({ ...DEFAULT_DIALOG_STATE, add: true });
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleOpenEditDialog = useCallback(unitId => {
    setDialogStates({ ...DEFAULT_DIALOG_STATE, edit: true, editUnitId: unitId });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleOpenViewDialog = useCallback(unitId => {
    setDialogStates({ ...DEFAULT_DIALOG_STATE, view: true, viewUnitId: unitId });
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleAddUnit = useCallback(async (formData) => {
    try {
      onInfo?.('Submitting unit...');

      const response = await addUnit(formData);

      if (!response?.success) {
        const errorMessage = response?.error?.message || response?.message || 'Failed to add unit';
        onError?.(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess?.('Unit added successfully!');
      await refreshData();

      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError?.(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onError, onInfo, onSuccess, refreshData]);

  const handleUpdateUnit = useCallback(async (unitId, formData) => {
    try {
      onInfo?.('Updating unit...');

      const response = await updateUnit(unitId, formData);

      if (!response?.success) {
        const errorMessage = response?.error?.message || response?.message || 'Failed to update unit';
        onError?.(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess?.('Unit updated successfully!');
      await refreshData();

      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError?.(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onError, onInfo, onSuccess, refreshData]);

  const handleDelete = useCallback(
    async unitId => {
      try {
        const response = await deleteUnit(unitId);

        if (response && response.success === false) {
          throw new Error(response.error?.message || response.message || 'Failed to delete unit');
        }

        onSuccess?.('Unit deleted successfully!');
        await refreshData();

        return response;
      } catch (error) {
        onError?.(error.message || 'Failed to delete unit');
        throw error;
      }
    },
    [onError, onSuccess, refreshData]
  );

  const handleEdit = useCallback(
    unitId => {
      if (!unitId) return;
      handleOpenEditDialog(unitId);
    },
    [handleOpenEditDialog]
  );

  const handleView = useCallback(
    unitId => {
      if (!unitId) return;
      handleOpenViewDialog(unitId);
    },
    [handleOpenViewDialog]
  );

  return {
    units,
    pagination,
    summary,
    loading,
    sortBy,
    sortDirection,
    searchTerm,
    dialogStates,
    refreshData,
    handleDelete,
    handleEdit,
    handleView,
    handleAddUnit,
    handleUpdateUnit,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleOpenViewDialog,
    handleCloseViewDialog,
  };
}
