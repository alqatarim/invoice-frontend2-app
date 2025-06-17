import { useState } from 'react';

export function useDialogHandler({ setValue, getValues }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');

  const handleToggleNotes = () => {
    setNotesExpanded(!notesExpanded);
  };

  const handleOpenTermsDialog = () => {
    const currentTerms = getValues('termsAndCondition') || '';
    setTempTerms(currentTerms);
    setTermsDialogOpen(true);
  };

  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
    setTempTerms('');
  };

  const handleSaveTerms = () => {
    setValue('termsAndCondition', tempTerms);
    handleCloseTermsDialog();
  };

  return {
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms
  };
}