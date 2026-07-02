'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { warrantyClaimIssueTypeOptions } from '@/data/dataSets';

const AddClaimDialog = ({ open, form, onChange, onClose, onSubmit, saving }) => {
  const updateField = field => event => {
    onChange(current => ({ ...current, [field]: event.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Warranty Claim</DialogTitle>
      <DialogContent>
        <Stack spacing={3} className="pt-1">
          <TextField fullWidth label="Warranty record ID" value={form.warrantyRecordId} onChange={updateField('warrantyRecordId')} required />
          <TextField fullWidth select label="Issue type" value={form.issueType} onChange={updateField('issueType')} SelectProps={{ native: true }}>
            {warrantyClaimIssueTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </TextField>
          <TextField fullWidth multiline minRows={3} label="Description" value={form.description} onChange={updateField('description')} required />
          <TextField fullWidth multiline minRows={2} label="Internal notes" value={form.internalNotes} onChange={updateField('internalNotes')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="tonal">Cancel</Button>
        <Button onClick={onSubmit} disabled={saving} variant="contained">{saving ? 'Saving...' : 'Create Claim'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClaimDialog;
