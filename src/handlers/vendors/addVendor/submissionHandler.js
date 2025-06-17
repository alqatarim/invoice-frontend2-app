import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSubmissionHandler({
  trigger,
  closeSnackbar,
  enqueueSnackbar,
  onSave,
  getValues
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        balance: data.balance ? parseFloat(data.balance) : 0,
      };

      // If balance is 0 or empty, don't send balanceType
      if (!submitData.balance || submitData.balance === 0) {
        delete submitData.balanceType;
      }

      const result = await onSave(submitData);

      if (result.success) {
        router.push('/vendors/vendor-list');
      }
    } catch (error) {
      console.error('Error submitting vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (errors) => {
    console.error('Form validation errors:', errors);
  };

  const handleCancel = () => {
    router.push('/vendors/vendor-list');
  };

  return {
    isSubmitting,
    handleFormSubmit,
    handleError,
    handleCancel
  };
}