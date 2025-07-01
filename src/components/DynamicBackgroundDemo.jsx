'use client'

import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Button, Chip } from '@mui/material'
import { Icon } from '@iconify/react'
import { useDynamicBackground } from '@/hooks'

/**
 * Demo component showcasing dynamic background generation from company logos
 * This can be used in settings or admin panels to preview background generation
 */
const DynamicBackgroundDemo = ({ companyLogo, companyName }) => {
  const [selectedPattern, setSelectedPattern] = useState('gradient')

  // Generate backgrounds with different patterns
  const gradientBg = useDynamicBackground(companyLogo, {
    pattern: 'gradient',
    colorCount: 4,
    addPattern: false
  })

  const radialBg = useDynamicBackground(companyLogo, {
    pattern: 'radial',
    colorCount: 3,
    addPattern: false
  })

  const wavesBg = useDynamicBackground(companyLogo, {
    pattern: 'waves',
    colorCount: 4,
    addPattern: true
  })

  const barsBg = useDynamicBackground(companyLogo, {
    pattern: 'bars',
    colorCount: 4,
    barDirection: 'horizontal',
    addPattern: false
  })

  const patterns = [
    { name: 'gradient', label: 'Linear Gradient', demo: gradientBg },
    { name: 'radial', label: 'Radial Gradient', demo: radialBg },
    { name: 'waves', label: 'Waves Pattern', demo: wavesBg },
    { name: 'bars', label: 'Color Bars', demo: barsBg }
  ]

  if (!companyLogo) {
    return (
      <Card>
        <CardContent className='text-center py-8'>
          <Icon icon='mdi:image-off-outline' fontSize='3rem' className='text-gray-400 mb-4' />
          <Typography variant='h6' color='textSecondary'>
            Upload a company logo to see dynamic background generation
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box className='space-y-6'>
      {/* Company Logo Display */}
      <Card>
        <CardContent>
          <Box className='flex items-center gap-4 mb-4'>
            <img
              src={companyLogo}
              alt='Company Logo'
              className='w-16 h-16 object-contain rounded-lg border'
            />
            <Box>
              <Typography variant='h6'>{companyName || 'Company Logo'}</Typography>
              <Typography variant='body2' color='textSecondary'>
                Source image for background generation
              </Typography>
            </Box>
          </Box>

          {/* Extracted Colors */}
          {gradientBg.extractedColors.length > 0 && (
            <Box>
              <Typography variant='subtitle2' className='mb-2'>
                Extracted Colors:
              </Typography>
              <Box className='flex gap-2'>
                {gradientBg.extractedColors.map((color, index) => (
                  <Chip
                    key={index}
                    label={color}
                    size='small'
                    style={{
                      backgroundColor: color,
                      color: '#fff',
                      fontFamily: 'monospace'
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pattern Previews */}
      <Typography variant='h6' className='mb-4'>
        Generated Background Patterns
      </Typography>

      <Grid container spacing={3}>
        {patterns.map((pattern) => (
          <Grid size={{xs:12, md:4}} key={pattern.name}>
            <Card
              className={`cursor-pointer transition-all ${
                selectedPattern === pattern.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPattern(pattern.name)}
            >
              {/* Preview Area */}
              <Box
                className='h-32 relative overflow-hidden'
                style={{
                  backgroundImage: `url(${pattern.demo.backgroundSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {pattern.demo.isGenerating && (
                  <Box className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                    <Icon icon='mdi:loading' className='animate-spin text-white text-2xl' />
                  </Box>
                )}

                <Box className='absolute bottom-2 left-2'>
                  <Chip
                    label={pattern.label}
                    size='small'
                    className='bg-black bg-opacity-70 text-white'
                  />
                </Box>
              </Box>

              <CardContent>
                <Typography variant='subtitle1'>{pattern.label}</Typography>
                <Typography variant='body2' color='textSecondary'>
                  {pattern.name === 'gradient' && 'Smooth linear color transitions'}
                  {pattern.name === 'radial' && 'Circular color gradients'}
                  {pattern.name === 'waves' && 'Layered wave-like patterns'}
                  {pattern.name === 'bars' && 'Elegant diagonal bars with depth and shadows'}
                </Typography>

                {pattern.demo.isDynamic && (
                  <Box className='flex items-center gap-1 mt-2'>
                    <Icon icon='mdi:check-circle' className='text-green-500 text-sm' />
                    <Typography variant='caption' className='text-green-600'>
                      Generated successfully
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Full Preview */}
      <Card>
        <Box
          className='h-64 relative overflow-hidden'
          style={{
            backgroundImage: `url(${patterns.find(p => p.name === selectedPattern)?.demo.backgroundSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <Box className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
            <Box className='text-center text-white'>
              <Typography variant='h4' className='mb-2 font-bold'>
                {companyName || 'Your Company'}
              </Typography>
              <Typography variant='subtitle1'>
                Dynamic cover generated from logo colors
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent>
          <Typography variant='h6' className='mb-2'>
            Full Preview - {patterns.find(p => p.name === selectedPattern)?.label}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            This is how the background would appear as a profile cover image.
            The colors are automatically extracted from your company logo to create
            a cohesive and branded appearance.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DynamicBackgroundDemo