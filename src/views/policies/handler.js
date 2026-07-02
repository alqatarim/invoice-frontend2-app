'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import policySchema from './policySchema';

export const EMPTY_POLICY_FORM = {
  name: '',
  code: '',
  description: '',
  durationValue: 12,
  durationUnit: 'months',
  coverageType: 'repair_or_replace',
  returnBehavior: 'void_on_full_return',
  extensionAllowed: false,
  maxExtensionValue: '',
  maxExtensionUnit: 'months',
  claimLimitType: 'unlimited',
  claimLimitCount: '',
  termsAndConditions: '',
  exclusions: '',
  instructions: '',
  requiresSerialNumber: false,
  isTransferable: false,
  status: 'active',
};

export const mapPolicyToForm = policy => ({
  name: policy?.name || '',
  code: policy?.code || '',
  description: policy?.description || '',
  durationValue: policy?.duration?.value ?? 12,
  durationUnit: policy?.duration?.unit || 'months',
  coverageType: policy?.coverageType || EMPTY_POLICY_FORM.coverageType,
  returnBehavior: policy?.returnBehavior || EMPTY_POLICY_FORM.returnBehavior,
  extensionAllowed: Boolean(policy?.extensionAllowed),
  maxExtensionValue: policy?.maxExtension?.value ?? '',
  maxExtensionUnit: policy?.maxExtension?.unit || 'months',
  claimLimitType: policy?.claimLimit?.type || EMPTY_POLICY_FORM.claimLimitType,
  claimLimitCount: policy?.claimLimit?.count ?? '',
  termsAndConditions: policy?.termsAndConditions || '',
  exclusions: policy?.exclusions || '',
  instructions: policy?.instructions || '',
  requiresSerialNumber: Boolean(policy?.requiresSerialNumber),
  isTransferable: Boolean(policy?.isTransferable),
  status: policy?.status || 'active',
});

export const buildPolicyPayload = form => ({
  name: form.name,
  description: form.description,
  duration: {
    value: Number(form.durationValue || 0),
    unit: form.durationUnit,
  },
  coverageType: form.coverageType,
  returnBehavior: form.returnBehavior,
  extensionAllowed: Boolean(form.extensionAllowed),
  maxExtension: form.extensionAllowed && form.maxExtensionValue
    ? {
      value: Number(form.maxExtensionValue || 0),
      unit: form.maxExtensionUnit,
    }
    : null,
  claimLimit: {
    type: form.claimLimitType,
    count: form.claimLimitType === 'count' ? Number(form.claimLimitCount || 0) : null,
  },
  termsAndConditions: form.termsAndConditions,
  exclusions: form.exclusions,
  instructions: form.instructions,
  requiresSerialNumber: Boolean(form.requiresSerialNumber),
  isTransferable: Boolean(form.isTransferable),
  status: form.status,
});

const getFirstErrorMessage = errors => {
  const [firstError] = Object.values(errors || {});

  return firstError?.message || 'Please complete the required fields';
};

export default function usePolicyFormHandler({
  mode,
  policy = null,
  onSave,
  onError,
  initialErrorMessage = '',
}) {
  const router = useRouter();
  const readOnly = mode === 'view';
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues = useMemo(
    () => (policy ? mapPolicyToForm(policy) : EMPTY_POLICY_FORM),
    [policy]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(policySchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (initialErrorMessage) {
      onError?.(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  const handleBack = useCallback(() => {
    router.push('/policies/policy-list');
  }, [router]);

  const handleFormSubmit = useCallback(async form => {
    if (readOnly) return;

    setIsSubmitting(true);

    try {
      const result = await onSave?.(buildPolicyPayload(form));

      if (result?.success) {
        router.push('/policies/policy-list');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSave, readOnly, router]);

  const handleValidationError = useCallback(formErrors => {
    onError?.(getFirstErrorMessage(formErrors));
  }, [onError]);

  return {
    activeTab,
    control,
    errors,
    formId: `${mode}-policy-form`,
    handleBack,
    handleSubmit,
    handleFormSubmit,
    handleValidationError,
    isSubmitting,
    policy,
    readOnly,
    setActiveTab,
    title: mode === 'add' ? 'Add Policy' : mode === 'edit' ? 'Edit Policy' : 'View Policy',
    watch,
  };
}
