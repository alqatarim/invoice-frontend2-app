import { useState } from 'react';

export function useSignatureHandlers({ signatures, deliveryChallanData, setValue, trigger }) {
  const [signOptions, setSignOptions] = useState(signatures || []);
  const [selectedSignature, setSelectedSignature] = useState(
    deliveryChallanData?.sign_type === 'manualSignature' && deliveryChallanData?.signatureId?.signatureImage
      ? deliveryChallanData.signatureId.signatureImage
      : null
  );

  const handleSignatureSelection = (selectedOption, field) => {
    if (selectedOption) {
      field.onChange(selectedOption._id);
      setSelectedSignature(selectedOption.signatureImage);
      trigger('signatureId');
    } else {
      field.onChange('');
      setSelectedSignature(null);
      trigger('signatureId');
    }
  };

  return {
    signOptions,
    setSignOptions,
    selectedSignature,
    setSelectedSignature,
    handleSignatureSelection
  };
} 