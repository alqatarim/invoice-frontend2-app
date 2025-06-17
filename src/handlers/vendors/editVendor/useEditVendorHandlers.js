import { useFormHandler } from './formHandler';
import { useSubmissionHandler } from './submissionHandler';
import { vendorBalanceTypes } from '@/data/dataSets';

export default function useEditVendorHandlers({
  vendorData,
  onSave,
  enqueueSnackbar,
  closeSnackbar
}) {
  // Form Handler
  const formHandler = useFormHandler({ vendorData });
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    errors
  } = formHandler;

  // Submission Handler
  const submissionHandler = useSubmissionHandler({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave,
    getValues
  });

  return {
    // Form state and methods
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    errors,
    reset,

    // Static data
    vendorBalanceTypes,

    // Form submission methods
    isSubmitting: submissionHandler.isSubmitting,
    handleFormSubmit: submissionHandler.handleFormSubmit,
    handleError: submissionHandler.handleError,
    handleCancel: submissionHandler.handleCancel
  };
}