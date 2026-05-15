import { Icon } from '@iconify/react'
import { Typography } from '@mui/material'

export const RIYAL_SYMBOL = '﷼'

export const RiyalIcon = ({ width = '1rem', color = '#6D6D6D' }) => (
  <Icon icon="lucide:saudi-riyal" width={width} color={color} />
  // hugeicons:saudi-riyal
)

export const formatCurrency = (amount, color = 'text.primary') => {
  return (
    <span className="inline-flex items-center gap-0.5 min-w-[48px] justify-start">
      <RiyalIcon />
      <Typography
        component='span'
        color={color || 'text.primary'}
        className='text-[0.9rem] font-medium'
      >
        {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </Typography>
    </span>
  )
}