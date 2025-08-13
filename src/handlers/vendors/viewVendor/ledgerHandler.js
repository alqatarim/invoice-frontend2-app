import { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { getVendorLedger, addLedgerEntry } from '@/app/(dashboard)/vendors/actions';

export function useLedgerHandler({ vendorData, currentTab, onError, onSuccess }) {
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerPagination, setLedgerPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchLedgerData = useCallback(async () => {
    if (!vendorData?._id) return;

    setLedgerLoading(true);
    try {
      const response = await getVendorLedger(vendorData._id, ledgerPagination.page, ledgerPagination.limit);
      if (response.success) {
        setLedgerData(response.data.ledgerEntries || []);
        setLedgerPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        onError?.(response.error || 'Failed to load ledger data');
        setLedgerData([]);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
      onError?.('Failed to load ledger data');
      setLedgerData([]);
    } finally {
      setLedgerLoading(false);
    }
  }, [vendorData?._id, ledgerPagination.page, ledgerPagination.limit, onError]);

  // Load ledger data when switching to ledger tab or page changes
  useEffect(() => {
    if (currentTab === 'ledger' && vendorData?._id) {
      fetchLedgerData();
    }
  }, [currentTab, vendorData?._id, ledgerPagination.page, fetchLedgerData]);

  const handleLedgerPageChange = useCallback((event, newPage) => {
    setLedgerPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLedgerFormSubmit = useCallback(async (data, setSubmittingState, handleCloseLedgerDialog) => {
    if (!vendorData?._id) return;

    setSubmittingState(true);
    try {
      const submitData = {
        name: data.name,
        date: moment(data.date).format('YYYY-MM-DD'),
        reference: data.reference || '',
        amount: parseFloat(data.amount),
        mode: data.mode,
        vendorId: vendorData._id,
      };

      const response = await addLedgerEntry(submitData);

      if (response.success) {
        onSuccess?.('Ledger entry added successfully');
        handleCloseLedgerDialog();
        // Reset pagination to page 1 and refresh data
        setLedgerPagination(prev => ({ ...prev, page: 1 }));
        fetchLedgerData();
      } else {
        onError?.(response.error || 'Failed to add ledger entry');
      }
    } catch (error) {
      console.error('Error adding ledger entry:', error);
      onError?.('Failed to add ledger entry');
    } finally {
      setSubmittingState(false);
    }
  }, [vendorData?._id, onSuccess, onError, fetchLedgerData]);

  const calculateRunningBalance = useCallback((entries) => {
    let balance = vendorData?.balance || 0;
    return entries.map(entry => {
      const amount = entry.amount || 0;
      if (entry.mode === 'Credit') {
        balance += amount;
      } else {
        balance -= amount;
      }
      return { ...entry, runningBalance: balance };
    });
  }, [vendorData?.balance]);

  return {
    // Data state
    ledgerData: calculateRunningBalance(ledgerData),
    ledgerPagination,
    ledgerLoading,

    // Actions
    handleLedgerPageChange,
    handleLedgerFormSubmit,
    fetchLedgerData
  };
}