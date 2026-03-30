import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'COGS', 'EXPENSE'];
const NORMAL_BALANCES = ['DEBIT', 'CREDIT'];

const buildInitialState = account => ({
  code: account?.code || '',
  name: account?.name || '',
  parentId: account?.parentId || '',
  accountType: account?.accountType || 'ASSET',
  subType: account?.subType || '',
  reportGroup: account?.reportGroup || '',
  normalBalance: account?.normalBalance || 'DEBIT',
  allowPosting: account?.allowPosting !== false,
  isActive: account?.isActive !== false,
  description: account?.description || '',
});

const AccountFormDialog = ({ open, onClose, onSubmit, account = null, parentOptions = [], loading = false }) => {
  const [form, setForm] = useState(buildInitialState(account));

  useEffect(() => {
    setForm(buildInitialState(account));
  }, [account, open]);

  const availableParents = useMemo(
    () => (parentOptions || []).filter(option => option._id !== account?._id),
    [account?._id, parentOptions]
  );

  const handleChange = key => event => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await onSubmit?.(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{account ? 'Edit Account' : 'New Account'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Account Code'
                value={form.code}
                onChange={handleChange('code')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label='Account Name'
                value={form.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label='Parent Account'
                value={form.parentId}
                onChange={handleChange('parentId')}
              >
                <MenuItem value=''>None</MenuItem>
                {availableParents.map(option => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.code} - {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label='Account Type'
                value={form.accountType}
                onChange={handleChange('accountType')}
                required
              >
                {ACCOUNT_TYPES.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label='Normal Balance'
                value={form.normalBalance}
                onChange={handleChange('normalBalance')}
                required
              >
                {NORMAL_BALANCES.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Sub Type'
                value={form.subType}
                onChange={handleChange('subType')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label='Report Group'
                value={form.reportGroup}
                onChange={handleChange('reportGroup')}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Description'
                value={form.description}
                onChange={handleChange('description')}
                multiline
                minRows={3}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <FormControlLabel
                control={<Checkbox checked={form.allowPosting} onChange={handleChange('allowPosting')} />}
                label='Allow Direct Posting'
              />
              <FormControlLabel
                control={<Checkbox checked={form.isActive} onChange={handleChange('isActive')} />}
                label='Active'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountFormDialog;
