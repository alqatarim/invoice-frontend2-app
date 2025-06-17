'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  Grid,
  Card,
  Typography
} from '@mui/material'
import {
  PhotoCamera
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Icon } from '@iconify/react'
import CustomListTable from '@/components/custom-components/CustomListTable'
import SignatureFilter from './signatureFilter'
import { getSignatureColumns } from './signatureColumns'

const signatureSchema = yup.object({
  signatureName: yup.string().required('Signature name is required')
})

const SignatureListView = ({
  initialSignatures = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
  onToggleStatus
}) => {
  const theme = useTheme();
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [markAsDefault, setMarkAsDefault] = useState(false)
  const [status, setStatus] = useState(true)

  // Filter states
  const [filterValues, setFilterValues] = useState({
    signatureName: [],
    status: ['ALL']
  });
  const [signatures, setSignatures] = useState(initialSignatures);

  // Update signatures when initial signatures change
  useEffect(() => {
    setSignatures(initialSignatures)
  }, [initialSignatures])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(signatureSchema)
  })

  const handleAddClick = () => {
    reset()
    setImagePreview(null)
    setSelectedFile(null)
    setMarkAsDefault(false)
    setStatus(true)
    setAddDialogOpen(true)
  }

  const handleEditClick = useCallback((signature) => {
    setSelectedSignature(signature)
    setValue('signatureName', signature.signatureName)
    setImagePreview(signature.signatureImage)
    setMarkAsDefault(signature.markAsDefault || false)
    setStatus(signature.status || true)
    setSelectedFile(null)
    setEditDialogOpen(true)
  }, [setValue])

  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }, [])

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onAddSubmit = async (data) => {
    // Validate required signature image before proceeding
    if (!selectedFile) {
      // Set form error for missing image instead of calling backend
      // This is handled at the form level, not backend level
      return;
    }

    const formData = new FormData()
    formData.append('signatureName', data.signatureName)
    formData.append('signatureImage', selectedFile)
    formData.append('markAsDefault', markAsDefault)
    formData.append('status', status)

    try {
      const result = await onAdd(formData)
      // Only proceed with UI updates if backend confirms success
      if (result?.success) {
        setAddDialogOpen(false)
        reset()
        setImagePreview(null)
        setSelectedFile(null)
        setMarkAsDefault(false)
        setStatus(true)
      }
      // If result.success is false, error handling is done by actionHandler
    } catch (error) {
      // Error handling is done by actionHandler, just ensure UI doesn't update
      console.error('Add signature failed:', error)
    }
  }

  const onEditSubmit = async (data) => {
    const formData = new FormData()
    formData.append('signatureName', data.signatureName)
    formData.append('markAsDefault', markAsDefault)
    formData.append('status', status)

    if (selectedFile) {
      formData.append('signatureImage', selectedFile)
    }

    try {
      const result = await onEdit(selectedSignature._id, formData)
      // Only proceed with UI updates if backend confirms success
      if (result?.success) {
        setEditDialogOpen(false)
        setSelectedSignature(null)
        reset()
        setImagePreview(null)
        setSelectedFile(null)
        setMarkAsDefault(false)
        setStatus(true)
      }
      // If result.success is false, error handling is done by actionHandler
    } catch (error) {
      // Error handling is done by actionHandler, just ensure UI doesn't update
      console.error('Edit signature failed:', error)
    }
  }

  const confirmDelete = async () => {
    try {
      const result = await onDelete(deleteId)
      // Only proceed with UI updates if backend confirms success
      if (result?.success) {
        setDeleteDialogOpen(false)
        setDeleteId(null)
      }
      // If result.success is false, error handling is done by actionHandler
    } catch (error) {
      // Error handling is done by actionHandler, just ensure UI doesn't update
      console.error('Delete signature failed:', error)
    }
  }

  // Filter handlers
  const handleFilterValueChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterApply = (filters) => {
    setFilterValues({
      signatureName: filters.signatureName || [],
      status: filters.status || ['ALL']
    });
  };

  const handleFilterReset = () => {
    setFilterValues({
      signatureName: [],
      status: ['ALL']
    });
  };

  const handleTabChange = (event, newTab) => {
    setFilterValues(prev => ({ ...prev, status: newTab }));
  };

  // Apply filters to get filtered signatures
  const getFilteredSignatures = () => {
    let filtered = signatures;

    // Filter by status
    if (filterValues.status && filterValues.status.length > 0 && !filterValues.status.includes('ALL')) {
      filtered = filtered.filter(sig => {
        if (filterValues.status.includes('ACTIVE') && sig.status) return true;
        if (filterValues.status.includes('INACTIVE') && !sig.status) return true;
        if (filterValues.status.includes('DEFAULT') && sig.markAsDefault) return true;
        return false;
      });
    }

    // Filter by signature name
    if (filterValues.signatureName && filterValues.signatureName.length > 0) {
      filtered = filtered.filter(sig => filterValues.signatureName.includes(sig._id));
    }

    return filtered;
  };

  const filteredSignatures = getFilteredSignatures();

  // Simple computed values - no memoization needed for these
  const signatureNameOptions = signatures.map(sig => ({ value: sig._id, label: sig.signatureName }));
  const columns = getSignatureColumns({ theme });

  // Table columns with handlers
  const tableColumns = columns.map(col => ({
    ...col,
    renderCell: col.renderCell ?
      (row, index) => col.renderCell(row, {
        onEdit: handleEditClick,
        onDelete: handleDeleteClick,
        onSetDefault,
        onToggleStatus,
        index
      }) : undefined
  }));

  return (
    <div className='flex flex-col gap-5'>
      <Grid container spacing={3}>
        {/* Add Signature Button */}
        <Grid item xs={12}>
          <div className="flex justify-end">
            <Button
              variant="contained"
              startIcon={<Icon icon="tabler:plus" />}
              onClick={handleAddClick}
            >
              Add Signature
            </Button>
          </div>
        </Grid>

        {/* Filter Component */}
        <Grid item xs={12}>
          <SignatureFilter
            onChange={handleFilterValueChange}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
            signatureNameOptions={signatureNameOptions}
            values={filterValues}
            tab={filterValues.status}
            onTabChange={handleTabChange}
          />
        </Grid>

        {/* Signatures Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={filteredSignatures}
              loading={loading}
              pagination={{
                page: 0,
                pageSize: 10,
                total: filteredSignatures.length
              }}
              noDataText="No signatures found. Add your first signature to get started."
              rowKey={(row) => row._id}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Add Signature Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Signature</DialogTitle>
        <form onSubmit={handleSubmit(onAddSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                label="Signature Name"
                {...register('signatureName')}
                error={!!errors.signatureName}
                helperText={errors.signatureName?.message}
                required
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Signature Image
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
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
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="signature-image-upload"
                    startIcon={<PhotoCamera />}
                  >
                    Choose File
                  </Button>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={markAsDefault}
                    onChange={(e) => setMarkAsDefault(e.target.checked)}
                  />
                }
                label="Mark as Default"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                  />
                }
                label="Status"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Signature</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Signature Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Signature</DialogTitle>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                fullWidth
                label="Signature Name"
                {...register('signatureName')}
                error={!!errors.signatureName}
                helperText={errors.signatureName?.message}
                required
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Signature Image
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
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
                    id="edit-signature-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="edit-signature-image-upload"
                    startIcon={<PhotoCamera />}
                  >
                    Choose File
                  </Button>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={markAsDefault}
                    onChange={(e) => setMarkAsDefault(e.target.checked)}
                  />
                }
                label="Mark as Default"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                  />
                }
                label="Status"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update Signature</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Signature</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this signature?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SignatureListView