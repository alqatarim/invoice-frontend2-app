'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory, getFilteredCategories } from '@/app/(dashboard)/categories/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

export function useCategoryListHandler({
  initialCategories = [],
  initialPagination = DEFAULT_PAGINATION,
  onError,
  onSuccess,
  onEdit,
  onView,
}) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchCategories = useCallback(
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

        const result = await getFilteredCategories(
          page,
          pageSize,
          nextFilters,
          nextSortBy,
          nextSortDirection
        );

        setCategories(result?.categories || []);
        setPagination(result?.pagination || DEFAULT_PAGINATION);
        setSortBy(nextSortBy);
        setSortDirection(nextSortDirection);
        setFilters(nextFilters);

        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to fetch categories');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError]
  );

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchCategories({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      filters: currentState.filters,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
    });
  }, [fetchCategories]);

  const handlePageChange = useCallback(
    newPageZeroBased => {
      const nextPage = Number(newPageZeroBased) + 1;

      if (!Number.isFinite(nextPage)) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: nextPage,
      }));

      fetchCategories({ page: nextPage });
    },
    [fetchCategories]
  );

  const handlePageSizeChange = useCallback(
    newPageSize => {
      const pageSize = Number(newPageSize);

      if (!Number.isFinite(pageSize) || pageSize <= 0) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: 1,
        pageSize,
      }));

      fetchCategories({ page: 1, pageSize });
    },
    [fetchCategories]
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

      fetchCategories({
        page: 1,
        sortBy: columnKey,
        sortDirection: nextDirection,
      });
    },
    [fetchCategories]
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
        nextFilters.search_category = trimmedValue;
      } else {
        delete nextFilters.search_category;
      }

      try {
        await fetchCategories({
          page: 1,
          filters: nextFilters,
        });
      } catch (error) {
        onError?.(error.message || 'Search failed');
      }
    },
    [fetchCategories, onError]
  );

  const handleDelete = useCallback(
    async id => {
      try {
        const response = await deleteCategory(id);

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to delete category');
        }

        onSuccess?.('Category deleted successfully!');
        await refreshData();

        return response;
      } catch (error) {
        onError?.(error.message || 'Failed to delete category');
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

      router.push(`/categories/category-edit/${id}`);
    },
    [onEdit, router]
  );

  const handleView = useCallback(
    id => {
      if (onView) {
        onView(id);
      }
    },
    [onView]
  );

  return {
    categories,
    pagination,
    loading,
    sortBy,
    sortDirection,
    searchTerm,
    refreshData,
    handleDelete,
    handleEdit,
    handleView,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}
