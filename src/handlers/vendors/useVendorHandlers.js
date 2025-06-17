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
      const formData = {
        vendor_name: vendorData.vendor_name || '',
        vendor_email: vendorData.vendor_email || '',
        vendor_phone: vendorData.vendor_phone || '',
        balance: vendorData.balance || '',
        balanceType: vendorData.balanceType || 'Credit',
        status: vendorData.status !== undefined ? vendorData.status : true,
      };
      reset(formData);
    }
  }, [vendorData, reset, mode]);

  const handleFormSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        balance: data.balance ? parseFloat(data.balance) : 0,
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