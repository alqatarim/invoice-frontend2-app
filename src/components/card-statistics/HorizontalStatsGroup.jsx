'use client'

// MUI Imports
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { useMemo } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'
import { useTheme } from '@mui/material/styles'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const Card = styled(MuiCard)(({ theme, bordercolor }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: theme.palette[bordercolor].darkerOpacity || theme.palette[bordercolor].light,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `${theme.palette[bordercolor].main} !important`,
    boxShadow: 'var(--mui-customShadows-xl)',
    marginBlockEnd: '-1px'
  }
}))

const HorizontalStatsGroup = ({ stats, totalAmount: propTotalAmount, borderColor = 'primary', ...props }) => {
  const theme = useTheme()
  console.log('COLORS!!!')

  if (!stats || !Array.isArray(stats)) {
    return null
  }

  // Use provided total amount or calculate from stats as fallback
  const totalAmount = propTotalAmount || stats.reduce((sum, stat) => sum + Number(stat.stats || 0), 0)
  
  // Create segments with percentages, only include those with values > 0
  const segments = useMemo(() => {
    const minPercentage = 10 // Minimum percentage for segments with values > 0
    const rawSegments = stats.map(stat => {
      const value = Number(stat.stats || 0)
      const rawPercentage = totalAmount > 0 ? ((value / totalAmount) * 100) : 0
      const percentage = value > 0 ? Math.max(rawPercentage, minPercentage) : 0

      return {
        ...stat,
        value,
        percentage,
        // Set default color opacity if not provided
        colorOpacity: stat.colorOpacity || 'Main'
      }
    }).filter(segment => segment.value > 0)

    // Check if total exceeds 100% and scale down proportionally if needed
    const totalPercentage = rawSegments.reduce((sum, segment) => sum + segment.percentage, 0)
    return totalPercentage > 100 
      ? rawSegments.map(segment => ({
          ...segment,
          percentage: (segment.percentage / totalPercentage) * 100
        }))
      : rawSegments
  }, [stats, totalAmount])

  
  return (

        <Box className='flex flex-col gap-4 p-6'>


        

          {/* Segmented Progress Bar */}
          <div className='flex is-full'>
            {segments.map((segment, index) => (
              <div
                key={index}
                className={classnames('flex flex-col gap-[8px] relative')}
                style={{ width: `${segment.percentage}%` }}
              >
                <Typography 
                  className='relative max-sm:hidden text-start text-sm pl-1 font-medium'
                  variant='subtitle2'
                  color={`${segment.color}.dark`}
                >
                  {segment.title}
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={-1}
                  // className={`bs-[46px] bg-${segment.color}${segment.colorOpacity}`}
                  className={`bs-[46px] bg-${segment.color}${segment.colorOpacity} font-medium`}
                  sx={{
                    borderRadius: index === 0 ? '8px 0 0 8px' : index === segments.length - 1 ? '0 8px 8px 0' : '0',
                  }}
                />
                <Box
                  className={`absolute bottom-3 start-2 font-medium flex items-center gap-1`}
             
                >
                  {segment.isCurrency && (
                    <Icon
                    color={theme.palette[segment.color].dark}
                      icon="lucide:saudi-riyal"
                      width="0.85rem"s
                      // className={`text-${segment.color}LightOpacity`}
               
                    />
                  )}
                  <Typography
                    variant='body2'
                    color={`${segment.color}.dark`}
                    className={`font-semibold`}
                  >
                    {segment.isCurrency 
                      ? Number(segment.value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : segment.value
                    }
                  </Typography>

                  <Typography
                  variant='body2'
                  color={`${segment.color}.dark`}
                    className='font-semibold'
                    sx={{
                      // color: theme => theme.palette.getContrastText(theme.palette[segment.color][segment.colorOpacity])
                    }}>

                    ({segment.trendNumber})
                  </Typography>
                </Box>
              </div>
            ))}
          </div>

            {/* Total Amount Display */}
            <Box className='flex justify-start items-center gap-3'>
            <Typography variant='body2' className='text-sm'>
              Total Amount
            </Typography>
            <Box className='flex items-center gap-1'>
              <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width="1rem" />
              <Typography variant='h6' color='text.secondary'>
                {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>

        </Box>
   
 
  )
}

export default HorizontalStatsGroup
