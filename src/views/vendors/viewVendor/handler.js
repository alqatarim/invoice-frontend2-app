'use client';

import { useCallback, useEffect, useState } from 'react';

import { getVendorById } from '@/app/(dashboard)/vendors/actions';
import { formatDate } from '@/utils/dateUtils';
import { formatNumberWithLocale } from '@/utils/numberUtils';

const getVendorBalanceDisplay = (vendor = {}) => {
  const source = vendor || {};
  const balance = Number(source.closingBalance ?? source.balance ?? 0) || 0;
  const balanceType = source.closingBalanceType ?? source.balanceType ?? (balance >= 0 ? 'Credit' : 'Debit');
  const absoluteBalance = Math.abs(balance);

  return {
    amount: balance,
    absoluteAmount: absoluteBalance,
    type: balanceType,
    formattedAmount: formatNumberWithLocale(absoluteBalance, 'en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    textColor: balanceType === 'Credit' ? 'success.dark' : 'error.dark',
  };
};

export function useViewVendorHandler({
  open,
  id,
  vendorId,
  initialVendorData = null,
  onClose,
  onError,
}) {
  const resolvedVendorId = vendorId || id;
  const isOpen = open ?? true;
  const [vendor, setVendor] = useState(initialVendorData);
  const [loading, setLoading] = useState(!initialVendorData);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!isOpen || !resolvedVendorId) return;

      if (initialVendorData && initialVendorData._id === resolvedVendorId) {
        setVendor(initialVendorData);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const vendorData = await getVendorById(resolvedVendorId);
        setVendor(vendorData);
      } catch (error) {
        setVendor(null);
        onError?.(error.message || 'Failed to fetch vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [initialVendorData, isOpen, onError, resolvedVendorId]);

  const handleClose = useCallback(() => {
    setVendor(null);
    onClose?.();
  }, [onClose]);

  return {
    balance: getVendorBalanceDisplay(vendor),
    createdAt: vendor?.created_at ? formatDate(vendor.created_at) : 'N/A',
    handleClose,
    isOpen,
    loading,
    vendor,
  };
}
