import { Icon } from '@iconify/react'
import { Typography } from '@mui/material'

export const formatCurrency = (amount) => {
  return (
    <div className="flex items-center gap-1 min-w-[48px] justify-center">
      <Icon icon="lucide:saudi-riyal" width="1rem" color="#6D6D6D" />
      <Typography color="text.primary" className='text-[0.9rem] font-medium'>
        {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>
    </div>
  )
}