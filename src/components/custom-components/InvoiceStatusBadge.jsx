import React from 'react';
import { Chip } from '@mui/material';
import { convertFirstLetterToCapital } from '@/utils/string';
import { statusOptions } from '@/data/dataSets';

/**
 * InvoiceStatusBadge
 * @param {string} status - The invoice status
 * @returns {JSX.Element}
 */
const InvoiceStatusBadge = ({ status }) => {
  const statusObj = statusOptions.find(opt => opt.value === status);
  const color = statusObj?.color || 'default';
  const label = statusObj?.label || convertFirstLetterToCapital(status?.replace('_', ' '));
  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="tonal"
    />
  );
};

export default InvoiceStatusBadge;