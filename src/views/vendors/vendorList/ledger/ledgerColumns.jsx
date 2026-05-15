'use client';

import React from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import { ledgerModes } from '@/data/dataSets';
import { getBalanceColor } from '@/utils/colorUtils';
import { formatDate } from '@/utils/dateUtils';
import { amountFormat } from '@/utils/numberUtils';

const DraftActions = ({ submitting, onCancel, onSave }) => (
  <Box className="flex items-center justify-end gap-1">
    <Tooltip title="Save">
      <span>
        <IconButton size="small" color="primary" disabled={submitting} onClick={onSave}>
          {submitting ? <CircularProgress size={18} /> : <Icon icon="mdi:content-save-outline" />}
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Cancel">
      <span>
        <IconButton size="small" color="secondary" disabled={submitting} onClick={onCancel}>
          <Icon icon="mdi:close" />
        </IconButton>
      </span>
    </Tooltip>
  </Box>
);

const RowActions = ({ row, canUpdate, canDelete, inlineRow, submitting, onEdit, onDelete }) => (
  <Box className="flex items-center justify-end gap-0">
    {canUpdate && (
      <Tooltip title="Edit">
        <span>
          <IconButton
            size="small"
            disabled={Boolean(inlineRow) || submitting}
            onClick={() => onEdit(row)}
          >
            <Icon icon="mdi:edit-outline" />
          </IconButton>
        </span>
      </Tooltip>
    )}
    {canDelete && (
      <Tooltip title="Delete">
        <span>
          <IconButton
            size="small"
            color="error"
            disabled={Boolean(inlineRow) || submitting}
            onClick={() => onDelete(row)}
          >
            <Icon icon="mdi:delete-outline" />
          </IconButton>
        </span>
      </Tooltip>
    )}
  </Box>
);

/**
 * Vendor ledger table column definitions.
 */
export const getVendorLedgerColumns = ({
  canUpdate,
  canDelete,
  inlineRow,
  submittingLedger,
  startEditRow,
  cancelInlineRow,
  updateInlineDraft,
  saveInlineRow,
  handleDeleteLedger,
}) => [
    {
      key: 'name',
      label: 'Name',
      width: '18%',
      align: 'center',
      renderCell: row => row.__isInline ? (
        <TextField
          fullWidth
          size="small"
          placeholder="Name"
          value={row.draft.name}
          error={!!row.errors.name}
          helperText={row.errors.name}
          disabled={submittingLedger}
          onChange={event => updateInlineDraft('name', event.target.value)}
        />
      ) : (
        <Typography variant="body1" color='text.primary' className="text-start px-3.5">
          {row.name || '-'}
        </Typography>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      align: 'center',
      width: '13%',
      renderCell: row => row.__isInline ? (
        <TextField

          fullWidth
          size="small"
          placeholder="Reference"
          value={row.draft.reference}
          error={!!row.errors.reference}
          helperText={row.errors.reference}
          disabled={submittingLedger}
          onChange={event => updateInlineDraft('reference', event.target.value)}
        />
      ) : (
        <Typography variant="body1" color='text.primary' className="text-start px-3.5">
          {row.reference || '-'}
        </Typography>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '16%',
      align: 'center',
      renderCell: row => row.__isInline ? (
        <TextField
          fullWidth
          size="small"
          type="date"
          value={row.draft.date}
          error={!!row.errors.date}
          helperText={row.errors.date}
          disabled={submittingLedger}
          onChange={event => updateInlineDraft('date', event.target.value)}
        />
      ) : (
        <Typography variant="body1" color='text.primary'>
          {formatDate(row.date)}
        </Typography>
      ),
    },
    {
      key: 'mode',
      label: 'Mode',
      align: 'center',
      width: '13%',
      renderCell: row => row.__isInline ? (
        <FormControl size="small" error={!!row.errors.mode} sx={{ width: 90 }}>
          <Select
            value={row.draft.mode}
            disabled={submittingLedger}
            onChange={event => updateInlineDraft('mode', event.target.value)}
            sx={{
              '& .MuiSelect-select': {
                pl: '8px !important',
                pr: '28px !important',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'text.primary',
              },
              '& .MuiSelect-icon': {
                right: 6,
              },
            }}
            renderValue={selected => {
              const selectedMode = ledgerModes.find(item => item.value === selected);

              return selectedMode ? (
                <Typography color="inherit" fontSize="inherit" fontWeight="inherit">
                  {selectedMode.label}
                </Typography>
              ) : selected;
            }}
          >
            {ledgerModes.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Chip
          size="small"
          label={row.mode}
          color={row.mode === 'Credit' ? 'success' : 'error'}
          variant="tonal"
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'center',
      width: '15%',
      renderCell: row => row.__isInline ? (
        <TextField
          fullWidth
          size="small"
          type="number"
          placeholder="Amount"
          value={row.draft.amount}
          error={!!row.errors.amount}
          helperText={row.errors.amount}
          disabled={submittingLedger}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: 'secondary.light' }}>
                <Icon width={16} icon="lucide:saudi-riyal" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputAdornment-positionStart': {
              mr: 0.5,
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',

            },
            '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          }}
          onChange={event => updateInlineDraft('amount', event.target.value)}
        />
      ) : (
        <Box className="flex items-center gap-0.5 min-w-[48px] justify-start  px-3.5">
          <Box component="span" sx={{ color: 'secondary.light', display: 'inline-flex' }}>
            <Icon icon="lucide:saudi-riyal" width="1rem" color={row.mode === 'Credit' ? useTheme().palette.success.dark : useTheme().palette.error.dark} />
          </Box>
          <Typography color={row.mode === 'Credit' ? 'success.dark' : 'error.dark'} className="text-[0.95rem]">
            {row.amount}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'closingBalance',
      label: 'Closing Balance',
      align: 'center',
      width: '14%',
      renderCell: row => row.__isInline ? (
        <></>
      ) : (
        <Box className="flex items-center gap-0.5 min-w-[48px] justify-start">

          <Icon icon="lucide:saudi-riyal" width="1rem" color={useTheme().palette.text.secondary} />

          <Typography
            color={getBalanceColor(row.closingBalance ?? row.runningBalance ?? 0)}
            className="text-[0.9rem] font-medium"
          >
            {amountFormat(row.closingBalance ?? row.runningBalance ?? 0)}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: '13%',
      renderCell: row => row.__isInline ? (
        <DraftActions
          submitting={submittingLedger}
          onCancel={cancelInlineRow}
          onSave={saveInlineRow}
        />
      ) : (
        <RowActions
          row={row}
          canUpdate={canUpdate}
          canDelete={canDelete}
          inlineRow={inlineRow}
          submitting={submittingLedger}
          onEdit={startEditRow}
          onDelete={handleDeleteLedger}
        />
      ),
    },
  ];
