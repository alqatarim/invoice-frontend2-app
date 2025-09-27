'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip
} from '@mui/material'
import { Visibility, Star, StarBorder } from '@mui/icons-material'
import { toast } from 'react-toastify'

// Mock template data - in real implementation, these would come from the server
const invoiceTemplates = [
  { id: '1', name: 'General Invoice 1', image: '/images/invoices/invoice1.jpg' },
  { id: '2', name: 'General Invoice 2', image: '/images/invoices/invoice2.jpg' },
  { id: '3', name: 'General Invoice 3', image: '/images/invoices/invoice3.jpg' },
  { id: '4', name: 'General Invoice 4', image: '/images/invoices/invoice4.jpg' },
  { id: '5', name: 'General Invoice 5', image: '/images/invoices/invoice5.jpg' },
]

const InvoiceTemplatesView = ({
  templates = invoiceTemplates,
  defaultTemplate,
  loading,
  updating,
  error,
  onSetDefault,
  onRefresh
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handlePreview = (template) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }

  const handleSetDefault = async (templateId) => {
    try {
      const result = await onSetDefault(templateId)
      if (result?.success) {
        toast.success('Default template updated successfully!')
      } else {
        toast.error(result?.message || 'Failed to update default template')
      }
    } catch (error) {
      toast.error('An error occurred while updating default template')
    }
  }

  const isDefault = (templateId) => {
    return defaultTemplate === templateId || defaultTemplate?.id === templateId
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Invoice Templates
          </Typography>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={template.id}>
                <Card
                  sx={{
                    position: 'relative',
                    '&:hover': { boxShadow: 3 },
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={template.image}
                      alt={template.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePreview(template)}
                    />

                    {/* Preview overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        cursor: 'pointer',
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={() => handlePreview(template)}
                    >
                      <IconButton color="primary" sx={{ color: 'white' }}>
                        <Visibility />
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {template.name}
                      </Typography>

                      <Tooltip title="Make as default" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => handleSetDefault(template.id)}
                          disabled={updating}
                          sx={{
                            color: isDefault(template.id) ? 'primary.main' : 'text.secondary',
                            backgroundColor: isDefault(template.id) ? 'primary.light' : 'transparent',
                            '&:hover': {
                              backgroundColor: isDefault(template.id) ? 'primary.main' : 'action.hover',
                              color: isDefault(template.id) ? 'white' : 'primary.main'
                            }
                          }}
                        >
                          {isDefault(template.id) ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedTemplate && (
            <img
              src={selectedTemplate.image}
              alt={selectedTemplate.name}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InvoiceTemplatesView