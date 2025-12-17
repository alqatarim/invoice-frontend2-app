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
      // Parse balance and ensure it's positive (DB doesn't accept negative values)
      const rawBalance = data.balance ? parseFloat(data.balance) : 0;
      const absoluteBalance = Math.abs(rawBalance);
      // If user entered negative, flip to Debit type
      const resolvedType = rawBalance < 0 ? 'Debit' : data.balanceType;

      // Prepare data for submission
      const submitData = {
        ...data,
        balance: absoluteBalance,
        balanceType: resolvedType,
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