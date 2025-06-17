'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import { Icon } from '@iconify/react';

const PaymentSummaryHead = ({ onFilterClick, isFilterApplied }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='h4'>Payment Summary</Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Badge
          color='error'
          variant='dot'
          invisible={!isFilterApplied}
          sx={{ '& .MuiBadge-badge': { top: 4, right: 4 } }}
        >
          <Button
            variant='outlined'
            startIcon={<Icon icon='mdi:filter-outline' />}
            onClick={onFilterClick}
          >
            Filter
          </Button>
        </Badge>
      </Box>
    </Box>
  )
}

export default PaymentSummaryHead