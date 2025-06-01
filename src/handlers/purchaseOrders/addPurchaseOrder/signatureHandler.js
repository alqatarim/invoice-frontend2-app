import { useState } from 'react';

export function useSignatureHandler({ signatures, setValue }) {
  const [signOptions] = useState(signatures || []);

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('signatureName', selected.signatureName);
      setValue('signatureImage', selected.signatureImage);
      setValue('sign_type', 'manualSignature');
    } else {
      field.onChange('');
      setValue('signatureName', '');
      setValue('signatureImage', '');
    }
  };

  return {
    signOptions,
    handleSignatureSelection
  };
}