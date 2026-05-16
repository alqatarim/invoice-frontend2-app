'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getBranchInventory } from '@/app/(dashboard)/branches/actions';
import {
  addStock,
  cycleCountStock,
  getFilteredInventory,
  removeStock,
  transferStock,
} from '@/app/(dashboard)/inventory/actions';

function useInventoryFilters(initialFilters = {}) {
  const [filterValues, setFilterValues] = useState({
    product: [],
    ...initialFilters,
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const updateFilter = useCallback((field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterValues({ product: [] });
  }, []);

  const hasActiveFilters = useCallback(
    () => Boolean(filterValues.product?.length > 0),
    [filterValues.product]
  );

  const getActiveFilterCount = useCallback(
    () => [filterValues.product?.length > 0].filter(Boolean).length,
    [filterValues.product]
  );

  const toggleFilter = useCallback(() => {
    setFilterOpen(prev => !prev);
  }, []);

  return {
    filterValues,
    setFilterValues,
    filterOpen,
    setFilterOpen,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount,
    toggleFilter,
  };
}

function useInventoryDataHandler({
  initialInventory = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
}) {
  const [inventory, setInventory] = useState(initialInventory);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const loadingRef = useRef(false);
  const filters = useInventoryFilters(initialFilters);

  const stateRef = useRef({
    searchTerm,
    pagination,
    sorting,
    filterValues: filters.filterValues,
  });

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sorting,
      filterValues: filters.filterValues,
    };
  }, [filters.filterValues, pagination, searchTerm, sorting]);

  const fetchData = useCallback(
    async (params = {}) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const currentState = stateRef.current;
        const {
          page = currentState.pagination.current,
          pageSize = currentState.pagination.pageSize,
          filters: nextFilters = currentState.filterValues,
          sortBy = currentState.sorting.sortBy,
          sortDirection = currentState.sorting.sortDirection,
          search = currentState.searchTerm,
        } = params;

        const response = await getFilteredInventory(
          page,
          pageSize,
          nextFilters,
          sortBy,
          sortDirection,
          search
        );

        const nextInventory = response?.inventory || [];
        const nextPagination = {
          current: page,
          pageSize,
          total: response?.pagination?.total || 0,
        };

        setInventory(nextInventory);
        setPagination(nextPagination);
        setSorting({ sortBy, sortDirection });

        return {
          inventory: nextInventory,
          pagination: nextPagination,
        };
      } catch (error) {
        console.error('fetchData error:', error);
        onError?.(error.message || 'Failed to fetch inventory');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError]
  );

  const handlePageChange = useCallback(
    (eventOrPage, maybePage) => {
      const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
      if (typeof nextPage !== 'number') return;
      fetchData({ page: nextPage + 1 });
    },
    [fetchData]
  );

  const handlePageSizeChange = useCallback(
    eventOrSize => {
      const nextSize =
        typeof eventOrSize === 'number'
          ? eventOrSize
          : parseInt(eventOrSize.target.value, 10);

      if (!Number.isFinite(nextSize)) return;

      fetchData({ page: 1, pageSize: nextSize });
    },
    [fetchData]
  );

  const handleSortRequest = useCallback(
    columnKey => {
      const currentSorting = stateRef.current.sorting;
      const nextDirection =
        currentSorting.sortBy === columnKey && currentSorting.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      fetchData({ page: 1, sortBy: columnKey, sortDirection: nextDirection });

      return {
        sortBy: columnKey,
        sortDirection: nextDirection,
      };
    },
    [fetchData]
  );

  const handleFilterValueChange = useCallback(
    nextFilters => {
      filters.setFilterValues(nextFilters);
    },
    [filters]
  );

  const handleFilterApply = useCallback(
    currentFilters => {
      fetchData({
        page: 1,
        filters: currentFilters || stateRef.current.filterValues,
      });
    },
    [fetchData]
  );

  const handleFilterReset = useCallback(() => {
    filters.resetFilters();
    setSearchTerm('');
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc', search: '' });
    filters.setFilterOpen(false);
  }, [fetchData, filters]);

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) return;

      setSearching(true);
      setSearchTerm(value);

      try {
        await fetchData({ search: value, page: 1 });
      } catch (error) {
        console.error('Error searching inventory:', error);
        onError?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fetchData, onError]
  );

  const handleSearchSubmit = useCallback(
    async event => {
      event.preventDefault();
      setSearching(true);

      try {
        await fetchData({ search: stateRef.current.searchTerm, page: 1 });
      } catch (error) {
        console.error('Error submitting search:', error);
        onError?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fetchData, onError]
  );

  const handleSearchClear = useCallback(async () => {
    setSearchTerm('');
    setSearching(true);

    try {
      await fetchData({ search: '', page: 1 });
    } catch (error) {
      console.error('Error clearing search:', error);
      onError?.(error.message || 'Failed to clear search');
    } finally {
      setSearching(false);
    }
  }, [fetchData, onError]);

  return {
    inventory,
    pagination,
    loading,
    ...sorting,
    searchTerm,
    searching,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,
    ...filters,
  };
}

function useInventoryActionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  const [loading, setLoading] = useState({
    addStock: false,
    removeStock: false,
    transferStock: false,
    cycleCount: false,
  });
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const executeAction = useCallback(
    async (actionFn, successMessage, loadingKey) => {
      if (loadingRef.current[loadingKey]) {
        return;
      }

      loadingRef.current = {
        ...loadingRef.current,
        [loadingKey]: true,
      };
      setLoading(prev => ({ ...prev, [loadingKey]: true }));

      try {
        const result = await actionFn();
        onSuccess?.(successMessage);

        if (fetchData) {
          await fetchData({
            page: pagination?.current,
            filters,
          });
        }

        return result;
      } catch (error) {
        onError?.(error.message || 'Action failed');
        throw error;
      } finally {
        loadingRef.current = {
          ...loadingRef.current,
          [loadingKey]: false,
        };
        setLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    },
    [fetchData, filters, onError, onSuccess, pagination?.current]
  );

  return {
    loading,
    handleAddStock: stockData =>
      executeAction(() => addStock(stockData), 'Stock added successfully!', 'addStock'),
    handleRemoveStock: stockData =>
      executeAction(() => removeStock(stockData), 'Stock removed successfully!', 'removeStock'),
    handleTransferStock: transferData =>
      executeAction(
        () => transferStock(transferData),
        'Stock transferred successfully!',
        'transferStock'
      ),
    handleCycleCount: cycleCountData =>
      executeAction(
        () => cycleCountStock(cycleCountData),
        'Cycle count recorded successfully!',
        'cycleCount'
      ),
  };
}

