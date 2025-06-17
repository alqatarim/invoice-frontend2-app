'use client'

import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import Link from 'next/link'

const BankSettingsHead = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={3}
      flexWrap="wrap"
      gap={2}
    >
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Bank Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your company bank accounts for payments and transactions
        </Typography>
      </Box>
      
      <Button
        component={Link}
        href="/settings/bank-settings/add"
        variant="contained"
        startIcon={<Add />}
      >
        Add Bank Account
      </Button>
    </Box>
  )
}

export default BankSettingsHead