import { useState } from 'react';

export function useBankHandlers({ initialBanks, enqueueSnackbar, closeSnackbar, setValue, trigger, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      closeSnackbar();
      const loadingKey = enqueueSnackbar('Adding bank details...', {
        variant: 'info',
        persist: true
      });
      const response = await addBank(newBank);
      closeSnackbar(loadingKey);
      if (response) {
        const newBankWithDetails = {
          _id: response._id,
          name: newBank.name,
          bankName: newBank.bankName,
          branch: newBank.branch,
          accountNumber: newBank.accountNumber,
          IFSCCode: newBank.IFSCCode,
        };
        setBanks((prevBanks) => [...prevBanks, newBankWithDetails]);
        setValue('bank', newBankWithDetails._id);
        trigger('bank');
        setNewBank({ name: '', bankName: '', branch: '', accountNumber: '', IFSCCode: '' });
        enqueueSnackbar('Bank details added successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Failed to add bank:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'Failed to add bank details', { variant: 'error' });
    }
  };

  return {
    banks,
    setBanks,
    newBank,
    setNewBank,
    handleAddBank
  };
} 