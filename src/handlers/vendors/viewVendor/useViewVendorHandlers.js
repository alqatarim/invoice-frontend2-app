import { useCallback } from 'react';
import { useTabHandler } from './tabHandler';
import { useFormHandler } from './formHandler';
import { useLedgerHandler } from './ledgerHandler';
import { vendorStatusOptions, ledgerModes } from '@/data/dataSets';
import { formatCurrency } from '@/utils/currencyUtils';

export function useViewVendorHandlers({ vendorData, defaultTab = 'details', isDialog = true, onError, onSuccess }) {
  // Tab management
  const { currentTab, handleTabChange } = useTabHandler(defaultTab, isDialog);

  // Form management
  const {
    ledgerDialog,
    handleOpenLedgerDialog,
    handleCloseLedgerDialog,
    ledgerControl,
    handleLedgerSubmit,
    ledgerErrors,
    watchMode,
    submittingLedger,
    setSubmittingState,
    resetLedger
  } = useFormHandler();

  // Ledger data management
  const {
    ledgerData,
    ledgerPagination,
    ledgerLoading,
    handleLedgerPageChange,
    handleLedgerFormSubmit: ledgerFormSubmit,
    fetchLedgerData
  } = useLedgerHandler({
    vendorData,
    currentTab,
    onError,
    onSuccess
  });

  // Combined form submission handler
  const handleLedgerFormSubmit = useCallback(async (data) => {
    await ledgerFormSubmit(data, setSubmittingState, handleCloseLedgerDialog);
  }, [ledgerFormSubmit, setSubmittingState, handleCloseLedgerDialog]);

  return {
    // Tab state
    currentTab, 
    handleTabChange,

    // Ledger state
    ledgerData,
    ledgerPagination,
    ledgerLoading,
    handleLedgerPageChange,
    fetchLedgerData,

    // Ledger dialog
    ledgerDialog,
    handleOpenLedgerDialog,
    handleCloseLedgerDialog,

    // Ledger form
    ledgerControl,
    handleLedgerSubmit,
    ledgerErrors,
    watchMode,
    submittingLedger,
    handleLedgerFormSubmit,

    // Static data
    vendorStatusOptions,
    ledgerModes,
    formatCurrency
  };
}