import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Ledger schema
const LedgerSchema = yup.object().shape({
  name: yup.string().required('Description is required'),
  date: yup.date().required('Date is required'),
  reference: yup.string().optional(),
  mode: yup.string().required('Mode is required'),
  amount: yup.number().required('Amount is required').min(0.01, 'Amount must be greater than 0'),
});

export function useFormHandler() {
  const [ledgerDialog, setLedgerDialog] = useState(false);
  const [submittingLedger, setSubmittingLedger] = useState(false);

  // Ledger form
  const {
    control: ledgerControl,
    handleSubmit: handleLedgerSubmit,
    formState: { errors: ledgerErrors },
    reset: resetLedger,
    watch: watchLedger,
  } = useForm({
    resolver: yupResolver(LedgerSchema),
    defaultValues: {
      name: '',
      date: new Date(),
      reference: '',
      mode: 'Credit',
      amount: '',
    },
  });

  const watchMode = watchLedger('mode');

  const handleOpenLedgerDialog = useCallback(() => {
    setLedgerDialog(true);
  }, []);

  const handleCloseLedgerDialog = useCallback(() => {
    setLedgerDialog(false);
    resetLedger();
  }, [resetLedger]);

  const setSubmittingState = useCallback((state) => {
    setSubmittingLedger(state);
  }, []);

  return {
    // Dialog state
    ledgerDialog,
    handleOpenLedgerDialog,
    handleCloseLedgerDialog,

    // Form state
    ledgerControl,
    handleLedgerSubmit,
    ledgerErrors,
    watchMode,
    submittingLedger,
    setSubmittingState,
    resetLedger
  };
}