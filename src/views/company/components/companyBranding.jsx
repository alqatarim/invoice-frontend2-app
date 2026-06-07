'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import CustomAvatar from '@core/components/mui/Avatar'
import SectionHeader from '@components/headers/SectionHeader'

const BRANDING_IMAGE_ACCEPT = 'image/jpeg,image/png,image/jpg,image/gif'

const BrandingDropzone = ({ preview, onSelectFile, onClear, readOnly }) => {
  const hasPreview = Boolean(preview)

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    disabled: readOnly,
    accept: BRANDING_IMAGE_ACCEPT,
    onDrop: acceptedFiles => {
      const file = acceptedFiles?.[0]
      if (file) onSelectFile(file)
    },
  })

  const isDraggingValidImage = isDragActive && isDragAccept

  return (
    <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
      <Box
        {...getRootProps()}
        sx={theme => ({
          '@keyframes brandingDropPulse': {
            '0%, 100%': {
              boxShadow: `0 0 0 0 ${theme.palette.primary.main}33`,
            },
            '50%': {
              boxShadow: `0 0 0 6px ${theme.palette.primary.main}14`,
            },
          },
          width: 120,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          p: 1,
          borderRadius: 1,
          overflow: 'hidden',
          border: '2px dashed',
          borderColor: isDragReject
            ? theme.palette.primary.main
            : isDraggingValidImage
              ? theme.palette.primary.main
              : theme.palette.divider,
          bgcolor: isDraggingValidImage
            ? theme.palette.action.hover
            : isDragReject
              ? theme.palette.action.hover
              : 'transparent',
          cursor: readOnly ? 'default' : 'pointer',
          transform: isDraggingValidImage ? 'scale(1.04)' : 'scale(1)',
          transition:
            'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          animation: isDraggingValidImage ? 'brandingDropPulse 1.2s ease-in-out infinite' : 'none',
        })}
      >
        <input {...getInputProps()} />
        {hasPreview ? (
          <Box
            component='img'
            src={preview}
            alt='Upload preview'
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <>
            <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
              <i className='ri-upload-2-line' />
            </CustomAvatar>
            <Typography variant='caption' color='text.secondary'>
              Click or drop
            </Typography>
          </>
        )}
      </Box>
      {hasPreview && !readOnly ? (
        <Button variant='outlined' color='error' size='small' onClick={onClear}>
          Remove
        </Button>
      ) : null}
    </Box>
  )
}

const CompanyBranding = ({
  logoPreview,
  faviconPreview,
  companyIconPreview,
  selectLogoFile,
  selectFaviconFile,
  selectCompanyIconFile,
  clearLogoSelection,
  clearFaviconSelection,
  clearCompanyIconSelection,
  readOnly = false,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      <SectionHeader title='Branding' icon='ri-palette-line' color='warning' className='mb-5' />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' color='text.secondary' fontWeight={500}>
                Site Logo
              </Typography>
              <Typography variant='caption' gutterBottom>
                JPEG, PNG, JPG (Max 800*400px)
              </Typography>
              <BrandingDropzone
                preview={logoPreview}
                onSelectFile={selectLogoFile}
                onClear={clearLogoSelection}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' color='text.secondary' fontWeight={500}>
                Favicon
              </Typography>
              <Typography variant='caption' gutterBottom>
                JPEG, PNG, JPG (Max 35*35px)
              </Typography>
              <BrandingDropzone
                preview={faviconPreview}
                onSelectFile={selectFaviconFile}
                onClear={clearFaviconSelection}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' color='text.secondary' fontWeight={500}>
                Company Icon
              </Typography>
              <Typography variant='caption' gutterBottom>
                SVG, PNG, JPG (Max 100*100px)
              </Typography>
              <BrandingDropzone
                preview={companyIconPreview}
                onSelectFile={selectCompanyIconFile}
                onClear={clearCompanyIconSelection}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

export default CompanyBranding
