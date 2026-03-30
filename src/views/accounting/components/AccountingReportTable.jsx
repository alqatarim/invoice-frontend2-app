import React from 'react';
import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

import { formatCurrency } from '../utils';

const AccountingReportTable = ({
  title,
  rows = [],
  emptyText = 'No rows found.',
  onAccountClick,
  balanceLabel = 'Balance',
}) => {
  return (
    <Card>
      <CardContent>
        {title ? (
          <Typography variant='h6' className='mb-4'>
            {title}
          </Typography>
        ) : null}
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Account</TableCell>
              <TableCell align='right'>Debit</TableCell>
              <TableCell align='right'>Credit</TableCell>
              <TableCell align='right'>{balanceLabel}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.accountId || row.accountCode} hover>
                  <TableCell>{row.accountCode}</TableCell>
                  <TableCell
                    sx={onAccountClick ? { cursor: 'pointer', color: 'primary.main', fontWeight: 500 } : undefined}
                    onClick={() => onAccountClick?.(row)}
                  >
                    {row.accountName}
                  </TableCell>
                  <TableCell align='right'>{formatCurrency(row.totalDebit)}</TableCell>
                  <TableCell align='right'>{formatCurrency(row.totalCredit)}</TableCell>
                  <TableCell align='right'>
                    {formatCurrency(row.absoluteBalance || row.signedBalance || 0)}
                    {row.balanceSide ? ` ${row.balanceSide}` : ''}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountingReportTable;
