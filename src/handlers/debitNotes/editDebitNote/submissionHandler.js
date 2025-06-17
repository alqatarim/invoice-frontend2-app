export function useSubmissionHandler({ trigger, closeSnackbar, enqueueSnackbar, onSave, getValues }) {
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
        // Create plain object instead of FormData since addInvoice function handles FormData creation
        const invoiceData = {
          customerId: currentFormData.customerId,
          payment_method: currentFormData.payment_method,
          taxableAmount: currentFormData.taxableAmount,
          vat: currentFormData.vat,
          roundOff: currentFormData.roundOff,
          totalDiscount: currentFormData.totalDiscount,
          TotalAmount: currentFormData.TotalAmount,
          invoiceNumber: currentFormData.invoiceNumber,
          referenceNo: currentFormData.referenceNo || '',
          dueDate: currentFormData.dueDate,
          invoiceDate: currentFormData.invoiceDate,
          notes: currentFormData.notes || '',
          bank: currentFormData.bank || '',
          termsAndCondition: currentFormData.termsAndCondition || '',
          sign_type: currentFormData.sign_type || 'manualSignature',
          signatureName: currentFormData.signatureName || '',
          signatureId: currentFormData.signatureId || '',
          signatureImage: currentFormData.signatureImage || null,
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
            taxInfo: item.taxInfo,
          }))
        };

        const result = await onSave(invoiceData);

        if (!result.success) {
          const errorMessage = result.error?.message || result.message || 'Failed to add invoice';
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