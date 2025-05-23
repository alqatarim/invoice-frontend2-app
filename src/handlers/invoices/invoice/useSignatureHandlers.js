import { useState } from 'react';

export function useSignatureHandlers({ signatures, invoiceData, setValue, trigger }) {
  const [signOptions, setSignOptions] = useState(signatures || []);
  const [selectedSignature, setSelectedSignature] = useState(
    invoiceData?.sign_type === 'manualSignature' && invoiceData?.signatureId?.signatureImage
      ? invoiceData.signatureId.signatureImage
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