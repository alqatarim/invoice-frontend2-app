'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

export default function useAddVendorHandler({
  onClose,
  onError,
  onSave,
  schema = VendorSchema,
}) {
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

  const handleClose = useCallback(() => {
    reset(DEFAULT_VENDOR_FORM_VALUES);
    onClose?.();
  }, [onClose, reset]);

  const handleFormSubmit = useCallback(async data => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onSave(normalizeVendorSubmitData(data));

      if (result?.success) {
        reset(DEFAULT_VENDOR_FORM_VALUES);
        onClose?.();
      }
    } catch (error) {
      onError?.(error.message || 'Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onClose, onError, onSave, reset]);

  const handleValidationError = useCallback(() => {
    onError?.('Please fix the validation errors before submitting');
  }, [onError]);

  return {
    control,
    handleClose,
    handleFormSubmit,
    handleSubmit,
    handleValidationError,
    isSubmitting,
    errors,
    vendorBalanceTypes,
    watch,
  };
}
