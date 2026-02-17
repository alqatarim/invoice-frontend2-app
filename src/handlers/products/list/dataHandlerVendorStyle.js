'use client'

import { useState, useCallback, useRef, useEffect } from 'react';
import { getProductList } from '@/app/(dashboard)/products/actions';

/**
 * Product list data handler aligned with vendor list behavior
 */
export function dataHandler({
  initialProducts = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
}) {
  // Data state management
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);

  // Use refs to access latest state values without causing re-renders
  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy,
    sortDirection,
    filters
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy,
      sortDirection,
      filters
    };
  }, [searchTerm, pagination, sortBy, sortDirection, filters]);

  // Fetch products data - using refs to avoid dependency issues
  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return; // Prevent multiple simultaneous calls
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      
      // Prepare API parameters using current state and params
      const {
        page = currentState.pagination.current,
        pageSize = currentState.pagination.pageSize,
        filters: paramFilters = currentState.filters,
        sortBy: paramSortBy = currentState.sortBy,
        sortDirection: paramSortDirection = currentState.sortDirection
      } = params;

      const response = await getProductList(page, pageSize);
      
      if (response.success) {
        const fetchedProducts = response.data || [];
        const fetchedPagination = {
          current: page,
          pageSize: pageSize,
          total: response.totalCount || 0
        };

        setProducts(fetchedProducts);
        setPagination(fetchedPagination);
        setSortBy(paramSortBy);
        setSortDirection(paramSortDirection);
        setFilters(paramFilters);

        return { products: fetchedProducts, pagination: fetchedPagination };
      } else {
        throw new Error(response.error || 'Failed to fetch products');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to fetch products');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  // Pagination handlers expect zero-based page index from table
  const handlePageChange = useCallback((newPageZeroBased) => {
    setPagination(prev => ({ ...prev, current: Number(newPageZeroBased) + 1 }));
    fetchData({ page: Number(newPageZeroBased) + 1 });
  }, []); // Remove fetchData dependency

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: Number(newPageSize), current: 1 }));
    fetchData({ page: 1, pageSize: Number(newPageSize) });
  }, []); // Remove fetchData dependency

  // Sorting accepts explicit direction from table
  const handleSort = useCallback((columnKey, direction) => {
    const currentState = stateRef.current;
    const params = {
      sortBy: columnKey,
      sortDirection: direction,
      page: 1 // Reset to first page on sort
    };
    
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(params);
  }, []); // Remove fetchData dependency

  // Search functionality with proper timeout cleanup
  const searchTimeoutRef = useRef(null);
  
  const handleSearchInputChange = useCallback((term) => {
    setSearchTerm(term);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      const currentState = stateRef.current;
      const searchFilters = term ? { search: term } : {};
      
      const params = {
        filters: { ...currentState.filters, ...searchFilters },
        page: 1 // Reset to first page on search
      };
      
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchData(params);
    }, 500);
  }, []); // Remove fetchData dependency

  // Filter functionality
  const applyFilters = useCallback((newFilters) => {
    const params = {
      filters: newFilters,
      page: 1 // Reset to first page on filter
    };
    
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(params);
  }, []); // Remove fetchData dependency

  const resetFilters = useCallback(() => {
    const params = {
      filters: {},
      sortBy: '',
      sortDirection: 'asc',
      page: 1
    };
    
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(params);
  }, []); // Remove fetchData dependency

  // Cleanup effect for search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    products,
    pagination,
    loading,
    sortBy,
    sortDirection,
    searchTerm,
    filters,

    // Actions
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleSearchInputChange,
    applyFilters,
    resetFilters,
  };
}