function useBranchInventoryDataHandler({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
} = {}) {
  const [branches, setBranches] = useState(initialBranches);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
  });
  const [filterValues, setFilterValues] = useState({
    searchBranch: '',
    searchProduct: '',
    branchType: '',
    status: '',
  });
  const loadingRef = useRef(false);

  const stateRef = useRef({
    pagination,
    sorting,
    filterValues,
  });

  useEffect(() => {
    stateRef.current = {
      pagination,
      sorting,
      filterValues,
    };
  }, [filterValues, pagination, sorting]);

  const fetchData = useCallback(
    async (params = {}) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const currentState = stateRef.current;
        const {
          page = currentState.pagination.current,
          pageSize = currentState.pagination.pageSize,
          sortBy = currentState.sorting.sortBy,
          sortDirection = currentState.sorting.sortDirection,
          filters = currentState.filterValues,
        } = params;

        const response = await getBranchInventory(
          page,
          pageSize,
          {
            search_branch: filters.searchBranch,
            search_product: filters.searchProduct,
            branchType: filters.branchType,
            status: filters.status,
          },
          sortBy,
          sortDirection
        );

        const nextBranches = response?.branches || [];
        const nextPagination = {
          current: page,
          pageSize,
          total: response?.pagination?.total || 0,
        };

        setBranches(nextBranches);
        setPagination(nextPagination);
        setSorting({ sortBy, sortDirection });

        return {
          branches: nextBranches,
          pagination: nextPagination,
        };
      } catch (error) {
        console.error('fetchBranchInventory error:', error);
        onError?.(error.message || 'Failed to fetch branch inventory');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError]
  );

  const handlePageChange = useCallback(
    (eventOrPage, maybePage) => {
      const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
      if (typeof nextPage !== 'number') return;
      fetchData({ page: nextPage + 1 });
    },
    [fetchData]
  );

  const handlePageSizeChange = useCallback(
    eventOrSize => {
      const nextSize =
        typeof eventOrSize === 'number'
          ? eventOrSize
          : parseInt(eventOrSize.target.value, 10);

      if (!Number.isFinite(nextSize)) return;

      fetchData({ page: 1, pageSize: nextSize });
    },
    [fetchData]
  );

  const handleSortRequest = useCallback(
    columnKey => {
      const currentSorting = stateRef.current.sorting;
      const nextDirection =
        currentSorting.sortBy === columnKey && currentSorting.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      fetchData({ page: 1, sortBy: columnKey, sortDirection: nextDirection });

      return {
        sortBy: columnKey,
        sortDirection: nextDirection,
      };
    },
    [fetchData]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.filterValues.searchBranch) return;

      const nextFilters = {
        ...stateRef.current.filterValues,
        searchBranch: value,
      };

      setFilterValues(nextFilters);

      try {
        await fetchData({ filters: nextFilters, page: 1 });
      } catch (error) {
        console.error('Error searching branch inventory:', error);
        onError?.(error.message || 'Search failed');
      }
    },
    [fetchData, onError]
  );

  const handleFilterChange = useCallback(
    async (field, value) => {
      const nextFilters = {
        ...stateRef.current.filterValues,
        [field]: value,
      };

      setFilterValues(nextFilters);

      try {
        await fetchData({ filters: nextFilters, page: 1 });
      } catch (error) {
        console.error('Error updating branch inventory filters:', error);
        onError?.(error.message || 'Failed to update filters');
      }
    },
    [fetchData, onError]
  );

  const resetFilters = useCallback(async () => {
    const nextFilters = {
      searchBranch: '',
      searchProduct: '',
      branchType: '',
      status: '',
    };

    setFilterValues(nextFilters);

    try {
      await fetchData({ filters: nextFilters, page: 1, sortBy: '', sortDirection: 'asc' });
    } catch (error) {
      console.error('Error resetting branch inventory filters:', error);
      onError?.(error.message || 'Failed to reset filters');
    }
  }, [fetchData, onError]);

  return {
    branches,
    pagination,
    loading,
    ...sorting,
    searchTerm: filterValues.searchBranch,
    filterValues,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleFilterChange,
    resetFilters,
  };
}

export function useInventoryListHandlers(options = {}) {
  const data = useInventoryDataHandler(options);
  const actions = useInventoryActionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    filters: data.filterValues,
  });

  return useMemo(
    () => ({
      inventory: data.inventory,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,
      searchTerm: data.searchTerm,
      handleSearchInputChange: data.handleSearchInputChange,
      handlePageChange: data.handlePageChange,
      handlePageSizeChange: data.handlePageSizeChange,
      handleSortRequest: data.handleSortRequest,
      handleAddStock: actions.handleAddStock,
      handleRemoveStock: actions.handleRemoveStock,
      handleTransferStock: actions.handleTransferStock,
      handleCycleCount: actions.handleCycleCount,
      stockLoading: actions.loading,
    }),
    [actions, data]
  );
}

export function useBranchInventoryHandlers(options = {}) {
  const data = useBranchInventoryDataHandler(options);

  return useMemo(
    () => ({
      branches: data.branches,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,
      searchTerm: data.searchTerm,
      filterValues: data.filterValues,
      fetchData: data.fetchData,
      handleSearchInputChange: data.handleSearchInputChange,
      handleFilterChange: data.handleFilterChange,
      resetFilters: data.resetFilters,
      handlePageChange: data.handlePageChange,
      handlePageSizeChange: data.handlePageSizeChange,
      handleSortRequest: data.handleSortRequest,
    }),
    [data]
  );
}
