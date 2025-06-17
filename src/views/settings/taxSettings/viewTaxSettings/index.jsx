'use client'

import { useEffect } from 'react'
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTaxSettingsHandlers } from '@/handlers/settings/useTaxSettingsHandlers'
import SettingsLayout from '../../shared/SettingsLayout'

const ViewTaxSettingsIndex = ({ taxId, initialData = {} }) => {
  const router = useRouter()
  const { 
    state, 
    dataHandlers,
    actionHandlers 
  } = useTaxSettingsHandlers(initialData)

  const id = taxId
  const currentTax = state.currentTax || state.selectedTax || initialData.selectedTax

  useEffect(() => {
    if (id && !currentTax) {
      dataHandlers.loadTaxById(id)
    }
  }, [id])

  if (state.loading) {
    return (
      <SettingsLayout
        title="View Tax Rate"
        breadcrumb={[
          { label: 'Settings', href: '/settings' },
          { label: 'Tax Settings', href: '/settings/tax-settings/list' },
          { label: 'View Tax Rate', current: true }
        ]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </SettingsLayout>
    )
  }

  if (state.error) {
    return (
      <SettingsLayout
        title="View Tax Rate"
        breadcrumb={[
          { label: 'Settings', href: '/settings' },
          { label: 'Tax Settings', href: '/settings/tax-settings/list' },
          { label: 'View Tax Rate', current: true }
        ]}
      >
        <Alert severity="error">{state.error}</Alert>
      </SettingsLayout>
    )
  }

  const tax = currentTax

  if (!tax) {
    return (
      <SettingsLayout
        title="View Tax Rate"
        breadcrumb={[
          { label: 'Settings', href: '/settings' },
          { label: 'Tax Settings', href: '/settings/tax-settings/list' },
          { label: 'View Tax Rate', current: true }
        ]}
      >
        <Alert severity="warning">Tax rate not found</Alert>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout
      title="View Tax Rate"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Tax Settings', href: '/settings/tax-settings/list' },
        { label: 'View Tax Rate', current: true }
      ]}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Tax Rate Details</Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/settings/tax-settings/list')}
              >
                Back to List
              </Button>
              <Button
                component={Link}
                href={`/settings/tax-settings/edit/${id}`}
                variant="contained"
                startIcon={<Edit />}
              >
                Edit Tax Rate
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tax Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {tax.name || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tax Rate
              </Typography>
              <Typography variant="body1" gutterBottom>
                {tax.taxRate ? `${tax.taxRate}%` : '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tax Type
              </Typography>
              <Typography variant="body1" gutterBottom>
                {tax.type || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={tax.status ? 'Active' : 'Inactive'}
                color={tax.status ? 'success' : 'default'}
                size="small"
              />
            </Grid>

            {tax.createdAt && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(tax.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            )}

            {tax.updatedAt && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(tax.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </SettingsLayout>
  )
}

export default ViewTaxSettingsIndex