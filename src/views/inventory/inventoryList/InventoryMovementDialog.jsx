'use client';

import React from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';

const formatMovementLabel = (value = '') =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');

const getMovementColor = (value = '') => {
  const normalized = String(value || '').toUpperCase();
  if (normalized.endsWith('_IN')) return 'success';
  if (normalized.endsWith('_OUT')) return 'error';
  if (normalized.startsWith('TRANSFER')) return 'info';
  return 'default';
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const InventoryMovementDialog = ({
  open,
  onClose,
  rows = [],
  loading = false,
  title = 'Movement History',
  subtitle = '',
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle sx={{ pb: 1 }}>
      <Box className='flex items-center gap-2'>
        <Icon icon='mdi:timeline-clock-outline' width={22} />
        <Box>
          <Typography variant='h6'>{title}</Typography>
          {subtitle ? (
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </DialogTitle>

    <DialogContent>
      {loading ? (
        <Box className='flex items-center justify-center py-10 gap-3'>
          <CircularProgress size={24} />
          <Typography variant='body2' color='text.secondary'>
            Loading movement history...
          </Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box className='flex flex-col items-center justify-center py-10 gap-2 text-center'>
          <Icon icon='mdi:timeline-remove-outline' width={36} />
          <Typography variant='subtitle1'>No movement history found</Typography>
          <Typography variant='body2' color='text.secondary'>
            Transfers, cycle counts, and other costing movements will appear here.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant='outlined'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Movement</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell align='right'>Quantity</TableCell>
                <TableCell align='right'>Unit Cost</TableCell>
                <TableCell align='right'>Total Cost</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row._id || `${row.movementType}-${row.movementDate}`}>
                  <TableCell>{formatDateTime(row.movementDate || row.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={formatMovementLabel(row.movementType)}
                      color={getMovementColor(row.movementType)}
                      variant='outlined'
                    />
                  </TableCell>
                  <TableCell>{row.branchId || '-'}</TableCell>
                  <TableCell align='right'>{Number(row.quantity || 0)}</TableCell>
                  <TableCell align='right'>{formatAmount(row.unitCost)}</TableCell>
                  <TableCell align='right'>{formatAmount(row.totalCost)}</TableCell>
                  <TableCell>
                    <Typography variant='body2'>{row.sourceType || '-'}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {row.meta?.itemName || row.meta?.sku || ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={onClose} color='secondary'>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default InventoryMovementDialog;
