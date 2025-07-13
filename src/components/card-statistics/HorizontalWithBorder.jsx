'use client'

// MUI Imports
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { Icon } from '@iconify/react'
//Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'
import { useTheme } from '@mui/material/styles'

const Card = styled(MuiCard)(({ color }) => ({
  transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
  borderBottomWidth: '2px',
  borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
  '[data-skin="bordered"] &:hover': {
    boxShadow: 'none'
  },
  '&:hover': {
    borderBottomWidth: '3px',
    borderBottomColor: `var(--mui-palette-${color}-main) !important`,
    boxShadow: 'var(--mui-customShadows-xl)',
    marginBlockEnd: '-1px'
  }
}))

const HorizontalWithBorder = props => {
  // Props
  const { title, subtitle,  titleVariant, subtitleVariant, stats, trendNumber, avatarIcon, color, iconSize, statsVariant,trendNumberVariant, fontSize, isCurrency, currencyIconWidth = '1rem' } = props
  const theme = useTheme()
  
  return (
   <Card color={color || 'primary'} className='bg-transparent border rounded shadow-none'>
   {/* <Card color={color || 'primary'}> */}

      <CardContent className='flex flex-col gap-4 p-4 pb-2'>
        <div className='flex items-center gap-4 '>
          <CustomAvatar color={color} skin='light' variant='rounded' size='small' className='p-1'>
            <Icon icon={avatarIcon} style={{fontSize: iconSize}}/>

          </CustomAvatar>
          {isCurrency ? (
            <div className="flex items-center gap-1 min-w-[48px] justify-center">
              <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={currencyIconWidth} />
              <Typography 
                color="text.primary" 
                variant={statsVariant || 'h4'} 
              
              >
                {Number(stats || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </div>
          ) : (
            <Typography variant={ statsVariant || 'h4'} fontSize={ fontSize || '1.25rem'}>
              {stats}
            </Typography>
          )}
        </div>
        <div className='flex flex-col justify-center gap-0'>
          <Typography variant={ titleVariant || 'h4'}>{title}</Typography>
          <div className='flex items-center gap-2 '>

          {/* <i className={trendNumber > 0 ? 'icon-[mdi--keyboard-arrow-up]' : trendNumber < 0 ? 'mdi--keyboard-arrow-down' : 'mdi--minus-thick'} style={{fontSize: iconSize}}/> */}

            <Typography variant={ subtitleVariant || 'body2'} >
              {subtitle}
            </Typography>
            <Typography variant={ trendNumberVariant || 'body2'}>{trendNumber}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HorizontalWithBorder
