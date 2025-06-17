import { useFormHandler } from './formHandler'
import { useSubmissionHandler } from './submissionHandler'

/**
 * Main composite hook for add customer functionality
 * Combines all modular handlers following single responsibility principle
 */
export const useAddCustomerHandlers = ({ onError, onSuccess }) => {
  // Form handler - manages form state and validation
  const formHandler = useFormHandler({ onError })

  // Submission handler - manages form submission
  const submissionHandler = useSubmissionHandler({
    onError,
    onSuccess,
    validateForm: formHandler.validateForm,
    formData: formHandler.formData,
    resetForm: formHandler.resetForm
  })

  return {
    // Form state and actions
    formData: formHandler.formData,
    errors: formHandler.errors,
    touched: formHandler.touched,
    handleFieldChange: formHandler.handleFieldChange,
    handleNestedFieldChange: formHandler.handleNestedFieldChange,
    handleFileChange: formHandler.handleFileChange,
    handleCopyBillingToShipping: formHandler.handleCopyBillingToShipping,
    handleFieldBlur: formHandler.handleFieldBlur,
    validateField: formHandler.validateField,
    validateForm: formHandler.validateForm,
    resetForm: formHandler.resetForm,
    setFormData: formHandler.setFormData,
    setErrors: formHandler.setErrors,
    
    // Submission state and actions
    loading: submissionHandler.loading,
    handleSubmit: submissionHandler.handleSubmit,
    handleSaveAndContinue: submissionHandler.handleSaveAndContinue,
    handleCancel: submissionHandler.handleCancel
  }
}