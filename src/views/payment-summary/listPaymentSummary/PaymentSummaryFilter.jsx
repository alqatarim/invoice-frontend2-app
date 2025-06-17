'use client'

import React, { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { Icon } from '@iconify/react';

const PaymentSummaryFilter = ({
  open,
  onClose,
  onApply,
  onReset,
  customerOptions,
  customerSearchLoading,
  handleCustomerSearch,
  selectedCustomers,
  handleCustomerSelection,
}) => {
  const [searchInputValue, setSearchInputValue] = useState('')

  const handleSearchChange = (value) => {
    setSearchInputValue(value)
    handleCustomerSearch(value)
  }

  const handleApply = () => {
    onApply()
  }

  const handleReset = () => {
    onReset()
    setSearchInputValue('')
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: 300, sm: 400 } }
      }}
    >
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant='h5'>Filter</Typography>
          <IconButton onClick={onClose}>
            <Icon icon='mdi:close' />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
            Customer
          </Typography>

          <TextField
            fullWidth
            size='small'
            placeholder='Search Customers'
            value={searchInputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:magnify' />
                </InputAdornment>
              ),
              endAdornment: customerSearchLoading && (
                <InputAdornment position='end'>
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {customerOptions.length > 0 ? (
              customerOptions.map((customer) => (
                <FormControlLabel
                  key={customer.value}
                  control={
                    <Checkbox
                      checked={selectedCustomers.includes(customer.value)}
                      onChange={(e) => handleCustomerSelection(customer.value, e.target.checked)}
                    />
                  }
                  label={customer.label}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))
            ) : (
              searchInputValue && !customerSearchLoading && (
                <Typography variant='body2' color='text.secondary'>
                  No customers found
                </Typography>
              )
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            fullWidth
            variant='contained'
            onClick={handleApply}
            disabled={selectedCustomers.length === 0}
          >
            {selectedCustomers.length > 0 ? 'Apply' : 'Select Customers'}
          </Button>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleReset}
            disabled={selectedCustomers.length === 0}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default PaymentSummaryFilter