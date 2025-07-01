'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Icon } from '@iconify/react'
import { useTheme } from '@mui/material/styles'

// Custom Components
import CustomChip from '@/components/custom-components/CustomChip'
import AnimatedDynamicCover from '@/components/AnimatedDynamicCover'

// Hooks
import { useDynamicBackground } from '@/hooks'

import { roleOptions } from '@/data/dataSets'

const UserProfileHeader = ({ data }) => {
  const avatarSrc = data?.image || '/images/avatars/1.png'
  const fullName = data?.firstName && data?.lastName
    ? `${data.firstName} ${data.lastName}`
    : data?.fullname || 'User Profile'
  const theme = useTheme()

  // Use dynamic background hook for company logo-based cover generation
  const {
    isGenerating: isGeneratingCover,
    isDynamic: isDynamicCover,
    extractedColors
  } = useDynamicBackground(data?.companyLogo, {
    fallbackImage: '/images/pages/profile-banner.png',
    colorCount: 4
  })
  return (
    <Card>
      <Box className='relative'>
        <Box className='bs-[250px] overflow-hidden'>
          <AnimatedDynamicCover 
            colors={extractedColors}
          />
        </Box>
        {/* Loading indicator while generating cover */}
        {isGeneratingCover && (
          <Box className='absolute top-4 right-4 flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm'>
            <Icon icon='mdi:palette' fontSize={16} className='animate-pulse' />
            <Typography variant='caption' className='text-white'>
              Extracting colors...
            </Typography>
          </Box>
        )}
        {/* Indicator that cover is generated from company logo */}
        {data?.companyLogo && !isGeneratingCover && isDynamicCover && (
          <Box className='absolute top-4 right-4 flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm'>
            <Icon icon='mdi:palette-swatch' fontSize={16} />
            <Typography variant='caption' className='text-white'>
              Generated from company logo
            </Typography>
            {/* Show extracted colors as small dots */}
            {extractedColors.length > 0 && (
              <Box className='flex gap-1 ml-1'>
                {extractedColors.slice(0, 3).map((color, index) => (
                  <Box
                    key={index}
                    className='w-3 h-3 rounded-full border border-white'
                    style={{ backgroundColor: color }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <Box className='flex rounded-bs-md mbs-[-45px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
          {avatarSrc ? (
            <img
              height={120}
              width={120}
              src={avatarSrc}
              className='rounded'
              alt='Profile Background'
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <Box className='flex items-center justify-center h-[120px] w-[120px] rounded bg-primary text-white text-2xl font-medium'>
              {data?.firstName?.[0]?.toUpperCase() || data?.fullname?.[0]?.toUpperCase() || 'U'}
            </Box>
          )}
        </Box>
        <Box className='flex is-full flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <Box className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{fullName}</Typography>
            {data?.userName && (
              <Typography variant='subtitle1' className='text-textSecondary'>
                @{data.userName}
              </Typography>
            )}
            {data?.companyName && (
              <Box className='flex items-center gap-2'>
                <Icon icon='mdi:office-building-outline' fontSize={20} color={theme.palette.primary.main} />
                <Typography variant='subtitle2' className='text-primary font-medium'>
                  {data.companyName}
                </Typography>
              </Box>
            )}
            <Box className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              {data?.email && (
                <Box className='flex items-center gap-2'>
                  <Icon icon='mdi:email-outline' fontSize={23} color={theme.palette.secondary.main} />
                  <Typography className='font-medium'>{data.email}</Typography>
                </Box>
              )}
              {data?.mobileNumber && (
                <Box className='flex items-center gap-2'>
                  <Icon icon='mdi:phone-led-outline' fontSize={23} color={theme.palette.secondary.main} />
                  <Typography className='font-medium'>{data.mobileNumber}</Typography>
                </Box>
              )}
              {data?.role && (
                <Box className='flex items-center gap-2'>
                  <Icon
                    icon={roleOptions.find(role => role.value === data.role)?.icon || 'mdi:user-outline'}
                    fontSize={23}
                    color={theme.palette.secondary.main}
                  />
                  <Typography className='font-medium'>{data.role}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          {data?.status && (
            <CustomChip
              size='lg'
              label={data.status}
              color={data.status === 'Active' ? 'success' : 'error'}
              colorVariant={data.status === 'Active' ? 'success' : 'error'}
              variant='tonal'
              rounded='less'
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader