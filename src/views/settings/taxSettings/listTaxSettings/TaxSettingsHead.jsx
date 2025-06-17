'use client'

import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import Link from 'next/link'

const TaxSettingsHead = () => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h4" component="h1">
        Tax Settings
      </Typography>
      
      <Button
        component={Link}
        href="/settings/tax-settings/add"
        variant="contained"
        startIcon={<Add />}
        sx={{
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }}
      >
        Add Tax Rate
      </Button>
    </Box>
  )
}

export default TaxSettingsHead