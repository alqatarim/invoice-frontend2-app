'use client';

import Link from 'next/link';
import { Box, Button, IconButton, Chip } from '@mui/material';
import { Icon } from '@iconify/react';

const PaymentHead = ({
  onFilterToggle,
  isFilterApplied,
  filterCount,
  onFilterReset,
}) => {
  return (
    <Box className="flex justify-end items-center gap-2">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          color="primary"
          variant="outlined"
          size="medium"
          onClick={isFilterApplied ? onFilterReset : onFilterToggle}
        >
          <Icon
            height="25px"
            icon={isFilterApplied ? "line-md:filter-remove-twotone" : "line-md:filter-twotone"}
          />
        </IconButton>
        
        {isFilterApplied && filterCount > 0 && (
          <Chip
            label={`${filterCount} filter${filterCount > 1 ? 's' : ''} applied`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={onFilterReset}
          />
        )}
      </Box>

      <Button
        variant="contained"
        startIcon={<Icon icon="mdi:plus" />}
        component={Link}
        href="/payments/payment-add"
      >
        Add Payment
      </Button>
    </Box>
  );
};

export default PaymentHead;