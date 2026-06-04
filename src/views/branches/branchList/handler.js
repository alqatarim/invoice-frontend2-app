'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBranch, getFilteredBranches } from '@/app/(dashboard)/branches/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const normalizeInitialFilters = (filters = {}) => {
  const normalizedFilters = {};

  ['search_branch', 'branchType', 'province', 'city', 'status'].forEach(key => {
    const value = filters?.[key];
    if (value !== undefined && value !== null && value !== '') {
      normalizedFilters[key] = String(value);
    }
  });

  return normalizedFilters;
};

const getSearchTermFromFilters = filters => filters?.search_branch || '';

export function useBranchListHandler({
  initialBranches = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
  onEdit,
  onView,
  initialFilters = {},
}) {
  const router = useRouter();
  const normalizedInitialFilters = normalizeInitialFilters(initialFilters);

  const [branches, setBranches] = useState(initialBranches);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState(normalizedInitialFilters);
  const [searchTerm, setSearchTerm] = useState(getSearchTermFromFilters(normalizedInitialFilters));

  const loadingRef = useRef(false);
  const stateRef = useRef({
    pagination: initialPagination,
    sortBy: '',
    sortDirection: 'asc',
    filters: normalizedInitialFilters,
    searchTerm: getSearchTermFromFilters(normalizedInitialFilters),
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

  const fetchBranches = useCallback(
    async (params = {}) => {
      if (loadingRef.current) {
        return null;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        const currentState = stateRef.current;
        const page = params.page ?? currentState.pagination.current;
        const pageSize = params.pageSize ?? currentState.pagination.pageSize;
        const nextFilters = params.filters ?? currentState.filters;
        const nextSortBy = params.sortBy ?? currentState.sortBy;
        const nextSortDirection = params.sortDirection ?? currentState.sortDirection;

        const result = await getFilteredBranches(
          page,
          pageSize,
          nextFilters,
          nextSortBy,
          nextSortDirection
        );

        setBranches(result?.branches || []);
        setPagination(result?.pagination || DEFAULT_PAGINATION);
        setSummary(result?.summary || {});
        setSortBy(nextSortBy);
        setSortDirection(nextSortDirection);
        setFilters(nextFilters);

        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to fetch locations');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError]
  );

  const syncStoreFiltersToUrl = useCallback(
    nextFilters => {
      const searchParams = new URLSearchParams();

      if (nextFilters.province) searchParams.set('province', nextFilters.province);
      if (nextFilters.city) searchParams.set('city', nextFilters.city);

      const query = searchParams.toString();
      router.replace(query ? `/stores?${query}` : '/stores', { scroll: false });
    },
    [router]
  );

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchBranches({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      filters: currentState.filters,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
    });
  }, [fetchBranches]);

  const handlePageChange = useCallback(
    (newPageZeroBased) => {
      const nextPage = Number(newPageZeroBased) + 1;

      if (!Number.isFinite(nextPage)) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: nextPage,
      }));

      fetchBranches({ page: nextPage });
    },
    [fetchBranches]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      const pageSize = Number(newPageSize);

      if (!Number.isFinite(pageSize) || pageSize <= 0) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: 1,
        pageSize,
      }));

      fetchBranches({ page: 1, pageSize });
    },
    [fetchBranches]
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

      fetchBranches({
        page: 1,
        sortBy: columnKey,
        sortDirection: nextDirection,
      });
    },
    [fetchBranches]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) {
        return;
      }

      const trimmedValue = (value ?? '').trim();
      const nextFilters = { ...stateRef.current.filters };

      setSearchTerm(value);

      if (trimmedValue) {
        nextFilters.search_branch = trimmedValue;
      } else {
        delete nextFilters.search_branch;
      }

      try {
        await fetchBranches({
          page: 1,
          filters: nextFilters,
        });
      } catch (error) {
        onError?.(error.message || 'Search failed');
      }
    },
    [fetchBranches, onError]
  );

  const handleProvinceFilterChange = useCallback(
    async value => {
      const nextFilters = { ...stateRef.current.filters };

      if (value) {
        nextFilters.province = value;
      } else {
        delete nextFilters.province;
      }

      delete nextFilters.city;
      syncStoreFiltersToUrl(nextFilters);

      try {
        await fetchBranches({
          page: 1,
          filters: nextFilters,
        });
      } catch (error) {
        onError?.(error.message || 'Province filter failed');
      }
    },
    [fetchBranches, onError, syncStoreFiltersToUrl]
  );

  const handleCityFilterChange = useCallback(
    async value => {
      const nextFilters = { ...stateRef.current.filters };

      if (value) {
        nextFilters.city = value;
      } else {
        delete nextFilters.city;
      }

      syncStoreFiltersToUrl(nextFilters);

      try {
        await fetchBranches({
          page: 1,
          filters: nextFilters,
        });
      } catch (error) {
        onError?.(error.message || 'City filter failed');
      }
    },
    [fetchBranches, onError, syncStoreFiltersToUrl]
  );

  const handleDelete = useCallback(
    async id => {
      try {
        const response = await deleteBranch(id);

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to delete location');
        }

        onSuccess?.('Location deleted successfully!');
        await refreshData();

        return response;
      } catch (error) {
        onError?.(error.message || 'Failed to delete location');
        throw error;
      }
    },
    [onError, onSuccess, refreshData]
  );

  const handleEdit = useCallback(
    id => {
      if (onEdit) {
        onEdit(id);
        return;
      }

      router.push(`/branches/branch-edit/${id}`);
    },
    [onEdit, router]
  );

  const handleView = useCallback(
    id => {
      if (onView) {
        onView(id);
        return;
      }

      router.push(`/branches/branch-view/${id}`);
    },
    [onView, router]
  );

  return {
    branches,
    pagination,
    summary,
    loading,
    sortBy,
    sortDirection,
    searchTerm,
    filters,
    refreshData,
    handleDelete,
    handleEdit,
    handleView,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleProvinceFilterChange,
    handleCityFilterChange,
  };
}
