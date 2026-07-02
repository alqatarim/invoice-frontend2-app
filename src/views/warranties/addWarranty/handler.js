'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { warrantySchema } from '../warrantySchema';

const getTodayInputDate = () => {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export const buildWarrantyFormDefaultValues = () => ({
  productId: '',
  policyId: '',
  customerId: '',
  requiresSerialNumber: false,
  quantity: 1,
  serialNumber: '',
  startDate: getTodayInputDate(),
  notes: '',
});

export const DEFAULT_WARRANTY_FORM_VALUES = buildWarrantyFormDefaultValues();

const normalizeWarrantySubmitData = data => {
  const { requiresSerialNumber: _requiresSerialNumber, ...payload } = data;

  return {
    ...payload,
    customerId: payload.customerId || null,
    quantity: Number(payload.quantity || 1),
  };
};

export default function useAddWarrantyHandler({
  onClose,
  onError,
  onSave,
  schema = warrantySchema,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: buildWarrantyFormDefaultValues(),
  });

  const handleClose = useCallback(() => {
    reset(buildWarrantyFormDefaultValues());
    onClose?.();
  }, [onClose, reset]);

  const handleFormSubmit = useCallback(async data => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await onSave(normalizeWarrantySubmitData(data));

      if (result?.success) {
        reset(buildWarrantyFormDefaultValues());
        onClose?.();
      }
    } catch (error) {
      onError?.(error.message || 'Failed to create warranty');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [onClose, onError, onSave, reset]);

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
    setValue,
  };
}
