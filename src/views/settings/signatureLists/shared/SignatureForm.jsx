'use client'

import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material'
import { Save, Cancel, PhotoCamera } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

const SignatureForm = ({
  signature = {},
  loading = false,
  updating = false,
  error = null,
  onSave,
  onCancel,
  isEdit = false
}) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    signatureName: signature?.signatureName || '',
    markAsDefault: signature?.markAsDefault || false,
    status: signature?.status !== undefined ? signature.status : true
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(signature?.signatureImage || null)
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => {
    const value = field === 'status' || field === 'markAsDefault'
      ? event.target.checked
      : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear image error
      if (errors.signatureImage) {
        setErrors(prev => ({ ...prev, signatureImage: null }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.signatureName.trim()) {
      newErrors.signatureName = 'Signature name is required'
    }

    if (!isEdit && !selectedFile) {
      newErrors.signatureImage = 'Signature image is required'
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
    submitData.append('signatureName', formData.signatureName.trim())
    submitData.append('markAsDefault', formData.markAsDefault)
    submitData.append('status', formData.status)

    if (selectedFile) {
      submitData.append('signatureImage', selectedFile)
    }

    const result = await onSave(submitData)

    if (result?.success) {
      router.push('/settings/signature-lists')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/settings/signature-lists')
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
          {isEdit ? 'Edit Signature' : 'Add Signature'}
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
                label="Signature Name"
                value={formData.signatureName}
                onChange={handleChange('signatureName')}
                error={!!errors.signatureName}
                helperText={errors.signatureName}
                placeholder="Enter signature name"
                disabled={updating}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Signature Image {!isEdit && '*'}
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
                  {imagePreview && (
                    <Avatar
                      src={imagePreview}
                      sx={{ width: 120, height: 60 }}
                      variant="rounded"
                    />
                  )}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="signature-image-upload"
                    type="file"
                    onChange={handleImageChange}
                    disabled={updating}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="signature-image-upload"
                    startIcon={<PhotoCamera />}
                    disabled={updating}
                  >
                    Choose File
                  </Button>
                  {errors.signatureImage && (
                    <Typography variant="caption" color="error">
                      {errors.signatureImage}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.markAsDefault}
                    onChange={handleChange('markAsDefault')}
                    disabled={updating}
                    color="primary"
                  />
                }
                label="Mark as Default"
                sx={{ mt: 2 }}
              />
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
                  {updating ? 'Saving...' : (isEdit ? 'Update Signature' : 'Add Signature')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SignatureForm