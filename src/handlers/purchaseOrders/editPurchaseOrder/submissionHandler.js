import { useRouter } from 'next/navigation';

export function useSubmissionHandler({
  trigger,
  closeSnackbar,
  enqueueSnackbar,
  onSave,
  getValues
}) {
  const router = useRouter();

  const handleFormSubmit = async (data) => {
    try {
      // Validate form
      const isValid = await trigger();
      if (!isValid) {
        console.error('Form validation failed');
        return;
      }

      // Clear any existing snackbars
      closeSnackbar();

      // Prepare data for submission
      const purchaseOrderData = {
        ...data,
        purchaseOrderId: data.purchaseOrderId,
        purchaseOrderDate: data.purchaseOrderDate,
        dueDate: data.dueDate,
        vendorId: data.vendorId,
        bank: data.bank,
        paymentMode: data.paymentMode,
        referenceNo: data.referenceNo || '',
        taxableAmount: Number(data.taxableAmount),
        TotalAmount: Number(data.TotalAmount),
        vat: Number(data.vat),
        totalDiscount: Number(data.totalDiscount),
        roundOff: data.roundOff || false,
        roundOffValue: Number(data.roundOffValue) || 0,
        sign_type: data.sign_type || 'eSignature',
        signatureName: data.signatureName || '',
        signatureId: data.signatureId || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        items: data.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          units: item.units,
          rate: Number(item.rate),
          discount: Number(item.discount),
          discountType: Number(item.discountType),
          tax: Number(item.tax),
          taxInfo: item.taxInfo,
          amount: Number(item.amount),
          form_updated_rate: item.form_updated_rate,
          form_updated_discount: item.form_updated_discount,
          form_updated_discounttype: item.form_updated_discounttype,
          form_updated_tax: item.form_updated_tax,
          isRateFormUpadted: item.isRateFormUpadted
        }))
      };

      // Get signature URL if using eSignature
      let signatureURL = null;
      if (data.sign_type === 'eSignature' && data.signatureImage) {
        signatureURL = data.signatureImage;
      }

      // Call the save function
      const result = await onSave(purchaseOrderData, signatureURL);

      if (result.success) {
        // Navigate to purchase order list after successful save
        setTimeout(() => {
          router.push('/purchase-orders/purchase-orders-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Failed to create purchase order: ' + error.message, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false
      });
    }
  };

  const handleError = (errors) => {
    console.error('Form validation errors:', errors);
    
    // Find the first error message
    let firstError = 'Please check all required fields';
    
    if (errors.vendorId) {
      firstError = 'Please select a vendor';
    } else if (errors.items && errors.items.length > 0) {
      firstError = 'Please check product details';
    } else if (errors.bank) {
      firstError = 'Please select a bank';
    } else if (errors.paymentMode) {
      firstError = 'Please select a payment method';
    }

    enqueueSnackbar(firstError, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: false
    });
  };

  return {
    handleFormSubmit,
    handleError
  };
}