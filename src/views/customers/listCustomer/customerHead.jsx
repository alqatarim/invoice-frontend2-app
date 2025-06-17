'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material'
import { Icon } from '@iconify/react'

const CustomerHead = ({ customerListData = {}, currencyData = '', isLoading = false }) => {
  const {
    totalCustomers = 0,
    activeCustomers = 0,
    inactiveCustomers = 0,
  } = customerListData

  const cardData = [
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: 'tabler:users',
      color: 'primary',
      bgColor: 'primary.light',
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      icon: 'tabler:user-check',
      color: 'success',
      bgColor: 'success.light',
    },
    {
      title: 'Inactive Customers',
      value: inactiveCustomers,
      icon: 'tabler:user-off',
      color: 'warning',
      bgColor: 'warning.light',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cardData.map((_, index) => (
          <Card key={index}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={60} height={32} />
                </div>
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cardData.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" color="text.secondary" className="mb-1">
                  {card.title}
                </Typography>
                <Typography variant="h5" className="font-semibold">
                  {card.value.toLocaleString()}
                </Typography>
              </div>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: card.bgColor,
                  color: card.color + '.main',
                }}
              >
                <Icon icon={card.icon} fontSize="1.5rem" />
              </Box>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default CustomerHead