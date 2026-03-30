import React from 'react';
import Link from 'next/link';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { formatCurrency, formatDate, getSourceHref } from '../utils';

const AccountingEntryDetailsDialog = ({ open, onClose, entry }) => {
  const sourceHref = getSourceHref({
    sourceType: entry?.sourceType,
    sourceId: entry?.sourceId,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Entry Details</DialogTitle>
      <DialogContent className='flex flex-col gap-4'>
        {entry ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Typography variant='body2'><strong>Entry No:</strong> {entry.entryNumber}</Typography>
              <Typography variant='body2'><strong>Date:</strong> {formatDate(entry.entryDate)}</Typography>
              <Typography variant='body2'><strong>Type:</strong> {entry.entryType}</Typography>
              <Typography variant='body2'><strong>Status:</strong> {entry.status}</Typography>
              <Typography variant='body2'><strong>Source:</strong> {entry.sourceType || '-'}</Typography>
              <Typography variant='body2'><strong>Source No:</strong> {entry.sourceNumber || '-'}</Typography>
            </div>
            <Typography variant='body2'>
              <strong>Narration:</strong> {entry.narration || '-'}
            </Typography>
            <Typography variant='body2'>
              <strong>Memo:</strong> {entry.memo || '-'}
            </Typography>
            {sourceHref ? (
              <Button component={Link} href={sourceHref} variant='outlined'>
                Open Source Document
              </Button>
            ) : null}

            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align='right'>Debit</TableCell>
                  <TableCell align='right'>Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(entry.lines || []).map((line, index) => (
                  <TableRow key={`${line.accountId || line.accountCode}-${index}`}>
                    <TableCell>{line.accountCode} - {line.accountName}</TableCell>
                    <TableCell>{line.description || '-'}</TableCell>
                    <TableCell align='right'>{formatCurrency(line.debit)}</TableCell>
                    <TableCell align='right'>{formatCurrency(line.credit)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}><strong>Total</strong></TableCell>
                  <TableCell align='right'><strong>{formatCurrency(entry.totalDebit)}</strong></TableCell>
                  <TableCell align='right'><strong>{formatCurrency(entry.totalCredit)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountingEntryDetailsDialog;
