import { Icon } from '@iconify/react'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
export const RIYAL_SYMBOL = '﷼'

export const RiyalIcon = ({ width = '1rem', color = '#6D6D6D' }) => (
  <Icon icon="lucide:saudi-riyal" width={width} color={color} />
  // hugeicons:saudi-riyal
)

export const formatCurrency = (amount, color = 'text.primary') => {

  const theme = useTheme()

  return (
    <span className="inline-flex items-end gap-0.1 min-w-[48px] justify-start">
      <RiyalIcon width='0.65rem' color='text.secondary' />
      <Typography
        component='span'
        color={color || theme.vars.palette.text.secondary}
        className='text-[0.9rem] font-medium'
        lineHeight={0.8}
      >
        {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </Typography>
    </span>
  )
}