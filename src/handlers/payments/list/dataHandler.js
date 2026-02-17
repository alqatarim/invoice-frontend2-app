'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPaymentsList } from '@/app/(dashboard)/payments/actions';
import { filterHandler } from './filterHandler';

/**
 * Data handler for payment list
 */
export function dataHandler({
     initialPayments = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialSortBy = '',
     initialSortDirection = 'asc',
     initialCustomerOptions = [],
     setCustomerOptions,
     handleCustomerSearch,
     onError,
     onSuccess,
}) {
     // Initialize filter handler
     const filters = filterHandler();
     const [payments, setPayments] = useState(initialPayments);
     const [pagination, setPagination] = useState(() => {
          // Ensure total matches initial data length if provided
          const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
          if (initialPayments && initialPayments.length > 0 && basePagination.total === 0) {
               return { ...basePagination, total: initialPayments.length };
          }
          return basePagination;
     });
     const [loading, setLoading] = useState(false);
     const [sorting, setSorting] = useState({
          sortBy: initialSortBy,
          sortDirection: initialSortDirection
     });
     const loadingRef = useRef(false);

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

     // Fetch payments with current or provided parameters
     const fetchData = useCallback(async (params = {}) => {
          if (loadingRef.current) return;
          loadingRef.current = true;

          const {
               page = pagination.current,
               pageSize = pagination.pageSize,
          } = params;

          setLoading(true);
          try {
               const response = await getPaymentsList(page, pageSize);

               if (response.success) {
                    setPayments(response.data);
                    setPagination({
                         current: page,
                         pageSize,
                         total: response.totalRecords
                    });

                    // Update full dataset for search functionality
                    setFullDataset(response.data);

                    return { payments: response.data, pagination: { current: page, pageSize, total: response.totalRecords } };
               } else {
                    throw new Error(response.message);
               }
          } catch (error) {
               console.error('fetchData error:', error);
               onError?.(error.message || 'Failed to fetch payments');
               throw error;
          } finally {
               setLoading(false);
               loadingRef.current = false;
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
     const [fullDataset, setFullDataset] = useState(initialPayments);

     // Search handlers - works with current dataset for local filtering
     const handleSearchInputChange = useCallback(async (value) => {
          // Don't do anything if the value hasn't actually changed
          if (value === stateRef.current.searchTerm) return;

          setSearching(true);
          setSearchTerm(value);

          try {
               // Use the full dataset for filtering
               const dataToFilter = fullDataset.length > 0 ? fullDataset : payments;

               if (value.trim() === '') {
                    // Reset to full dataset when search is cleared
                    setPayments(dataToFilter);
                    setPagination(prev => ({
                         ...prev,
                         current: 1,
                         total: dataToFilter.length
                    }));
               } else {
                    // Filter current dataset locally
                    const filtered = dataToFilter.filter(item =>
                         item.paymentNumber?.toLowerCase().includes(value.toLowerCase()) ||
                         item.customerInfo?.name?.toLowerCase().includes(value.toLowerCase()) ||
                         item.payment_method?.toLowerCase().includes(value.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(value.toLowerCase())
                    );
                    setPayments(filtered);
                    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
               }
          } catch (error) {
               console.error('Error searching payments:', error);
               onError?.(error.message || 'Search failed');
          } finally {
               setSearching(false);
          }
     }, [onError, fullDataset, payments]);

     const handleSearchSubmit = useCallback((value) => {
          handleSearchInputChange(value);
     }, [handleSearchInputChange]);

     const handleSearchClear = useCallback(() => {
          handleSearchInputChange('');
     }, [handleSearchInputChange]);

     // Set initial customer options on mount
     useEffect(() => {
          if (initialCustomerOptions?.length > 0 && setCustomerOptions) {
               setCustomerOptions(initialCustomerOptions);
          }
     }, []); // eslint-disable-line react-hooks/exhaustive-deps

     return {
          // State
          payments,
          pagination,
          loading,
          ...sorting,

          // Search state
          searchTerm,
          searching,

          // Filter state and handlers
          ...filters,

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