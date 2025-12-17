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