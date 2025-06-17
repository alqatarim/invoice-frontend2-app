'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDebitNotesList, getVendors } from '@/app/(dashboard)/debitNotes/actions';
import SimpleDebitNoteList from '@/views/debitNotes/listPurchaseReturn/SimpleDebitNoteList';

const PurchaseReturnListIndex = () => {
  const [allDebitNotes, setAllDebitNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});

  // Add AbortController for cleanup
  const abortControllerRef = useRef(null);

  // Memoized vendors fetch
  const fetchVendors = useCallback(async () => {
    try {
      const vendorsList = await getVendors();
      if (Array.isArray(vendorsList)) {
        setVendors(vendorsList);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  }, []);

  // Memoized debit notes fetch with abort controller
  const fetchDebitNotes = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await getDebitNotesList(
        page || 1,
        pageSize || 10

      );

      if (response?.success) {
        setAllDebitNotes(response.data || []);
        setTotalCount(response.totalRecords || 0);
      } else {
        setAllDebitNotes([]);
        setTotalCount(0);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching debit notes:', error);
      setAllDebitNotes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCriteria]);

  // Initial data fetch
  useEffect(() => {
    fetchVendors();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch debit notes when dependencies change
  useEffect(() => {
    fetchDebitNotes();
  }, [fetchDebitNotes]);

  const resetAllFilters = useCallback(() => {
    setFilterCriteria({});
    setPage(1);
  }, []);

  // Add handler for list updates
  const handleListUpdate = useCallback((updatedList, newTotalCount) => {
    setAllDebitNotes(updatedList);
    setTotalCount(newTotalCount);
  }, []);

  return (
    <SimpleDebitNoteList
      allDebitNotes={allDebitNotes}
      totalCount={totalCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      loading={loading}
      vendors={vendors}
    />
  );
};

export default PurchaseReturnListIndex;