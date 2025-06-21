import { useState } from 'react';

export function useDialogHandlers({ getValues, setValue }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // Notes toggle handler
  const handleToggleNotes = () => {
    setNotesExpanded((prev) => !prev);
  };

  // Terms and Conditions handlers
  const handleOpenTermsDialog = () => {
    setTempTerms(getValues('termsAndCondition') || '');
    setTermsDialogOpen(true);
  };
  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
  };
  const handleSaveTerms = () => {
    setValue('termsAndCondition', tempTerms);
    setTermsDialogOpen(false);
  };

  // Shipping Address handlers (specific to delivery challan)
  const handleOpenAddressDialog = () => {
    setTempAddress(getValues('address') || '');
    setAddressDialogOpen(true);
  };
  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
  };
  const handleSaveAddress = () => {
    setValue('address', tempAddress);
    setAddressDialogOpen(false);
  };

  return {
    notesExpanded,
    handleToggleNotes,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
    addressDialogOpen,
    tempAddress,
    setTempAddress,
    handleOpenAddressDialog,
    handleCloseAddressDialog,
    handleSaveAddress
  };
} 