import { useState } from 'react';

export function useDialogHandlers({ getValues, setValue }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');

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

  return {
    notesExpanded,
    handleToggleNotes,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms
  };
}