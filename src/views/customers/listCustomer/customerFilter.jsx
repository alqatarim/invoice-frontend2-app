'use client'

import React, { useCallback, useMemo } from 'react'
import TextField from '@mui/material/TextField'
import { debounce } from '@/utils/debounce'

const CustomerFilter = ({ value, onChange, placeholder = 'Search customers...' }) => {
  // Memoize the debounced handler so it doesn't recreate on every render
  const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange])

  const handleChange = useCallback(
    (e) => {
      debouncedOnChange(e.target.value)
    },
    [debouncedOnChange]
  )

  return (
    <TextField
         className="w-full sm:w-64 md:w-80 lg:w-96"
      value={value}
      onChange={handleChange}
      size='small'
      placeholder={placeholder}
      fullWidth
      variant='outlined'
      inputProps={{ 'aria-label': 'Search customers' }}
    />
  )
}

export default CustomerFilter