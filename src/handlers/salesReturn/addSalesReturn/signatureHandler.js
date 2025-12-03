import { useState, useEffect } from 'react';

export function useSignatureHandler({ signatures, setValue }) {
  const [signOptions, setSignOptions] = useState([]);

  useEffect(() => {
    if (signatures && signatures.length > 0) {
      const signArray = signatures.map((item) => ({
        value: item?._id,
        label: item?.signatureName,
        ...item
      }));
      setSignOptions(signArray);
    }
  }, [signatures]);

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      if (setValue) {
        setValue('sign_type', 'manualSignature');
      }
    } else {
      field.onChange('');
    }
  };

  return {
    signOptions,
    handleSignatureSelection
  };
}