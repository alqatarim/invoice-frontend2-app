'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Switch
} from '@mui/material'
import { Save, ArrowBack } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Link from 'next/link'

const bankSettingsSchema = yup.object({
  bankName: yup.string().required('Bank name is required'),
  accountNumber: yup.string().required('Account number is required'),
  accountHolderName: yup.string().required('Account holder name is required'),
  branchName: yup.string().required('Branch name is required'),
  ifscCode: yup.string().required('IFSC code is required'),
  swiftCode: yup.string(),
  accountType: yup.string(),
  isActive: yup.boolean()
})

const BankSettingsForm = ({ 
  mode = 'add', // 'add', 'edit', 'view'
  bankData = null,
  loading = false, 
  error = null, 
  onSubmit,
  onClearError 
}) => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(bankSettingsSchema),
    defaultValues: {
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      branchName: '',
      ifscCode: '',
      swiftCode: '',
      accountType: 'Savings',
      isActive: true
    }
  })

  useEffect(() => {
    if (bankData && mode !== 'add') {
      reset({
        bankName: bankData.bankName || '',
        accountNumber: bankData.accountNumber || '',
        accountHolderName: bankData.accountHolderName || '',
        branchName: bankData.branchName || '',
        ifscCode: bankData.ifscCode || '',
        swiftCode: bankData.swiftCode || '',
        accountType: bankData.accountType || 'Savings',
        isActive: bankData.isActive ?? true
      })
    }
  }, [bankData, mode, reset])

  const handleFormSubmit = async (data) => {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    
    const result = await onSubmit(formData)
    if (result?.success) {
      router.push('/settings/bank-settings-list')
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            component={Link}
            href="/settings/bank-settings-list"
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back to List
          </Button>
          <Typography variant="h6">
            {mode === 'add' ? 'Add New Bank Account' : 
             mode === 'edit' ? 'Edit Bank Account' : 
             'View Bank Account'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={onClearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Bank Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bank Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                {...register('bankName')}
                error={!!errors.bankName}
                helperText={errors.bankName?.message}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch Name"
                {...register('branchName')}
                error={!!errors.branchName}
                helperText={errors.branchName?.message}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                {...register('ifscCode')}
                error={!!errors.ifscCode}
                helperText={errors.ifscCode?.message}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SWIFT Code (Optional)"
                {...register('swiftCode')}
                error={!!errors.swiftCode}
                helperText={errors.swiftCode?.message}
                disabled={isReadOnly}
              />
            </Grid>

            {/* Account Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Account Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                {...register('accountNumber')}
                error={!!errors.accountNumber}
                helperText={errors.accountNumber?.message}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Holder Name"
                {...register('accountHolderName')}
                error={!!errors.accountHolderName}
                helperText={errors.accountHolderName?.message}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Type"
                select
                SelectProps={{ native: true }}
                {...register('accountType')}
                error={!!errors.accountType}
                helperText={errors.accountType?.message}
                disabled={isReadOnly}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    {...register('isActive')}
                    defaultChecked={true}
                    disabled={isReadOnly}
                    onChange={(e) => setValue('isActive', e.target.checked)}
                  />
                }
                label="Active Account"
              />
            </Grid>

            {/* Actions */}
            {!isReadOnly && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || loading}
                    startIcon={isSubmitting || loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    {isSubmitting || loading ? 'Saving...' : mode === 'add' ? 'Add Bank Account' : 'Update Bank Account'}
                  </Button>
                  <Button
                    component={Link}
                    href="/settings/bank-settings-list"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BankSettingsForm