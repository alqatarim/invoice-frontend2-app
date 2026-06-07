'use client';

import { useMemo } from 'react';
import CustomerPosReceiptDialog from '@/components/receipts/CustomerPosReceiptDialog';

const PosReceiptDialog = ({ open, onClose, receiptData, onNewSale }) => {
  const resolvedReceipt = useMemo(() => {
    if (!receiptData) return null;
    return receiptData.receipt ? { ...receiptData, ...receiptData.receipt } : receiptData;
  }, [receiptData]);

  return (
    <CustomerPosReceiptDialog
      open={open}
      loading={false}
      receiptData={resolvedReceipt}
      onClose={onNewSale || onClose}
    />
  );
};

export default PosReceiptDialog;
