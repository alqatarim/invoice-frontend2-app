'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

const BankDetailsDialog = ({ open, onClose, newBank, setNewBank, handleAddBank }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleAddBank}>
        <DialogTitle className="font-semibold">Add Bank Details</DialogTitle>
        <DialogContent className="pt-2 pb-0">
          {[
            { label: 'Bank Name', name: 'bankName' },
            { label: 'Account Number', name: 'accountNumber' },
            { label: 'Account Holder Name', name: 'name' },
            { label: 'Branch Name', name: 'branch' },
            { label: 'IFSC Code', name: 'IFSCCode' }
          ].map(field => (
            <TextField
              key={field.name}
              fullWidth
              label={field.label}
              value={newBank[field.name] || ''}
              onChange={e => setNewBank({ ...newBank, [field.name]: e.target.value })}
              margin="normal"
              required
              name={field.name}
              autoComplete="off"
            />
          ))}
        </DialogContent>
        <DialogActions className="px-6 pb-4 pt-2 flex flex-row justify-end gap-2">
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankDetailsDialog;