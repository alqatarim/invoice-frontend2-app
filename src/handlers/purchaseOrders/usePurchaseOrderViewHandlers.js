import { useState, useEffect, useCallback } from 'react';
import { getPurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';

/**
 * Handler for purchase order view functionality.
 * Manages data fetching and actions for viewing a purchase order.
 */
export function usePurchaseOrderViewHandlers({
  purchaseOrderId,
  initialData = null,
  onError,
  onSuccess
}) {
  const [purchaseOrderData, setPurchaseOrderData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Fetch purchase order data
  const fetchPurchaseOrder = useCallback(async (id = purchaseOrderId) => {
    if (!id) {
      setError('Purchase order ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPurchaseOrder(id);
      setPurchaseOrderData(data);
      onSuccess?.('Purchase order loaded successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to load purchase order';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [purchaseOrderId, onError, onSuccess]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  // Load data on mount if not provided initially
  useEffect(() => {
    if (!initialData && purchaseOrderId) {
      fetchPurchaseOrder();
    }
  }, [fetchPurchaseOrder, initialData, purchaseOrderId]);

  // Calculate totals for display
  const calculateTotals = useCallback(() => {
    if (!purchaseOrderData?.items) {
      return {
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0
      };
    }

    const items = purchaseOrderData.items;
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDiscount = parseFloat(purchaseOrderData.totalDiscount || 0);
    const totalTax = parseFloat(purchaseOrderData.vat || 0);
    const roundOffValue = purchaseOrderData.roundOff ? 
      parseFloat(purchaseOrderData.roundOffValue || 0) : 0;
    
    const grandTotal = subtotal - totalDiscount + totalTax + roundOffValue;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      roundOffValue,
      grandTotal
    };
  }, [purchaseOrderData]);

  // Format display data
  const getFormattedData = useCallback(() => {
    if (!purchaseOrderData) return null;

    const totals = calculateTotals();

    return {
      ...purchaseOrderData,
      ...totals,
      // Format dates for display
      formattedPurchaseOrderDate: purchaseOrderData.purchaseOrderDate ? 
        new Date(purchaseOrderData.purchaseOrderDate).toLocaleDateString() : '',
      formattedDueDate: purchaseOrderData.dueDate ? 
        new Date(purchaseOrderData.dueDate).toLocaleDateString() : '',
      // Format vendor info
      vendorName: purchaseOrderData.vendorId?.vendor || 
                 purchaseOrderData.vendorInfo?.vendor || '',
      vendorEmail: purchaseOrderData.vendorId?.email || 
                  purchaseOrderData.vendorInfo?.email || '',
      vendorPhone: purchaseOrderData.vendorId?.phone || 
                  purchaseOrderData.vendorInfo?.phone || '',
      // Format bank info
      bankName: purchaseOrderData.bank?.bankName || '',
      accountNumber: purchaseOrderData.bank?.accountNumber || '',
      // Format signature info
      signatureImage: purchaseOrderData.signatureImage || 
                     purchaseOrderData.signatureInfo?.signatureImage || '',
      signatureName: purchaseOrderData.signatureName || 
                    purchaseOrderData.signatureInfo?.signatureName || ''
    };
  }, [purchaseOrderData, calculateTotals]);

  return {
    // Data state
    purchaseOrderData,
    formattedData: getFormattedData(),
    loading,
    error,

    // Actions
    fetchPurchaseOrder,
    refreshData,
    
    // Computed values
    totals: calculateTotals(),

    // Utility functions
    isDataLoaded: !!purchaseOrderData,
    hasItems: !!(purchaseOrderData?.items?.length > 0),
    hasSignature: !!(purchaseOrderData?.signatureImage || 
                    purchaseOrderData?.signatureInfo?.signatureImage),
    hasNotes: !!(purchaseOrderData?.notes?.trim()),
    hasTerms: !!(purchaseOrderData?.termsAndCondition?.trim())
  };
}