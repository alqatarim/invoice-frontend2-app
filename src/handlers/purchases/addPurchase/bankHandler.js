import { useState } from 'react';

export function useBankHandler({ initialBanks, addBank }) {
     const [banks, setBanks] = useState(initialBanks || []);
     const [newBank, setNewBank] = useState({
          name: '',
          bankName: '',
          branch: '',
          accountNumber: '',
          ifscCode: ''
     });

     const handleAddBank = async () => {
          try {
               if (!newBank.name || !newBank.bankName || !newBank.accountNumber) {
                    throw new Error('Please fill in all required bank details');
               }

               // If addBank function is provided, use it to save to backend
               if (addBank) {
                    const savedBank = await addBank(newBank);
                    setBanks([...banks, savedBank]);
               } else {
                    // Otherwise just add to local state
                    const tempBank = { ...newBank, _id: Date.now().toString() };
                    setBanks([...banks, tempBank]);
               }

               // Reset form
               setNewBank({
                    name: '',
                    bankName: '',
                    branch: '',
                    accountNumber: '',
                    ifscCode: ''
               });

               return true;
          } catch (error) {
               console.error('Error adding bank:', error);
               return false;
          }
     };

     return {
          banks,
          newBank,
          setNewBank,
          handleAddBank
     };
}
