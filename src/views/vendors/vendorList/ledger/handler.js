'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  addLedgerEntry,
  deleteLedgerEntry,
  getVendorById,
  getVendorLedger,
  updateLedgerEntry,
} from '@/app/(dashboard)/vendors/actions';
import { formatDateForInput } from '@/utils/dateUtils';

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0 };
const NEW_ROW_ID = '__new_ledger_row__';

const getTodayInputDate = () => formatDateForInput(new Date());

const formatInputDate = value => formatDateForInput(value) || getTodayInputDate();

const createEmptyDraft = () => ({
  name: '',
  reference: '',
  date: getTodayInputDate(),
  mode: 'Credit',
  amount: '',
});

const createDraftFromEntry = entry => ({
  name: entry?.name || '',
  reference: entry?.reference || '',
  date: formatInputDate(entry?.date),
  mode: entry?.mode || 'Credit',
  amount: entry?.amount ?? '',
});

const validateDraft = draft => {
  const errors = {};

  if (!String(draft.name || '').trim()) {
    errors.name = 'Name is required';
  }

  if (!draft.date) {
    errors.date = 'Valid date is required';
  }

  if (!draft.mode) {
    errors.mode = 'Mode is required';
  }

  const amount = Number(draft.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  return errors;
};

const normalizeLedgerPayload = (draft, vendorId) => ({
  name: String(draft.name || '').trim(),
  date: draft.date,
  reference: String(draft.reference || '').trim(),
  amount: Number(draft.amount),
  mode: draft.mode,
  vendorId,
});

export function useVendorLedgerHandler({
  open,
  vendorId,
  onChanged,
  onError,
  onSuccess,
}) {
  const [vendor, setVendor] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerPagination, setLedgerPagination] = useState(DEFAULT_PAGINATION);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [inlineRow, setInlineRow] = useState(null);
  const [submittingLedger, setSubmittingLedger] = useState(false);

  const fetchVendor = useCallback(async () => {
    if (!open || !vendorId) return;

    setVendorLoading(true);
    try {
      const data = await getVendorById(vendorId);
      setVendor(data);
    } catch (error) {
      setVendor(null);
      onError?.(error.message || 'Failed to fetch vendor data');
    } finally {
      setVendorLoading(false);
    }
  }, [open, vendorId, onError]);

  const fetchLedgerData = useCallback(async (params = {}) => {
    if (!open || !vendorId) return;

    const page = params.page ?? ledgerPagination.page;
    const limit = params.limit ?? ledgerPagination.limit;

    setLedgerLoading(true);
    try {
      const response = await getVendorLedger(vendorId, page, limit);

      if (response.success) {
        setLedgerData(response.data?.ledgerEntries || []);
        setLedgerPagination(prev => ({
          ...prev,
          page,
          limit,
          total: response.data?.total || 0,
        }));
      } else {
        setLedgerData([]);
        onError?.(response.error || 'Failed to load ledger data');
      }
    } catch (error) {
      setLedgerData([]);
      onError?.(error.message || 'Failed to load ledger data');
    } finally {
      setLedgerLoading(false);
    }
  }, [open, vendorId, ledgerPagination.page, ledgerPagination.limit, onError]);

  useEffect(() => {
    if (!open) {
      setVendor(null);
      setLedgerData([]);
      setLedgerPagination(DEFAULT_PAGINATION);
      setInlineRow(null);
      return;
    }

    fetchVendor();
  }, [open, fetchVendor]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const handleLedgerPageChange = useCallback((event, newPage) => {
    setInlineRow(null);
    setLedgerPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const startAddRow = useCallback(() => {
    setInlineRow({
      mode: 'add',
      entryId: NEW_ROW_ID,
      draft: createEmptyDraft(),
      errors: {},
    });
  }, []);

  const startEditRow = useCallback(entry => {
    if (!entry?._id) return;

    setInlineRow({
      mode: 'edit',
      entryId: entry._id,
      draft: createDraftFromEntry(entry),
      errors: {},
    });
  }, []);

  const cancelInlineRow = useCallback(() => {
    if (submittingLedger) return;
    setInlineRow(null);
  }, [submittingLedger]);

  const updateInlineDraft = useCallback((field, value) => {
    setInlineRow(current => {
      if (!current) return current;

      const nextErrors = { ...current.errors };
      delete nextErrors[field];

      return {
        ...current,
        draft: {
          ...current.draft,
          [field]: value,
        },
        errors: nextErrors,
      };
    });
  }, []);

  const saveInlineRow = useCallback(async () => {
    if (!vendorId || !inlineRow) return;

    const errors = validateDraft(inlineRow.draft);
    if (Object.keys(errors).length > 0) {
      setInlineRow(current => current ? { ...current, errors } : current);
      return;
    }

    setSubmittingLedger(true);
    try {
      const payload = normalizeLedgerPayload(inlineRow.draft, vendorId);
      const response =
        inlineRow.mode === 'edit'
          ? await updateLedgerEntry(inlineRow.entryId, payload)
          : await addLedgerEntry(payload);

      if (response.success) {
        onSuccess?.(inlineRow.mode === 'edit' ? 'Ledger entry updated successfully' : 'Ledger entry added successfully');
        setInlineRow(null);

        const nextPage = inlineRow.mode === 'add' ? 1 : ledgerPagination.page;
        await fetchLedgerData({ page: nextPage });
        await onChanged?.();
      } else {
        onError?.(response.error || 'Failed to save ledger entry');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to save ledger entry');
    } finally {
      setSubmittingLedger(false);
    }
  }, [
    fetchLedgerData,
    inlineRow,
    ledgerPagination.page,
    onChanged,
    onError,
    onSuccess,
    vendorId,
  ]);

  const handleDeleteLedger = useCallback(async entry => {
    if (!entry?._id) return;

    const shouldDelete = window.confirm('Delete this ledger entry?');
    if (!shouldDelete) return;

    try {
      const response = await deleteLedgerEntry(entry._id);

      if (response.success) {
        onSuccess?.('Ledger entry deleted successfully');
        await fetchLedgerData();
        await onChanged?.();
      } else {
        onError?.(response.error || 'Failed to delete ledger entry');
      }
    } catch (error) {
      onError?.(error.message || 'Failed to delete ledger entry');
    }
  }, [fetchLedgerData, onChanged, onError, onSuccess]);

  const isLoading = vendorLoading || (ledgerLoading && ledgerData.length === 0);
  const totalPages = useMemo(
    () => Math.ceil((ledgerPagination.total || 0) / ledgerPagination.limit),
    [ledgerPagination.limit, ledgerPagination.total]
  );

  return {
    vendor,
    ledgerData,
    ledgerPagination,
    totalPages,
    isLoading,
    ledgerLoading,
    inlineRow,
    submittingLedger,
    handleLedgerPageChange,
    startAddRow,
    startEditRow,
    cancelInlineRow,
    updateInlineDraft,
    saveInlineRow,
    handleDeleteLedger,
  };
}
