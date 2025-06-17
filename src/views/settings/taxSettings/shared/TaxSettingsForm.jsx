'use client'

import { useState } from 'react'
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const TaxSettingsForm = ({ 
  tax = {}, 
  loading = false, 
  updating = false, 
  error = null, 
  onSave, 
  onCancel,
  isEdit = false 
}) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: tax?.name || '',
    taxRate: tax?.taxRate || '',
    status: tax?.status !== undefined ? tax.status : true
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => {
    const value = field === 'status' ? event.target.checked : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tax name is required'
    }
    
    if (!formData.taxRate || formData.taxRate <= 0) {
      newErrors.taxRate = 'Tax rate must be greater than 0'
    }
    
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = new FormData()
    submitData.append('name', formData.name.trim())
    submitData.append('taxRate', formData.taxRate.toString())
    submitData.append('type', 'percentage')
    submitData.append('status', formData.status)

    const result = await onSave(submitData)
    
    if (result?.success) {
      router.push('/settings/tax-settings-list')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/settings/tax-settings-list')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Edit Tax Rate' : 'Add Tax Rate'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., GST, VAT, Sales Tax"
                disabled={updating}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate"
                type="number"
                value={formData.taxRate}
                onChange={handleChange('taxRate')}
                error={!!errors.taxRate}
                helperText={errors.taxRate}
                placeholder="Enter rate (e.g., 18 for 18%)"
                disabled={updating}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Tax Type</InputLabel>
                <Select
                  value="percentage"
                  label="Tax Type"
                  disabled={true}
                  required
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                </Select>
                {errors.type && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.type}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={handleChange('status')}
                    disabled={updating}
                    color="primary"
                  />
                }
                label="Active Status"
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={updating}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updating}
                  startIcon={updating ? <CircularProgress size={20} /> : <Save />}
                >
                  {updating ? 'Saving...' : (isEdit ? 'Update Tax Rate' : 'Add Tax Rate')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TaxSettingsForm