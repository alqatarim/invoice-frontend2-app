import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';

const createEmptyLine = () => ({
  accountId: '',
  debit: '',
  credit: '',
  description: '',
});

const JournalEntryFormDialog = ({
  open,
  onClose,
  onSubmit,
  accounts = [],
  type = 'journal',
  loading = false,
}) => {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState([createEmptyLine(), createEmptyLine()]);

  useEffect(() => {
    if (!open) return;
    setEntryDate(new Date().toISOString().slice(0, 10));
    setNarration('');
    setMemo('');
    setLines([createEmptyLine(), createEmptyLine()]);
  }, [open]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        acc.debit += Number(line.debit || 0);
        acc.credit += Number(line.credit || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [lines]);

  const handleLineChange = (index, key) => event => {
    const value = event.target.value;
    setLines(prev => prev.map((line, lineIdx) => {
      if (lineIdx !== index) return line;
      return { ...line, [key]: value };
    }));
  };

  const addLine = () => setLines(prev => [...prev, createEmptyLine()]);
  const removeLine = index => {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, lineIdx) => lineIdx !== index));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await onSubmit?.({
      entryDate,
      narration,
      memo,
      lines: lines.map(line => ({
        ...line,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
      <DialogTitle>{type === 'voucher' ? 'New Voucher' : 'New Journal Entry'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='flex flex-col gap-4'>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type='date'
                label='Entry Date'
                value={entryDate}
                onChange={event => setEntryDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                label='Narration'
                value={narration}
                onChange={event => setNarration(event.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label='Memo'
                value={memo}
                onChange={event => setMemo(event.target.value)}
              />
            </Grid>
          </Grid>

          <div className='flex flex-col gap-4'>
            {lines.map((line, index) => (
              <Grid container spacing={3} key={`journal-line-${index}`} alignItems='center'>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    select
                    fullWidth
                    label='Account'
                    value={line.accountId}
                    onChange={handleLineChange(index, 'accountId')}
                    required
                  >
                    {accounts.map(account => (
                      <MenuItem key={account._id} value={account._id}>
                        {account.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Debit'
                    value={line.debit}
                    onChange={handleLineChange(index, 'debit')}
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    type='number'
                    label='Credit'
                    value={line.credit}
                    onChange={handleLineChange(index, 'credit')}
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    label='Description'
                    value={line.description}
                    onChange={handleLineChange(index, 'description')}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 1 }} className='flex justify-end'>
                  <IconButton onClick={() => removeLine(index)} disabled={lines.length <= 2}>
                    <Icon icon='tabler:trash' />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </div>

          <div className='flex items-center justify-between'>
            <Button startIcon={<Icon icon='tabler:plus' />} onClick={addLine}>
              Add Line
            </Button>
            <Typography variant='body2' color={totals.debit === totals.credit ? 'success.main' : 'error.main'}>
              Totals: Debit {totals.debit.toFixed(2)} / Credit {totals.credit.toFixed(2)}
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type='submit' variant='contained' disabled={loading}>
            Save {type === 'voucher' ? 'Voucher' : 'Journal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JournalEntryFormDialog;
