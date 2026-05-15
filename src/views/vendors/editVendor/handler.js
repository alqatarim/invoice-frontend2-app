'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { getVendorById } from '@/app/(dashboard)/vendors/actions';
import { vendorBalanceTypes } from '@/data/dataSets';
import { VendorSchema } from '@/views/vendors/VendorSchema';

const DEFAULT_VENDOR_FORM_VALUES = {
  vendor_name: '',
  vendor_email: '',
  vendor_phone: '',
  balance: '',
  balanceType: 'Credit',
  status: true,
};

const createVendorFormDefaults = (vendorData = null) => {
  if (!vendorData) return DEFAULT_VENDOR_FORM_VALUES;

  const rawBalance = vendorData.openingBalance ?? vendorData.balance ?? 0;
  const rawBalanceType = vendorData.openingBalanceType ?? vendorData.balanceType ?? 'Credit';
  const absoluteBalance = Math.abs(rawBalance);
  const resolvedType = rawBalance < 0 ? 'Debit' : rawBalanceType;

  return {
    vendor_name: vendorData.vendor_name || '',
    vendor_email: vendorData.vendor_email || '',
    vendor_phone: vendorData.vendor_phone || '',
    balance: absoluteBalance || '',
    balanceType: resolvedType,
    status: vendorData.status !== undefined ? vendorData.status : true,
  };
};

const normalizeVendorSubmitData = data => {
  const rawBalance = data.balance ? parseFloat(data.balance) : 0;
  const absoluteBalance = Math.abs(rawBalance);
  const resolvedType = rawBalance < 0 ? 'Debit' : data.balanceType;

  const submitData = {
    ...data,
    balance: absoluteBalance,
    balanceType: resolvedType,
  };

  if (!submitData.balance || submitData.balance === 0) {
    delete submitData.balanceType;
  }

  return submitData;
};

export default function useEditVendorHandler({
  open,
  vendorId,
  initialVendorData = null,
  onClose,
  onError,
  onSave,
  schema = VendorSchema,
}) {
  const [vendorData, setVendorData] = useState(initialVendorData);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VENDOR_FORM_VALUES,
  });

  useEffect(() => {
    if (!open) {
      setVendorData(null);
      reset(DEFAULT_VENDOR_FORM_VALUES);
      return;
    }

    const fetchVendorData = async () => {
      if (!vendorId) return;

      if (initialVendorData && initialVendorData._id === vendorId) {
        setVendorData(initialVendorData);
        reset(createVendorFormDefaults(initialVendorData));
        return;
      }

      setLoading(true);
      try {
        const data = await getVendorById(vendorId);
        setVendorData(data);
        reset(createVendorFormDefaults(data));
      } catch (error) {
        setVendorData(null);
        onError?.(error.message || 'Failed to fetch vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [initialVendorData, onError, open, reset, vendorId]);

  const handleClose = useCallback(() => {
    setVendorData(null);
    reset(DEFAULT_VENDOR_FORM_VALUES);
    onClose?.();
  }, [onClose, reset]);

  const handleFormSubmit = useCallback(async data => {
    if (isSubmitting || !vendorId) return;

    setIsSubmitting(true);
    try {
      const result = await onSave(vendorId, normalizeVendorSubmitData(data));

      if (result?.success) {
        handleClose();
      }
    } catch (error) {
      onError?.(error.message || 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  }, [handleClose, isSubmitting, onError, onSave, vendorId]);

  const handleValidationError = useCallback(() => {
    onError?.('Please fix the validation errors before submitting');
  }, [onError]);

  return {
    control,
    errors,
    handleClose,
    handleFormSubmit,
    handleSubmit,
    handleValidationError,
    isSubmitting,
    loading,
    vendorBalanceTypes,
    vendorData,
    watch,
  };
}
