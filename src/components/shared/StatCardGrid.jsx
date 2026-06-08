'use client'

import React from 'react'
import { Grid } from '@mui/material'
import HorizontalWithoutBorder from '@/components/card-statistics/HorizontalWithoutBorder'

const StatCardGrid = ({ cards = [], className = 'mb-2' }) => {
  if (!cards.length) {
    return null
  }

  return (
    <div className={className}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {cards.map(card => (
          <Grid key={card.title} size={{ xs: 6, sm: 6, md: 3 }}>
            <HorizontalWithoutBorder compact {...card} />
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

export default StatCardGrid
