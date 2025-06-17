import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { VendorSchema } from '@/views/vendors/VendorSchema';
import { useEffect } from 'react';

export function useFormHandler({ vendorData = null }) {
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
      vendor_name: '',
      vendor_email: '',
      vendor_phone: '',
      balance: '',
      balanceType: 'Credit',
      status: true,
    }
  });

  // Populate form with vendor data when component mounts (for addVendor, vendorData will be null)
  useEffect(() => {
    if (vendorData) {
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
  }, [vendorData, reset]);

  return {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    errors
  };
}