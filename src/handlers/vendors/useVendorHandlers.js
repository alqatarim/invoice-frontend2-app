import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { VendorSchema } from '@/views/vendors/VendorSchema';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendorBalanceTypes } from '@/data/dataSets';

export default function useVendorHandlers({
  vendorData = null,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  mode = 'add' // 'add' or 'edit'
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(VendorSchema),
    defaultValues: {
      vendor_name: vendorData?.vendor_name || '',
      vendor_email: vendorData?.vendor_email || '',
      vendor_phone: vendorData?.vendor_phone || '',
      balance: vendorData?.balance || '',
      balanceType: vendorData?.balanceType || 'Credit',
      status: vendorData?.status !== undefined ? vendorData.status : true,
    }
  });

  // Populate form with vendor data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && vendorData) {
      // IMPORTANT: Use openingBalance if available (from list API), 
      // otherwise use balance (from view API where balance IS the opening balance)
      const rawBalance = vendorData.openingBalance ?? vendorData.balance ?? 0;
      const rawBalanceType = vendorData.openingBalanceType ?? vendorData.balanceType ?? 'Credit';

      // Handle negative balance: convert to positive with Debit type
      const isNegative = rawBalance < 0;
      const absoluteBalance = Math.abs(rawBalance);
      const resolvedType = isNegative ? 'Debit' : rawBalanceType;

      const formData = {
        vendor_name: vendorData.vendor_name || '',
        vendor_email: vendorData.vendor_email || '',
        vendor_phone: vendorData.vendor_phone || '',
        balance: absoluteBalance || '',
        balanceType: resolvedType,
        status: vendorData.status !== undefined ? vendorData.status : true,
      };
      reset(formData);
    }
  }, [vendorData, reset, mode]);

  const handleFormSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Parse balance and ensure it's positive (DB doesn't accept negative values)
      const rawBalance = data.balance ? parseFloat(data.balance) : 0;
      const absoluteBalance = Math.abs(rawBalance);
      // If user entered negative, flip to Debit type
      const resolvedType = rawBalance < 0 ? 'Debit' : data.balanceType;

      // Prepare data for submission
      const submitData = {
        ...data,
        balance: absoluteBalance,
        balanceType: resolvedType,
      };

      // If balance is 0 or empty, don't send balanceType
      if (!submitData.balance || submitData.balance === 0) {
        delete submitData.balanceType;
      }

      const result = await onSave(submitData);

      if (result.success) {
        if (mode === 'add') {
          reset();
        }
        router.push('/vendors/vendor-list');
      }
    } catch (error) {
      console.error('Error submitting vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (errors) => {
    console.error('Form validation errors:', errors);
  };

  const handleCancel = () => {
    if (mode === 'add') {
      reset();
    }
    router.push('/vendors/vendor-list');
  };

  return {
    // Form state and methods
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    errors,

    // Static data
    vendorBalanceTypes,

    // Form submission methods
    isSubmitting,
    handleFormSubmit,
    handleError,
    handleCancel
  };
}