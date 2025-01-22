'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PurchaseList from './PurchaseList';
import { getPurchaseList, getVendors } from '@/app/(dashboard)/purchases/actions';

const PurchaseListIndex = ({ initialData }) => {
  const [purchases, setPurchases] = useState(initialData?.data || []);
  const [totalCount, setTotalCount] = useState(initialData?.totalRecords || 0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

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
      setSnackbar({
        open: true,
        message: 'Error fetching vendors',
        severity: 'error'
      });
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await getPurchaseList(page, pageSize, '', filterCriteria);
      if (response.success) {
        setPurchases(response.data);
        setTotalCount(response.totalRecords);
      } else {
        setPurchases([]);
        setTotalCount(0);
        setSnackbar({
          open: true,
          message: response.message || 'Error fetching purchases',
          severity: 'error'
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching purchases:', error);
      setPurchases([]);
      setTotalCount(0);
      setSnackbar({
        open: true,
        message: 'Error fetching purchases',
        severity: 'error'
      });
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

  // Fetch purchases when dependencies change
  useEffect(() => {
    if (!initialData) {
      fetchPurchases();
    }
  }, [fetchPurchases, initialData]);

  const resetAllFilters = useCallback(() => {
    setFilterCriteria({});
    setPage(1);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <PurchaseList
        purchaseList={purchases}
        totalCount={totalCount}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        loading={loading}
        setFilterCriteria={setFilterCriteria}
        vendors={vendors}
        resetAllFilters={resetAllFilters}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PurchaseListIndex;