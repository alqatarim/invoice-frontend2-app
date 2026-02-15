'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPurchaseList } from '@/app/(dashboard)/purchases/actions';

/**
 * Data handler for purchase list
 */
export function dataHandler({
     initialPurchases = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialSortBy = '',
     initialSortDirection = 'asc',
     onError,
     onSuccess,
}) {
     const [purchases, setPurchases] = useState(initialPurchases);
     const [pagination, setPagination] = useState(() => {
          // Ensure total matches initial data length if provided
          const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
          if (initialPurchases && initialPurchases.length > 0 && basePagination.total === 0) {
               return { ...basePagination, total: initialPurchases.length };
          }
          return basePagination;
     });
     const [loading, setLoading] = useState(false);
     const [sorting, setSorting] = useState({
          sortBy: initialSortBy,
          sortDirection: initialSortDirection
     });

     // Search state management
     const [searchTerm, setSearchTerm] = useState('');
     const [searching, setSearching] = useState(false);

     // Use refs to access latest state values without causing re-renders
     const stateRef = useRef({
          searchTerm,
          pagination,
          sortBy: sorting.sortBy,
          sortDirection: sorting.sortDirection
     });

     // Update refs when state changes
     useEffect(() => {
          stateRef.current = {
               searchTerm,
               pagination,
               sortBy: sorting.sortBy,
               sortDirection: sorting.sortDirection
          };
     }, [searchTerm, pagination, sorting.sortBy, sorting.sortDirection]);

     // Fetch purchases with current or provided parameters
     const fetchData = useCallback(async (params = {}) => {
          const {
               page = pagination.current,
               pageSize = pagination.pageSize,
          } = params;

          setLoading(true);
          try {
               const response = await getPurchaseList(page, pageSize, '', {});

               if (response.success) {
                    setPurchases(response.data);
                    setPagination({
                         current: page,
                         pageSize,
                         total: response.totalRecords
                    });

                    // Update full dataset for search functionality
                    setFullDataset(response.data);

                    return { purchases: response.data, pagination: { current: page, pageSize, total: response.totalRecords } };
               } else {
                    throw new Error(response.message);
               }
          } catch (error) {
               console.error('fetchData error:', error);
               onError?.(error.message || 'Failed to fetch purchases');
               throw error;
          } finally {
               setLoading(false);
          }
     }, [pagination, onError]);

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

     const handleSortRequest = useCallback((columnKey, direction) => {
          const newDirection = direction || (sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc');
          fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
          return { sortBy: columnKey, sortDirection: newDirection };
     }, [sorting, fetchData]);

     // Keep a reference to the full dataset for search functionality
     const [fullDataset, setFullDataset] = useState(initialPurchases);

     // Search handlers - works with current dataset for local filtering
     const handleSearchInputChange = useCallback(async (value) => {
          // Don't do anything if the value hasn't actually changed
          if (value === stateRef.current.searchTerm) return;

          setSearching(true);
          setSearchTerm(value);

          try {
               // Use the full dataset for filtering
               const dataToFilter = fullDataset.length > 0 ? fullDataset : purchases;

               if (value.trim() === '') {
                    // Reset to full dataset when search is cleared
                    setPurchases(dataToFilter);
                    setPagination(prev => ({
                         ...prev,
                         current: 1,
                         total: dataToFilter.length
                    }));
               } else {
                    // Filter current dataset locally
                    const filtered = dataToFilter.filter(item =>
                         item.purchaseId?.toLowerCase().includes(value.toLowerCase()) ||
                         item.vendorInfo?.vendor_name?.toLowerCase().includes(value.toLowerCase()) ||
                         item.vendorInfo?.phone?.includes(value) ||
                         item.notes?.toLowerCase().includes(value.toLowerCase()) ||
                         item.supplierInvoiceSerialNumber?.toLowerCase().includes(value.toLowerCase())
                    );
                    setPurchases(filtered);
                    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
               }
          } catch (error) {
               console.error('Error searching purchases:', error);
               onError?.(error.message || 'Search failed');
          } finally {
               setSearching(false);
          }
     }, [onError, fullDataset, purchases]);

     const handleSearchSubmit = useCallback((value) => {
          handleSearchInputChange(value);
     }, [handleSearchInputChange]);

     const handleSearchClear = useCallback(() => {
          handleSearchInputChange('');
     }, [handleSearchInputChange]);

     // Initial data fetch on mount
     useEffect(() => {
          if (initialPurchases.length === 0) {
               fetchData();
          }
     }, []); // eslint-disable-line react-hooks/exhaustive-deps

     return {
          // State
          purchases,
          pagination,
          loading,
          ...sorting,

          // Search state
          searchTerm,
          searching,

          // Handlers
          fetchData,
          handlePageChange,
          handlePageSizeChange,
          handleSortRequest,

          // Search handlers
          handleSearchInputChange,
          handleSearchSubmit,
          handleSearchClear,
     };
}
