import { useState, useEffect } from 'react';

export function useBankHandler({ initialBanks, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: ''
  });

  useEffect(() => {
    setBanks(initialBanks || []);
  }, [initialBanks]);

  const handleAddBank = async (bankData) => {
    if (addBank) {
      const result = await addBank(bankData);
      if (result.success && result.data) {
        setBanks([...banks, result.data]);
        setNewBank({
          bankName: '',
          branch: '',
          accountNumber: '',
          IFSCCode: ''
        });
      }
      return result;
    }
    return { success: false, message: 'Add bank function not provided' };
  };

  return {
    banks,
    setBanks,
    newBank,
    setNewBank,
    handleAddBank
  };
}