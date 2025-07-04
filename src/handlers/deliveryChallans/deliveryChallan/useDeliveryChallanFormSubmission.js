export function useDeliveryChallanFormSubmission({ trigger, closeSnackbar, enqueueSnackbar, onSave, getValues }) {
  // Form submit handler
  const handleFormSubmit = async (data, errors, handleError) => {
    try {
      closeSnackbar();
      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }
      const currentFormData = data;
      if (currentFormData) {
        // Helper function to extract ID from value (whether it's a string or object)
        const extractId = (value) => {
          if (!value) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object' && value._id) return value._id;
          if (typeof value === 'object' && value.value) return value.value;
          return '';
        };

        const updatedFormData = {
          customerId: extractId(currentFormData.customerId),
          deliveryChallanNumber: currentFormData.deliveryChallanNumber,
          referenceNo: currentFormData.referenceNo,
          dueDate: currentFormData.dueDate,
          deliveryChallanDate: currentFormData.deliveryChallanDate,
          address: currentFormData.address,
          taxableAmount: currentFormData.taxableAmount,
          vat: currentFormData.vat,
          roundOff: currentFormData.roundOff,
          totalDiscount: currentFormData.totalDiscount,
          TotalAmount: currentFormData.TotalAmount,
          notes: currentFormData.notes,
          bank: currentFormData.bank,
          termsAndCondition: currentFormData.termsAndCondition,
          items: currentFormData.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            units: item.units,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            discountType: item.discountType,
            amount: item.amount,
            key: item.key,
            isRateFormUpadted: item.isRateFormUpadted,
            form_updated_rate: item.form_updated_rate,
            form_updated_discount: item.form_updated_discount,
            form_updated_discounttype: item.form_updated_discounttype,
            form_updated_tax: item.form_updated_tax,
            tax: item.tax,
            taxInfo: JSON.stringify(item.taxInfo),
          })),
          sign_type: currentFormData.sign_type || 'manualSignature',
          signatureName: currentFormData.signatureName,
          signatureId: extractId(currentFormData.signatureId)
        };
        const loadingKey = enqueueSnackbar(`Processing delivery challan...`, {
          variant: 'info',
          persist: true,
          preventDuplicate: true
        });
        const result = await onSave(updatedFormData);
        closeSnackbar(loadingKey);
        if (!result.success) {
          const errorMessage = result.error?.message || result.message || `Failed to process delivery challan`;
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
          return { success: false, message: errorMessage };
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An error occurred during submission', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return { success: false, message: error.message || 'An error occurred during submission' };
    }
  };

  // Error handler
  const handleError = (errors) => {
    closeSnackbar();
    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) return;
      const formValues = getValues();
      Object.entries(errors).forEach(([key, error]) => {
        if (key === 'items') {
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              preventDuplicate: true,
              key: `error-items-${Date.now()}`,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
              }
            });
          }
          if (Array.isArray(error)) {
            error.forEach((itemError, index) => {
              if (itemError) {
                const productName = formValues.items?.[index]?.name || `Item ${index + 1}`;
                Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
                  if (fieldError && fieldError.message) {
                    enqueueSnackbar(`${productName}: ${fieldError.message}`, {
                      variant: 'error',
                      preventDuplicate: true,
                      key: `error-item-${index}-${fieldKey}-${Date.now()}`,
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                      }
                    });
                  }
                });
              }
            });
          }
        } else if (error && error.message) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true,
            key: `error-${key}-${Date.now()}`,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          });
        }
      });
    }, 200);
  };

  return {
    handleFormSubmit,
    handleError
  };
} 