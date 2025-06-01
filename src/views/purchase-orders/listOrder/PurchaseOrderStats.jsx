'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Skeleton
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const PurchaseOrderStats = ({ stats, loading }) => {
  const statsData = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <OrderIcon />,
      color: 'primary'
    },
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: <PendingIcon />,
      color: 'info'
    },
    {
      title: 'Due Soon',
      value: stats?.dueSoonOrders || 0,
      icon: <WarningIcon />,
      color: 'warning'
    },
    {
      title: 'Overdue',
      value: stats?.overdueOrders || 0,
      icon: <WarningIcon />,
      color: 'error'
    },
    {
      title: 'Total Amount',
      value: `$${(stats?.totalAmount || 0).toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: 'success'
    }
  ];

  if (loading) {
    return (
      <Grid container spacing={2} className="mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card>
              <CardContent className="text-center">
                <Skeleton variant="circular" width={40} height={40} className="mx-auto mb-2" />
                <Skeleton variant="text" width="80%" className="mx-auto" />
                <Skeleton variant="text" width="60%" className="mx-auto" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} className="mb-4">
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.shadows[4]
              }
            }}
          >
            <CardContent className="text-center p-4">
              <Box className="mb-2">
                <Chip
                  icon={stat.icon}
                  label=""
                  color={stat.color}
                  variant="filled"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    '& .MuiChip-icon': {
                      fontSize: '1.5rem',
                      margin: 0
                    },
                    '& .MuiChip-label': {
                      display: 'none'
                    }
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PurchaseOrderStats;