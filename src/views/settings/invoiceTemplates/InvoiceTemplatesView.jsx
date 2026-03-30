'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { Refresh, Star, Visibility } from '@mui/icons-material'
import { toast } from 'react-toastify'
import {
  getInvoiceTemplateMeta,
  invoiceTemplateCatalog,
  resolveInvoiceTemplateId,
} from '@/common/invoiceTemplateCatalog'

const InvoiceTemplatesView = ({
  templates = invoiceTemplateCatalog,
  defaultTemplateId,
  loading = false,
  updating = false,
  error = null,
  canUpdate = true,
  onSetDefault,
  onRefresh
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const currentDefaultTemplate = useMemo(
    () => getInvoiceTemplateMeta(defaultTemplateId),
    [defaultTemplateId]
  )

  const handlePreview = (template) => {
    setSelectedTemplate(template)
  }

  const handleSetDefault = async (templateId) => {
    if (!onSetDefault) return

    try {
      const result = await onSetDefault(templateId)

      if (result?.success) {
        toast.success('Default template updated successfully.')
      } else {
        toast.error(result?.message || 'Failed to update the default template.')
      }
    } catch (error) {
      toast.error('An error occurred while updating the default template.')
    }
  }

  const isDefault = (templateId) => {
    return resolveInvoiceTemplateId(defaultTemplateId) === templateId
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 3,
              flexDirection: { xs: 'column', md: 'row' }
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Invoice Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the default layout used for invoice print and document preview.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                color="primary"
                variant="tonal"
                label={`Default: ${currentDefaultTemplate.name}`}
              />
              {!canUpdate ? (
                <Chip
                  variant="outlined"
                  label="View Only"
                />
              ) : null}
              {onRefresh ? (
                <Tooltip title="Refresh templates">
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={onRefresh}
                      disabled={loading || updating}
                    >
                      Refresh
                    </Button>
                  </span>
                </Tooltip>
              ) : null}
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={template.id}>
                <Card
                  sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: theme => isDefault(template.id)
                      ? `1px solid ${theme.palette.primary.main}`
                      : '1px solid transparent',
                    '&:hover': { boxShadow: 3 },
                    transition: 'box-shadow 0.2s, border-color 0.2s'
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
                      <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<Visibility />}
                        sx={{ color: 'common.black', bgcolor: 'common.white' }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      </Box>

                      {isDefault(template.id) ? (
                        <Chip
                          size="small"
                          color="primary"
                          icon={<Star fontSize="small" />}
                          label="Default"
                        />
                      ) : null}
                    </Box>

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handlePreview(template)}
                      >
                        Preview
                      </Button>
                      <Button
                        fullWidth
                        variant={isDefault(template.id) ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={<Star />}
                        onClick={() => handleSetDefault(template.id)}
                        disabled={!canUpdate || updating || isDefault(template.id)}
                      >
                        {isDefault(template.id) ? 'Selected' : 'Set Default'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            The selected default template is applied to invoice print and preview flows. Signature visibility still depends on the signature chosen on each document.
          </Alert>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedTemplate)}
        onClose={() => setSelectedTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name || 'Template Preview'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTemplate ? (
            <Box>
              <img
                src={selectedTemplate.image}
                alt={selectedTemplate.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedTemplate.description}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTemplate(null)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Star />}
            onClick={() => selectedTemplate && handleSetDefault(selectedTemplate.id)}
            disabled={!canUpdate || !selectedTemplate || updating || isDefault(selectedTemplate?.id)}
          >
            {isDefault(selectedTemplate?.id) ? 'Current Default' : 'Use This Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InvoiceTemplatesView